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
    <div className="min-h-screen bg-[#041418] text-slate-100 flex flex-col pb-24">
      {/* Top Header */}
      <header className="bg-[#061c21]/90 backdrop-blur-md text-white border-b border-[#12424b] shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div 
            onClick={() => setCurrentTab('explore')} 
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
          >
            <div className="bg-[#092b32] border border-[#145663] p-2 rounded-xl shadow-inner group-hover:border-teal-400 transition">
              <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-teal-300" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>মেডিসিন অন্বেষা</span>
                <span className="text-xs sm:text-sm font-normal text-teal-300 hidden md:inline">| Medicine Directory</span>
              </h1>
              <p className="text-[11px] text-teal-200/70 hidden sm:block">Priority Listing: বাংলাদেশ ফার্মাসিউটিক্যালস ফার্স্ট</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentTab('admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                currentTab === 'admin'
                  ? 'bg-teal-400 text-navy-950 ring-2 ring-teal-200'
                  : 'bg-gradient-to-r from-[#0d5c52] to-[#0a4841] hover:from-[#116e62] hover:to-[#0d5c52] text-white border border-teal-400/40 shadow-[0_0_12px_rgba(20,184,166,0.25)]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-teal-200" />
              <span>প্রেসক্রিপশন প্যাড (Rx Pad)</span>
            </button>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              isDbOffline
                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                : isSupabaseConfigured 
                  ? 'bg-[#092b32] text-teal-300 border border-teal-500/40' 
                  : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isDbOffline ? 'bg-amber-400 animate-pulse' : isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="hidden sm:inline">{isDbOffline ? 'Offline (21k Local DB)' : isSupabaseConfigured ? 'Connected' : 'Demo'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Remote Database Status / Unpause Notification Banner */}
      {isDbOffline && !dismissBanner && (
        <aside aria-label="Database Status Alert" className="bg-[#0b2830]/95 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between gap-3 shadow-inner backdrop-blur-md">
          <div className="flex items-center gap-2 max-w-5xl">
            <span className="text-base flex-shrink-0">⚠️</span>
            <div className="leading-relaxed">
              <span className="font-bold text-amber-300">Supabase ক্লাউড ডাটাবেজ সাময়িকভাবে পজ (Paused) রয়েছে:</span>{' '}
              <span>সার্চে কোনো সমস্যা নেই — অফলাইন ব্যাকআপ ইঞ্জিন থেকে <strong>২১,৬০০+ ওষুধের সম্পূর্ণ ডাটাবেজ</strong> লোড হচ্ছে। ক্লাউড ডাটাবেজ সচল করতে{' '}
                <a
                  href="https://supabase.com/dashboard/project/nxwjkawsnjrebxzdkedl"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-teal-300 hover:text-white decoration-teal-400 inline-flex items-center gap-1"
                >
                  Supabase ড্যাশবোর্ডে গিয়ে Restore করুন &nearr;
                </a>
              </span>
            </div>
          </div>
          <button
            onClick={() => setDismissBanner(true)}
            className="p-1 rounded-md text-amber-300 hover:text-white hover:bg-amber-900/40 transition flex-shrink-0 cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}


      {/* VIEW: EXPLORE (Main Priority Medicine Search) */}
      {currentTab === 'explore' && (
        <>
          {/* Hero Section styled after the reference dark petrol aesthetic */}
          <section className="relative px-4 pt-6 pb-2 sm:pt-8 sm:pb-4 overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
              {/* Top Glass Badge (like Quraner Bhashay card in user's image) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#08252c]/90 border border-[#144e53] backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                  <span>নির্ভরযোগ্য ওষুধ ও স্বাস্থ্য তথ্যভাণ্ডার</span>
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                </div>
                <p className="text-[11px] sm:text-xs text-teal-100/70 mt-1">
                  ব্র্যান্ড • জেনেরিক • ডোজ ও মাত্রা • ইন্ডিকেশনস • প্রস্তুতকারক • বাজারমূল্য
                </p>
                <p className="text-[11px] sm:text-xs text-amber-300/90 font-medium italic mt-1">
                  "সঠিক ওষুধ, সঠিক মাত্রা ও সচেতন স্বাস্থ্য সুরক্ষায় আপনার বিশ্বস্ত ডিজিটাল সহায়িকা"
                </p>
                <div className="flex items-center gap-2 pt-1.5 text-[10px] text-teal-300/90">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  <span>বাংলাদেশ ফার্স্ট প্রায়োরিটি ও অফলাইন ব্যাকআপ সম্বলিত ২১,৬০০+ ওষুধের ক্যাটালগ।</span>
                </div>
              </div>

              {/* Headline & Subtitle */}
              <div className="space-y-1 sm:space-y-1.5">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  আন্তর্জাতিক ও দেশীয় ওষুধ ডিরেক্টরি — মেডিসিন অন্বেষা
                </h2>
                <h3 className="text-base sm:text-xl font-bold text-teal-200">
                  ২১,৬০০+ ওষুধের সম্পূর্ণ তথ্যসহ
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed pt-1">
                  বাংলাদেশ ও আন্তর্জাতিক সব ধরণের ওষুধের জেনেরিক নাম, সেবনবিধি, পার্শ্বপ্রতিক্রিয়া, প্রস্তুতকারক ও নির্ভরযোগ্য বাজারমূল্য খুঁজুন এক ক্লিকে।
                </p>
              </div>

              {/* Navigation Pill Chips (styled like [কুরআন পাঠ] [অভিধান] [আর্টিকেল] [ড্যাশবোর্ড] in user's image) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const searchEl = document.getElementById('main-search-input');
                    searchEl?.focus();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0c2a31] hover:bg-[#113a44] border border-[#164e53] hover:border-teal-400 text-teal-100 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-teal-300" />
                  <span>ওষুধ সার্চ</span>
                </button>

                <button
                  onClick={() => setCurrentTab('generics')}
                  className="px-4 py-2 rounded-xl bg-[#0c2a31] hover:bg-[#113a44] border border-[#164e53] hover:border-teal-400 text-teal-100 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Pill className="w-3.5 h-3.5 text-teal-300" />
                  <span>জেনেরিক তালিকা</span>
                </button>

                <button
                  onClick={() => setCurrentTab('companies')}
                  className="px-4 py-2 rounded-xl bg-[#0c2a31] hover:bg-[#113a44] border border-[#164e53] hover:border-teal-400 text-teal-100 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-teal-300" />
                  <span>কোম্পানি ডিরেক্টরি</span>
                </button>

                <button
                  onClick={() => setCurrentTab('saved')}
                  className="px-4 py-2 rounded-xl bg-[#0c2a31] hover:bg-[#113a44] border border-[#164e53] hover:border-teal-400 text-teal-100 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-teal-300" />
                  <span>বুকমার্ক ({savedMedicines.length})</span>
                </button>
              </div>

              {/* Full Width Glowing CTA Button (like [লগইন করুন] in user's image) */}
              <button
                onClick={() => setCurrentTab('admin')}
                className="w-full py-2.5 sm:py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0d5c52] via-[#094e46] to-[#0d5c52] hover:from-[#116e62] hover:to-[#0d5c52] border border-teal-400/50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(20,184,166,0.3)] transition-all cursor-pointer group"
              >
                <Sparkles className="w-4 h-4 text-teal-300 group-hover:rotate-12 transition-transform" />
                <span>প্রেসক্রিপশন তৈরি ও প্রিন্ট করুন — প্রেসক্রিপশন প্যাড (Rx Pad)</span>
                <Sparkles className="w-4 h-4 text-teal-300 group-hover:-rotate-12 transition-transform" />
              </button>
            </div>
          </section>

          {/* Search & Country Filter Section */}
          <section className="bg-[#061e24]/90 backdrop-blur-md border-y border-[#12434c] shadow-lg py-4 px-4 sticky top-[57px] z-20">
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-300 bg-[#092b32] px-2.5 py-1 rounded-lg border border-[#145663]">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Custom Order: <strong className="text-white">Bangladesh (0)</strong> &rarr; <strong className="text-white">Country (A-Z)</strong> &rarr; <strong className="text-white">Brand (A-Z)</strong></span>
                </div>

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    showAdvancedFilters || activeFilterCount > 0
                      ? 'bg-teal-700 text-white border-teal-400 shadow-md'
                      : 'bg-[#0a2830] text-teal-100 border-[#144b54] hover:bg-[#0f343d]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-teal-400 text-navy-950 font-bold text-[10px] inline-flex items-center justify-center ml-0.5">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Live Search Bar & Country Selector */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Instant Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400/70" />
                  <input
                    id="main-search-input"
                    type="text"
                    placeholder="Search brand (e.g. Cardex, Seclo, Ciprox, Napa), generic, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-[#05171b] border border-[#134952] rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:outline-none text-white placeholder-teal-100/40 text-xs sm:text-sm transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-teal-400 hover:text-white rounded-full"
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
                    className="w-full pl-3 pr-8 py-2.5 bg-[#05171b] border border-[#134952] rounded-xl focus:ring-2 focus:ring-teal-400 focus:outline-none text-white text-xs sm:text-sm appearance-none font-medium cursor-pointer"
                  >
                    <option value="" className="bg-[#071f25] text-white">All Countries ({allMedicines.length || medicines.length})</option>
                    {countryOptions.map((c) => (
                      <option key={c.name} value={c.name} className="bg-[#071f25] text-white">
                        {c.label} ({c.count})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-teal-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
                <span className="text-teal-200/70 shrink-0 text-[11px] font-medium">Quick search:</span>
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
                        ? 'bg-teal-600 text-white border-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.4)]'
                        : 'bg-[#0a2830] hover:bg-[#0f353e] hover:border-teal-400/60 text-teal-100 border-[#144b54]'
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
              <p className="text-xs sm:text-sm font-medium text-teal-200/90">
                Showing <span className="font-bold text-white">{medicines.length}</span> medicines
              </p>
              <div className="flex items-center gap-1.5 text-xs text-teal-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Priority Sorted</span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-teal-300">
                <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-teal-200/80">Searching directory...</p>
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-16 bg-[#082228]/90 rounded-2xl border border-[#144e53] p-8 shadow-xl">
                <Pill className="w-12 h-12 text-teal-500/40 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white">No medicines found</h3>
                <p className="text-sm text-slate-300 mt-1">Try adjusting your search query or reset filters.</p>
                {(activeFilterCount > 0 || searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-[#0d5c52] to-[#0a4841] text-white rounded-xl text-xs font-semibold hover:from-[#116e62] transition shadow-md cursor-pointer"
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
                      className={`group relative rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] bg-[#082228]/85 hover:bg-[#0b2d35] backdrop-blur-md flex flex-col justify-between hover:-translate-y-0.5 ${
                        isBd 
                          ? 'border-[#145663] ring-1 ring-teal-500/30 hover:border-teal-400' 
                          : 'border-[#103a42] hover:border-teal-400/60'
                      }`}
                    >
                      {/* Top Row: Brand, Strength, Priority Badge & Bookmark */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="pr-1">
                          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5 group-hover:text-teal-300 transition">
                            {med.brand_name}
                            <span className="text-xs font-normal text-teal-300 px-2 py-0.5 bg-[#05171b] rounded-md border border-[#10434c]">
                              {med.strength}
                            </span>
                          </h2>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectGenericFromView(med.generic_name);
                            }}
                            className="text-xs font-semibold text-teal-400 hover:text-teal-200 hover:underline mt-0.5 flex items-center gap-1 cursor-pointer group/gen text-left"
                            title={`Find all medicines with generic ${med.generic_name}`}
                          >
                            <Pill className="w-3 h-3 shrink-0 text-teal-400 group-hover/gen:text-teal-200" />
                            <span className="truncate max-w-[200px]">{med.generic_name}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isBd ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/40 shadow-sm">
                              🇧🇩 BD Priority
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[#05171b] text-teal-200/80 px-2 py-1 rounded-full border border-[#10434c]">
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
                                ? 'text-amber-400 bg-amber-950/50 hover:bg-amber-900/50 border border-amber-500/40'
                                : 'text-teal-500/40 hover:text-teal-200 hover:bg-[#0c2a31]'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Dosage Form & Class */}
                      <div className="space-y-1 text-xs text-slate-300 mb-3 bg-[#05181c]/80 p-2.5 rounded-xl border border-[#0d343b]">
                        <div className="flex justify-between">
                          <span className="text-teal-300/60">Dosage Form:</span>
                          <span className="font-semibold text-teal-100">{med.dosage_form}</span>
                        </div>
                        {med.therapeutic_class && (
                          <div className="flex justify-between">
                            <span className="text-teal-300/60">Class:</span>
                            <span className="font-medium text-teal-200/90 truncate max-w-[170px]">{med.therapeutic_class}</span>
                          </div>
                        )}
                        {med.indications && (
                          <p className="text-[11px] text-slate-300 line-clamp-2 pt-1 border-t border-[#0d343b]/80">
                            {med.indications}
                          </p>
                        )}
                      </div>

                      {/* Footer: Producer & Price */}
                      <div className="pt-2.5 border-t border-[#0e3941] flex items-center justify-between text-xs mt-auto">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span className="font-medium truncate max-w-[140px]" title={med.producer_name}>
                            {med.producer_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {med.price !== null && (
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-amber-400">
                                {med.price.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-teal-200/60 ml-1 uppercase">
                                {med.currency}
                              </span>
                            </div>
                          )}
                          <div className="w-5 h-5 rounded-full bg-[#05181c] border border-[#10434c] flex items-center justify-center text-teal-300 group-hover:bg-teal-500 group-hover:text-navy-950 transition">
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
