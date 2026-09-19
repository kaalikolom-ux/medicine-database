import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Pill, Building2, Globe2, ArrowUpDown, 
  Sparkles, SlidersHorizontal, ChevronRight, X, Bookmark, FileText
} from 'lucide-react';
import { searchMedicines } from './services/medicineService';
import { isSupabaseConfigured } from './lib/supabase';
import { MedicineDetailsModal } from './components/medicine/MedicineDetailsModal';
import { AdvancedFilterDrawer } from './components/medicine/AdvancedFilterDrawer';
import { BottomNav, type NavTab } from './components/layout/BottomNav';
import { GenericsView } from './components/views/GenericsView';
import { CompaniesView } from './components/views/CompaniesView';
import { SavedMedicinesView } from './components/views/SavedMedicinesView';
import { AboutView } from './components/views/AboutView';
import { AdminView } from './components/admin/AdminView';
import type { MedicineDirectoryItem } from './types/database.types';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('explore');
  const [medicines, setMedicines] = useState<MedicineDirectoryItem[]>([]);
  const [allMedicines, setAllMedicines] = useState<MedicineDirectoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedDosageForm, setSelectedDosageForm] = useState<string>('');
  const [selectedTherapeuticClass, setSelectedTherapeuticClass] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineDirectoryItem | null>(null);

  // Saved / Bookmarked medicines (persisted to localStorage)
  const [savedMedicines, setSavedMedicines] = useState<MedicineDirectoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('saved_medicines_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const savedIds = useMemo(() => {
    return new Set(savedMedicines.map((m) => m.medicine_id));
  }, [savedMedicines]);

  const toggleSave = useCallback((med: MedicineDirectoryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedMedicines((prev) => {
      const exists = prev.some((m) => m.medicine_id === med.medicine_id);
      let updated;
      if (exists) {
        updated = prev.filter((m) => m.medicine_id !== med.medicine_id);
      } else {
        updated = [med, ...prev];
      }
      try {
        localStorage.setItem('saved_medicines_v1', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      return updated;
    });
  }, []);

  const handleRemoveSaved = useCallback((id: string) => {
    setSavedMedicines((prev) => {
      const updated = prev.filter((m) => m.medicine_id !== id);
      try {
        localStorage.setItem('saved_medicines_v1', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update localStorage:', err);
      }
      return updated;
    });
  }, []);

  const handleClearAllSaved = useCallback(() => {
    setSavedMedicines([]);
    try {
      localStorage.removeItem('saved_medicines_v1');
    } catch (err) {
      console.error('Failed to clear localStorage:', err);
    }
  }, []);

  // Fetch all medicines on initial mount to populate Generics and Companies views
  useEffect(() => {
    let isMounted = true;
    searchMedicines({ pageSize: 150 })
      .then((data) => {
        if (isMounted) setAllMedicines(data);
      })
      .catch((err) => console.error('Failed to preload medicines:', err));
    return () => { isMounted = false; };
  }, []);

  // Main filtered search
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchMedicines({
          searchQuery,
          country: selectedCountry || null,
          dosageForm: selectedDosageForm || null,
          therapeuticClass: selectedTherapeuticClass || null,
          pageSize: 100,
        });
        if (isMounted) {
          setMedicines(results);
        }
      } catch (err) {
        console.error('Failed to load medicines:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCountry, selectedDosageForm, selectedTherapeuticClass]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCountry) count++;
    if (selectedDosageForm) count++;
    if (selectedTherapeuticClass) count++;
    return count;
  }, [selectedCountry, selectedDosageForm, selectedTherapeuticClass]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedDosageForm('');
    setSelectedTherapeuticClass('');
    setSearchQuery('');
  };

  // Build Country List with Bangladesh guaranteed FIRST, others A-Z
  const countryOptions = useMemo(() => {
    const countryCountMap = new Map<string, number>();
    const pool = allMedicines.length > 0 ? allMedicines : medicines;

    for (const med of pool) {
      const c = med.producer_country || 'Bangladesh';
      countryCountMap.set(c, (countryCountMap.get(c) || 0) + 1);
    }

    const uniqueCountries = Array.from(countryCountMap.keys()).filter(
      (c) => c.toLowerCase() !== 'bangladesh'
    ).sort();

    return [
      { name: 'Bangladesh', label: '🇧🇩 Bangladesh (Priority)', count: countryCountMap.get('Bangladesh') || 0 },
      ...uniqueCountries.map((c) => ({
        name: c,
        label: `🌐 ${c}`,
        count: countryCountMap.get(c) || 0,
      })),
    ];
  }, [allMedicines, medicines]);

  // Handlers for switching views from tabs
  const handleSelectGenericFromView = (genericName: string) => {
    setSearchQuery(genericName);
    setSelectedCountry('');
    setSelectedDosageForm('');
    setSelectedTherapeuticClass('');
    setCurrentTab('explore');
  };

  const handleSelectCompanyFromView = (companyName: string) => {
    setSearchQuery(companyName);
    setSelectedCountry('');
    setSelectedDosageForm('');
    setSelectedTherapeuticClass('');
    setCurrentTab('explore');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Top Header */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div 
            onClick={() => setCurrentTab('explore')} 
            className="flex items-center space-x-2.5 cursor-pointer select-none"
          >
            <div className="bg-emerald-700 p-2 rounded-xl shadow-inner">
              <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold tracking-tight">Worldwide Medicine Directory</h1>
              <p className="text-[11px] text-emerald-200 hidden sm:block">Priority Listing: Bangladesh Pharmaceuticals First</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentTab('admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                currentTab === 'admin'
                  ? 'bg-white text-emerald-950 ring-2 ring-emerald-300'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-300" />
              <span>প্রেসক্রিপশন প্যাড (Rx Pad)</span>
            </button>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              isSupabaseConfigured 
                ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-400/30' 
                : 'bg-amber-900/80 text-amber-200 border border-amber-400/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="hidden sm:inline">{isSupabaseConfigured ? 'Connected' : 'Demo'}</span>
            </span>
          </div>
        </div>
      </header>


      {/* VIEW: EXPLORE (Main Priority Medicine Search) */}
      {currentTab === 'explore' && (
        <>
          {/* Search & Country Filter Section */}
          <section className="bg-white border-b border-slate-200 shadow-sm py-4 px-4 sticky top-[57px] z-20">
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Custom Order: <strong>Bangladesh (0)</strong> &rarr; <strong>Country (A-Z)</strong> &rarr; <strong>Brand (A-Z)</strong></span>
                </div>

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    showAdvancedFilters || activeFilterCount > 0
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-emerald-400 text-emerald-950 font-bold text-[10px] inline-flex items-center justify-center ml-0.5">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Live Search Bar & Country Selector */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Instant Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search brand (e.g. Cardex, Seclo, Ciprox, Napa), generic, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none text-slate-900 text-xs sm:text-sm transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Country Priority Dropdown: Bangladesh Guaranteed First */}
                <div className="relative sm:w-60 shrink-0">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    aria-label="Filter by Country"
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 text-xs sm:text-sm appearance-none font-medium"
                  >
                    <option value="">All Countries ({allMedicines.length || medicines.length})</option>
                    {countryOptions.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.label} ({c.count})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
                <span className="text-slate-600 shrink-0 text-[11px] font-medium">Quick search:</span>
                {[
                  { label: 'Cardex (Heart/BP)', term: 'Cardex' },
                  { label: 'Seclo (Gastric)', term: 'Seclo' },
                  { label: 'Sergel (Gastric)', term: 'Sergel' },
                  { label: 'Ciprox (Antibiotic)', term: 'Ciprox' },
                  { label: 'Monas (Asthma)', term: 'Monas' },
                  { label: 'Bestcol (Cholesterol)', term: 'Bestcol' },
                  { label: 'Napa (Fever)', term: 'Napa' },
                  { label: '3Bion (Vitamin)', term: '3Bion' }
                ].map((item) => (
                  <button
                    key={item.term}
                    onClick={() => setSearchQuery(item.term)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg transition text-[11px] font-medium border ${
                      searchQuery.toLowerCase() === item.term.toLowerCase()
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Collapsible Advanced Filters Drawer */}
              {showAdvancedFilters && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <AdvancedFilterDrawer
                    selectedDosageForm={selectedDosageForm}
                    onSelectDosageForm={setSelectedDosageForm}
                    selectedTherapeuticClass={selectedTherapeuticClass}
                    onSelectTherapeuticClass={setSelectedTherapeuticClass}
                    selectedCountry={selectedCountry}
                    onSelectCountry={setSelectedCountry}
                    onResetFilters={handleResetFilters}
                    activeFilterCount={activeFilterCount}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Main Medicine Grid */}
          <main className="max-w-6xl mx-auto px-4 py-5 flex-1 w-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                Showing <span className="font-bold text-slate-900">{medicines.length}</span> medicines
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Priority Sorted</span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-3 text-sm">Searching directory...</p>
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-800">No medicines found</h3>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your search query or reset filters.</p>
                {(activeFilterCount > 0 || searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {medicines.map((med) => {
                  const isBd = med.producer_country.toLowerCase() === 'bangladesh';
                  const isSaved = savedIds.has(med.medicine_id);

                  return (
                    <div
                      key={med.medicine_id}
                      onClick={() => setSelectedMedicine(med)}
                      className={`group relative rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer shadow-sm hover:shadow-lg bg-white flex flex-col justify-between hover:-translate-y-0.5 ${
                        isBd 
                          ? 'border-emerald-200 ring-1 ring-emerald-50 hover:border-emerald-400' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Row: Brand, Strength, Priority Badge & Bookmark */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="pr-1">
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 group-hover:text-emerald-700 transition">
                            {med.brand_name}
                            <span className="text-xs font-normal text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                              {med.strength}
                            </span>
                          </h2>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectGenericFromView(med.generic_name);
                            }}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline mt-0.5 flex items-center gap-1 cursor-pointer group/gen text-left"
                            title={`Find all medicines with generic ${med.generic_name}`}
                          >
                            <Pill className="w-3 h-3 shrink-0 text-emerald-600 group-hover/gen:text-emerald-900" />
                            <span className="truncate max-w-[200px]">{med.generic_name}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isBd ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300 shadow-sm">
                              🇧🇩 BD Priority
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded-full border border-slate-200">
                              <Globe2 className="w-3 h-3" />
                              {med.producer_country}
                            </span>
                          )}

                          {/* Bookmark Button */}
                          <button
                            onClick={(e) => toggleSave(med, e)}
                            aria-label="Save medicine"
                            className={`p-1.5 rounded-lg transition ${
                              isSaved
                                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                                : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Dosage Form & Class */}
                      <div className="space-y-1 text-xs text-slate-600 mb-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dosage Form:</span>
                          <span className="font-semibold text-slate-700">{med.dosage_form}</span>
                        </div>
                        {med.therapeutic_class && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Class:</span>
                            <span className="font-medium text-slate-700 truncate max-w-[170px]">{med.therapeutic_class}</span>
                          </div>
                        )}
                        {med.indications && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 pt-1 border-t border-slate-200/60">
                            {med.indications}
                          </p>
                        )}
                      </div>

                      {/* Footer: Producer & Price */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium truncate max-w-[140px]" title={med.producer_name}>
                            {med.producer_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {med.price !== null && (
                            <div className="text-right">
                              <span className="text-sm font-bold text-slate-900">
                                {med.price.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-slate-500 ml-1 uppercase">
                                {med.currency}
                              </span>
                            </div>
                          )}
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition">
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </>
      )}

      {/* VIEW: GENERICS */}
      {currentTab === 'generics' && (
        <GenericsView
          medicines={allMedicines.length > 0 ? allMedicines : medicines}
          onSelectGeneric={handleSelectGenericFromView}
        />
      )}

      {/* VIEW: COMPANIES */}
      {currentTab === 'companies' && (
        <CompaniesView
          medicines={allMedicines.length > 0 ? allMedicines : medicines}
          onSelectCompany={handleSelectCompanyFromView}
        />
      )}

      {/* VIEW: SAVED / BOOKMARKS */}
      {currentTab === 'saved' && (
        <SavedMedicinesView
          savedMedicines={savedMedicines}
          onSelectMedicine={(med) => setSelectedMedicine(med)}
          onRemoveSaved={handleRemoveSaved}
          onClearAll={handleClearAllSaved}
          onExplore={() => setCurrentTab('explore')}
        />
      )}

      {/* VIEW: ADMIN & PRESCRIPTION PAD */}
      {currentTab === 'admin' && (
        <AdminView />
      )}

      {/* VIEW: ABOUT */}
      {currentTab === 'info' && (
        <AboutView totalMedicines={allMedicines.length || medicines.length} />
      )}


      {/* Medicine Details Modal */}
      <MedicineDetailsModal
        medicine={selectedMedicine}
        allMedicines={allMedicines.length > 0 ? allMedicines : medicines}
        onClose={() => setSelectedMedicine(null)}
        onSelectGeneric={handleSelectGenericFromView}
        onSelectMedicine={(med) => setSelectedMedicine(med)}
      />

      {/* Mobile Native Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        savedCount={savedMedicines.length}
      />
    </div>
  );
}

export default App;
