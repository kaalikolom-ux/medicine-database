import { useState, useEffect, useMemo } from 'react';
import { Search, Pill, Building2, Globe2, ShieldCheck, ArrowUpDown, Sparkles, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { searchMedicines } from './services/medicineService';
import { isSupabaseConfigured } from './lib/supabase';
import { MedicineDetailsModal } from './components/medicine/MedicineDetailsModal';
import { AdvancedFilterDrawer } from './components/medicine/AdvancedFilterDrawer';
import type { MedicineDirectoryItem } from './types/database.types';

export function App() {
  const [medicines, setMedicines] = useState<MedicineDirectoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedDosageForm, setSelectedDosageForm] = useState<string>('');
  const [selectedTherapeuticClass, setSelectedTherapeuticClass] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineDirectoryItem | null>(null);

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
          pageSize: 60,
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
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCountry, selectedDosageForm, selectedTherapeuticClass]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-700 p-2 rounded-xl shadow-inner">
              <Pill className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Worldwide Medicine Directory</h1>
              <p className="text-xs text-emerald-200">Priority Listing: Bangladesh Pharmaceuticals First</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isSupabaseConfigured 
                ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-400/30' 
                : 'bg-amber-900/80 text-amber-200 border border-amber-400/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {isSupabaseConfigured ? 'Supabase Connected' : 'Demo Mode (Mock Data)'}
            </span>
          </div>
        </div>
      </header>

      {/* Hero & Search Section */}
      <section className="bg-white border-b border-slate-200 shadow-sm py-5 px-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Custom Sorting: <strong>Bangladesh (0)</strong> &rarr; <strong>Country (A-Z)</strong> &rarr; <strong>Brand (A-Z)</strong></span>
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
                <span className="w-5 h-5 rounded-full bg-emerald-400 text-emerald-950 font-bold text-[10px] inline-flex items-center justify-center ml-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search brand (e.g. Napa, Seclo), generic (e.g. Paracetamol), or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none text-slate-900 text-sm transition"
            />
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

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-600">
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
            <p className="mt-3 text-sm">Loading medicines...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No medicines found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search query or reset your filters.</p>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.map((med) => {
              const isBd = med.producer_country.toLowerCase() === 'bangladesh';
              return (
                <div
                  key={med.medicine_id}
                  onClick={() => setSelectedMedicine(med)}
                  className={`group relative rounded-2xl border p-5 transition-all cursor-pointer shadow-sm hover:shadow-lg bg-white flex flex-col justify-between hover:-translate-y-0.5 ${
                    isBd 
                      ? 'border-emerald-200 ring-1 ring-emerald-50 hover:border-emerald-400' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Badge: Priority / Country */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 group-hover:text-emerald-700 transition">
                        {med.brand_name}
                        <span className="text-xs font-normal text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                          {med.strength}
                        </span>
                      </h2>
                      <p className="text-xs font-medium text-emerald-700 mt-0.5 flex items-center gap-1">
                        <Pill className="w-3 h-3" />
                        {med.generic_name}
                      </p>
                    </div>

                    {isBd ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300/60 shadow-sm shrink-0">
                        🇧🇩 BD Priority
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 shrink-0">
                        <Globe2 className="w-3 h-3" />
                        {med.producer_country}
                      </span>
                    )}
                  </div>

                  {/* Form, Package & Indications preview */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dosage Form:</span>
                      <span className="font-semibold text-slate-700">{med.dosage_form}</span>
                    </div>
                    {med.therapeutic_class && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Class:</span>
                        <span className="font-medium text-slate-700 truncate max-w-[180px]">{med.therapeutic_class}</span>
                      </div>
                    )}
                    {med.indications && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 pt-1 border-t border-slate-200/60">
                        {med.indications}
                      </p>
                    )}
                  </div>

                  {/* Footer: Producer & Price */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
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
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Medicine Details Modal */}
      <MedicineDetailsModal
        medicine={selectedMedicine}
        onClose={() => setSelectedMedicine(null)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Medicine Database &bull; Built for Cloudflare Pages & Android (Capacitor)</span>
          </div>
          <p className="text-slate-500">&copy; {new Date().getFullYear()} Worldwide Medicine Directory</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
