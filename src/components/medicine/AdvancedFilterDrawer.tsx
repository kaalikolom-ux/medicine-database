import { X, RotateCcw, Stethoscope } from 'lucide-react';

interface AdvancedFilterDrawerProps {
  selectedDosageForm: string;
  onSelectDosageForm: (form: string) => void;
  selectedTherapeuticClass: string;
  onSelectTherapeuticClass: (tClass: string) => void;
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

const DOSAGE_FORMS = [
  'All Forms',
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Injection',
  'Eye Drops',
  'Inhaler',
];

const THERAPEUTIC_CLASSES = [
  'All Classes',
  'Analgesics & Antipyretics',
  'Proton Pump Inhibitor (PPI)',
  'Cephalosporin Antibiotics',
  'Macrolide Antibiotic',
  'Quinolone Antibiotics',
  'Antihistamines',
  'Leukotriene Receptor Antagonist',
  'Antihypertensive (ARB)',
  'Antidiabetic (Biguanide)',
  'NSAIDs',
  'Antifungal',
  'Ophthalmic Lubricant / Artificial Tears',
];

const COUNTRIES = [
  'All Countries',
  'Bangladesh',
  'India',
  'United Kingdom',
  'United States',
  'Switzerland',
  'France',
];

export function AdvancedFilterDrawer({
  selectedDosageForm,
  onSelectDosageForm,
  selectedTherapeuticClass,
  onSelectTherapeuticClass,
  selectedCountry,
  onSelectCountry,
  onResetFilters,
  activeFilterCount,
}: AdvancedFilterDrawerProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Stethoscope className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Advanced Medicine Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              {activeFilterCount} active
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 1. Dosage Form Quick Chips */}
      <div>
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
          Dosage Form (ডোজ ফর্ম)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DOSAGE_FORMS.map((form) => {
            const isSelected =
              (form === 'All Forms' && !selectedDosageForm) ||
              selectedDosageForm.toLowerCase() === form.toLowerCase();

            return (
              <button
                key={form}
                onClick={() => onSelectDosageForm(form === 'All Forms' ? '' : form)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {form}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dropdown Filters (Therapeutic Class & Country) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Therapeutic Class Dropdown */}
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
            Therapeutic Class (থেরাপিউটিক ক্লাস)
          </label>
          <div className="relative">
            <select
              value={selectedTherapeuticClass}
              onChange={(e) => onSelectTherapeuticClass(e.target.value)}
              aria-label="Filter by Therapeutic Class"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
            >
              {THERAPEUTIC_CLASSES.map((cls) => (
                <option key={cls} value={cls === 'All Classes' ? '' : cls}>
                  {cls}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Country Dropdown */}
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
            Country Priority (দেশ)
          </label>
          <div className="relative">
            <select
              value={selectedCountry}
              onChange={(e) => onSelectCountry(e.target.value)}
              aria-label="Filter by Country Priority"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country === 'All Countries' ? '' : country}>
                  {country === 'Bangladesh' ? '🇧🇩 Bangladesh (Priority)' : country}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Active:</span>
          {selectedDosageForm && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              Form: {selectedDosageForm}
              <button onClick={() => onSelectDosageForm('')} aria-label="Remove dosage form filter">
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}
          {selectedTherapeuticClass && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">
              Class: {selectedTherapeuticClass}
              <button onClick={() => onSelectTherapeuticClass('')} aria-label="Remove therapeutic class filter">
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}
          {selectedCountry && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
              Country: {selectedCountry}
              <button onClick={() => onSelectCountry('')} aria-label="Remove country filter">
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
