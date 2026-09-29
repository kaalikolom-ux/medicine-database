import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Pill, Building2, Globe2, ArrowUpDown, 
  Sparkles, SlidersHorizontal, ChevronRight, X, Bookmark, FileText
} from 'lucide-react';
import { searchMedicines, preloadFullLocalDataset, subscribeDatabaseStatus } from './services/medicineService';
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

  // Database connectivity & remote offline fallback state
  const [isDbOffline, setIsDbOffline] = useState<boolean>(false);
  const [dismissBanner, setDismissBanner] = useState<boolean>(false);

  useEffect(() => {
    return subscribeDatabaseStatus((offline) => {
      setIsDbOffline(offline);
    });
  }, []);

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
    preloadFullLocalDataset()
      .then((data) => {
        if (isMounted && data.length > 0) setAllMedicines(data);
      })
      .catch(() => {
        searchMedicines({ pageSize: 250 })
          .then((data) => {
            if (isMounted) setAllMedicines(data);
          })
          .catch((err) => console.error('Failed to preload medicines:', err));
      });
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
    <div className="min-h-screen bg-[#fbf8f2] text-stone-800 flex flex-col pb-24">
      {/* Top Header */}
      <header className="bg-[#f5efe4]/95 backdrop-blur-md text-stone-900 border-b border-[#dfd0b8] shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div 
            onClick={() => setCurrentTab('explore')} 
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
          >
            <div className="bg-[#ede3d3] border border-[#dfd0b8] p-2 rounded-xl shadow-inner group-hover:border-[#0f4c42] transition">
              <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-[#0f4c42]" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-[#1c1710] flex items-center gap-1.5">
                <span>মেডিসিন অন্বেষা</span>
                <span className="text-xs sm:text-sm font-normal text-[#0f4c42] hidden md:inline">| Medicine Directory</span>
              </h1>
              <p className="text-[11px] text-stone-600 hidden sm:block">Priority Listing: বাংলাদেশ ফার্মাসিউটিক্যালস ফার্স্ট</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentTab('admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-[#0f4c42] text-white ring-2 ring-[#0f4c42]/30'
                  : 'bg-[#0f4c42] hover:bg-[#0c3c34] text-white border border-[#0f4c42] shadow-sm'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-200" />
              <span>প্রেসক্রিপশন প্যাড (Rx Pad)</span>
            </button>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              isDbOffline
                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                : isSupabaseConfigured 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                  : 'bg-amber-50 text-amber-800 border border-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isDbOffline ? 'bg-amber-500 animate-pulse' : isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="hidden sm:inline">{isDbOffline ? 'Offline (21k Local DB)' : isSupabaseConfigured ? 'Connected' : 'Demo'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Remote Database Status / Unpause Notification Banner */}
      {isDbOffline && !dismissBanner && (
        <aside aria-label="Database Status Alert" className="bg-[#fef9c3] border-b border-amber-300 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2 max-w-5xl">
            <span className="text-base flex-shrink-0">⚠️</span>
            <div className="leading-relaxed">
              <span className="font-bold text-amber-950">Supabase ক্লাউড ডাটাবেজ সাময়িকভাবে পজ (Paused) রয়েছে:</span>{' '}
              <span>সার্চে কোনো সমস্যা নেই — অফলাইন ব্যাকআপ ইঞ্জিন থেকে <strong>২১,৬০০+ ওষুধের সম্পূর্ণ ডাটাবেজ</strong> লোড হচ্ছে। ক্লাউড ডাটাবেজ সচল করতে{' '}
                <a
                  href="https://supabase.com/dashboard/project/nxwjkawsnjrebxzdkedl"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-[#0f4c42] hover:text-[#0c3c34] decoration-[#0f4c42] inline-flex items-center gap-1"
                >
                  Supabase ড্যাশবোর্ডে গিয়ে Restore করুন &nearr;
                </a>
              </span>
            </div>
          </div>
          <button
            onClick={() => setDismissBanner(true)}
            className="p-1 rounded-md text-amber-800 hover:text-amber-950 hover:bg-amber-200/60 transition flex-shrink-0 cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}


      {/* VIEW: EXPLORE (Main Priority Medicine Search) */}
      {currentTab === 'explore' && (
        <>
          {/* Hero Section styled with warm creamy aesthetic */}
          <section className="relative px-4 pt-6 pb-2 sm:pt-8 sm:pb-4 overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
              {/* Top Glass Badge */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5efe4]/90 border border-[#dfd0b8] backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0f4c42]">
                  <Sparkles className="w-3.5 h-3.5 text-[#0f4c42] animate-pulse" />
                  <span>নির্ভরযোগ্য ওষুধ ও স্বাস্থ্য তথ্যভাণ্ডার</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#0f4c42] animate-pulse" />
                </div>
                <p className="text-[11px] sm:text-xs text-stone-600 mt-1">
                  ব্র্যান্ড • জেনেরিক • ডোজ ও মাত্রা • ইন্ডিকেশনস • প্রস্তুতকারক • বাজারমূল্য
                </p>
                <p className="text-[11px] sm:text-xs text-amber-800 font-medium italic mt-1">
                  "সঠিক ওষুধ, সঠিক মাত্রা ও সচেতন স্বাস্থ্য সুরক্ষায় আপনার বিশ্বস্ত ডিজিটাল সহায়িকা"
                </p>
                <div className="flex items-center gap-2 pt-1.5 text-[10px] text-stone-600">
                  <span className="w-2 h-2 rounded-full bg-[#0f4c42] animate-pulse"></span>
                  <span>বাংলাদেশ ফার্স্ট প্রায়োরিটি ও অফলাইন ব্যাকআপ সম্বলিত ২১,৬০০+ ওষুধের ক্যাটালগ।</span>
                </div>
              </div>

              {/* Headline & Subtitle */}
              <div className="space-y-1 sm:space-y-1.5">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1c1710] tracking-tight leading-tight">
                  আন্তর্জাতিক ও দেশীয় ওষুধ ডিরেক্টরি — মেডিসিন অন্বেষা
                </h2>
                <h3 className="text-base sm:text-xl font-bold text-[#0f4c42]">
                  ২১,৬০০+ ওষুধের সম্পূর্ণ তথ্যসহ
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed pt-1">
                  বাংলাদেশ ও আন্তর্জাতিক সব ধরণের ওষুধের জেনেরিক নাম, সেবনবিধি, পার্শ্বপ্রতিক্রিয়া, প্রস্তুতকারক ও নির্ভরযোগ্য বাজারমূল্য খুঁজুন এক ক্লিকে।
                </p>
              </div>

              {/* Navigation Pill Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const searchEl = document.getElementById('main-search-input');
                    searchEl?.focus();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#f5efe4] hover:bg-[#ede3d3] border border-[#dfd0b8] hover:border-[#0f4c42] text-stone-800 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#0f4c42]" />
                  <span>ওষুধ সার্চ</span>
                </button>

                <button
                  onClick={() => setCurrentTab('generics')}
                  className="px-4 py-2 rounded-xl bg-[#f5efe4] hover:bg-[#ede3d3] border border-[#dfd0b8] hover:border-[#0f4c42] text-stone-800 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Pill className="w-3.5 h-3.5 text-[#0f4c42]" />
                  <span>জেনেরিক তালিকা</span>
                </button>

                <button
                  onClick={() => setCurrentTab('companies')}
                  className="px-4 py-2 rounded-xl bg-[#f5efe4] hover:bg-[#ede3d3] border border-[#dfd0b8] hover:border-[#0f4c42] text-stone-800 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#0f4c42]" />
                  <span>কোম্পানি ডিরেক্টরি</span>
                </button>

                <button
                  onClick={() => setCurrentTab('saved')}
                  className="px-4 py-2 rounded-xl bg-[#f5efe4] hover:bg-[#ede3d3] border border-[#dfd0b8] hover:border-[#0f4c42] text-stone-800 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#0f4c42]" />
                  <span>বুকমার্ক ({savedMedicines.length})</span>
                </button>
              </div>

              {/* Full Width CTA Button */}
              <button
                onClick={() => setCurrentTab('admin')}
                className="w-full py-2.5 sm:py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0f4c42] via-[#145d52] to-[#0f4c42] hover:from-[#0c3c34] hover:to-[#0c3c34] border border-[#0f4c42] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer group"
              >
                <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
                <span>প্রেসক্রিপশন তৈরি ও প্রিন্ট করুন — প্রেসক্রিপশন প্যাড (Rx Pad)</span>
                <Sparkles className="w-4 h-4 text-amber-200 group-hover:-rotate-12 transition-transform" />
              </button>
            </div>
          </section>

          {/* Search & Country Filter Section */}
          <section className="bg-[#fbf8f2]/95 backdrop-blur-md border-y border-[#dfd0b8] shadow-sm py-4 px-4 sticky top-[57px] z-20">
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0f4c42] bg-[#f5efe4] px-2.5 py-1 rounded-lg border border-[#dfd0b8]">
                  <Sparkles className="w-3.5 h-3.5 text-[#0f4c42]" />
                  <span>Custom Order: <strong className="text-[#1c1710]">Bangladesh (0)</strong> &rarr; <strong className="text-[#1c1710]">Country (A-Z)</strong> &rarr; <strong className="text-[#1c1710]">Brand (A-Z)</strong></span>
                </div>

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    showAdvancedFilters || activeFilterCount > 0
                      ? 'bg-[#0f4c42] text-white border-[#0f4c42] shadow-sm'
                      : 'bg-[#f5efe4] text-stone-800 border-[#dfd0b8] hover:bg-[#ede3d3]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-900 font-bold text-[10px] inline-flex items-center justify-center ml-0.5">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Live Search Bar & Country Selector */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Instant Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="main-search-input"
                    type="text"
                    placeholder="Search brand (e.g. Cardex, Seclo, Ciprox, Napa), generic, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#dfd0b8] rounded-xl focus:ring-2 focus:ring-[#0f4c42] focus:border-[#0f4c42] focus:outline-none text-[#1c1710] placeholder-stone-400 text-xs sm:text-sm transition shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-full"
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
                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-[#dfd0b8] rounded-xl focus:ring-2 focus:ring-[#0f4c42] focus:outline-none text-[#1c1710] text-xs sm:text-sm appearance-none font-medium cursor-pointer shadow-sm"
                  >
                    <option value="" className="bg-white text-stone-900">All Countries ({allMedicines.length || medicines.length})</option>
                    {countryOptions.map((c) => (
                      <option key={c.name} value={c.name} className="bg-white text-stone-900">
                        {c.label} ({c.count})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
                <span className="text-stone-500 shrink-0 text-[11px] font-medium">Quick search:</span>
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
                    className={`shrink-0 px-2.5 py-1 rounded-xl transition text-[11px] font-medium border cursor-pointer ${
                      searchQuery.toLowerCase() === item.term.toLowerCase()
                        ? 'bg-[#0f4c42] text-white border-[#0f4c42] shadow-sm'
                        : 'bg-[#f5efe4] hover:bg-[#ede3d3] hover:border-[#0f4c42]/60 text-stone-700 border-[#dfd0b8]'
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
              <p className="text-xs sm:text-sm font-medium text-stone-600">
                Showing <span className="font-bold text-[#1c1710]">{medicines.length}</span> medicines
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#0f4c42] font-semibold">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Priority Sorted</span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#0f4c42]">
                <div className="w-8 h-8 border-4 border-[#0f4c42] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-stone-600">Searching directory...</p>
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#dfd0b8] p-8 shadow-sm">
                <Pill className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-[#1c1710]">No medicines found</h3>
                <p className="text-sm text-stone-600 mt-1">Try adjusting your search query or reset filters.</p>
                {(activeFilterCount > 0 || searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 bg-[#0f4c42] hover:bg-[#0c3c34] text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
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
                      className={`group relative rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer shadow-sm hover:shadow-md bg-white hover:bg-[#fdfbf7] flex flex-col justify-between hover:-translate-y-0.5 ${
                        isBd 
                          ? 'border-[#bbf7d0] ring-1 ring-[#10b981]/30 hover:border-[#10b981]' 
                          : 'border-[#e8dfd2] hover:border-[#c5af8e]'
                      }`}
                    >
                      {/* Top Row: Brand, Strength, Priority Badge & Bookmark */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="pr-1">
                          <h2 className="text-base sm:text-lg font-bold text-[#1c1710] tracking-tight flex items-center gap-1.5 group-hover:text-[#0f4c42] transition">
                            {med.brand_name}
                            <span className="text-xs font-normal text-[#0f4c42] px-2 py-0.5 bg-[#f5efe4] rounded-md border border-[#dfd0b8]">
                              {med.strength}
                            </span>
                          </h2>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectGenericFromView(med.generic_name);
                            }}
                            className="text-xs font-semibold text-[#0f4c42] hover:text-[#0c3c34] hover:underline mt-0.5 flex items-center gap-1 cursor-pointer group/gen text-left"
                            title={`Find all medicines with generic ${med.generic_name}`}
                          >
                            <Pill className="w-3 h-3 shrink-0 text-[#0f4c42] group-hover/gen:text-[#0c3c34]" />
                            <span className="truncate max-w-[200px]">{med.generic_name}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isBd ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300 shadow-xs">
                              🇧🇩 BD Priority
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[#f5efe4] text-stone-600 px-2 py-1 rounded-full border border-[#dfd0b8]">
                              <Globe2 className="w-3 h-3" />
                              {med.producer_country}
                            </span>
                          )}

                          {/* Bookmark Button */}
                          <button
                            onClick={(e) => toggleSave(med, e)}
                            aria-label="Save medicine"
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isSaved
                                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-300'
                                : 'text-stone-400 hover:text-stone-700 hover:bg-[#f5efe4]'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Dosage Form & Class */}
                      <div className="space-y-1 text-xs text-stone-700 mb-3 bg-[#f8f4ec] p-2.5 rounded-xl border border-[#ede3d3]">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Dosage Form:</span>
                          <span className="font-semibold text-[#1c1710]">{med.dosage_form}</span>
                        </div>
                        {med.therapeutic_class && (
                          <div className="flex justify-between">
                            <span className="text-stone-500">Class:</span>
                            <span className="font-medium text-stone-800 truncate max-w-[170px]">{med.therapeutic_class}</span>
                          </div>
                        )}
                        {med.indications && (
                          <p className="text-[11px] text-stone-600 line-clamp-2 pt-1 border-t border-[#ede3d3]">
                            {med.indications}
                          </p>
                        )}
                      </div>

                      {/* Footer: Producer & Price */}
                      <div className="pt-2.5 border-t border-[#ede3d3] flex items-center justify-between text-xs mt-auto">
                        <div className="flex items-center gap-1.5 text-stone-700">
                          <Building2 className="w-3.5 h-3.5 text-[#0f4c42] shrink-0" />
                          <span className="font-medium truncate max-w-[140px]" title={med.producer_name}>
                            {med.producer_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {med.price !== null && (
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-[#b45309]">
                                {med.price.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-stone-500 ml-1 uppercase">
                                {med.currency}
                              </span>
                            </div>
                          )}
                          <div className="w-5 h-5 rounded-full bg-[#f5efe4] border border-[#dfd0b8] flex items-center justify-center text-[#0f4c42] group-hover:bg-[#0f4c42] group-hover:text-white transition">
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
