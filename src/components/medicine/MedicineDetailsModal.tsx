import { useEffect, useState, useMemo } from 'react';
import {
  X,
  Pill,
  Building2,
  Globe2,
  AlertTriangle,
  ShieldCheck,
  FileText,
  ExternalLink,
  Activity,
  Info,
  Layers,
  Search,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import type { MedicineDirectoryItem } from '../../types/database.types';

interface MedicineDetailsModalProps {
  medicine: MedicineDirectoryItem | null;
  allMedicines?: MedicineDirectoryItem[];
  onClose: () => void;
  onSelectGeneric?: (genericName: string) => void;
  onSelectMedicine?: (medicine: MedicineDirectoryItem) => void;
}

export function MedicineDetailsModal({
  medicine,
  allMedicines = [],
  onClose,
  onSelectGeneric,
  onSelectMedicine,
}: MedicineDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'clinical' | 'dosage' | 'safety' | 'company' | 'similar'>('clinical');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Find all similar medicines by the same generic name from other manufacturers
  const similarMedicines = useMemo(() => {
    if (!medicine) return [];
    const normalizedGeneric = medicine.generic_name.trim().toLowerCase();

    return allMedicines
      .filter((m) => {
        const matchesGeneric = m.generic_name.trim().toLowerCase() === normalizedGeneric;
        const isDifferentBrand = m.medicine_id !== medicine.medicine_id;
        return matchesGeneric && isDifferentBrand;
      })
      .sort((a, b) => {
        // 1. Bangladesh First
        const aIsBd = a.producer_country.toLowerCase() === 'bangladesh' ? 0 : 1;
        const bIsBd = b.producer_country.toLowerCase() === 'bangladesh' ? 0 : 1;
        if (aIsBd !== bIsBd) return aIsBd - bIsBd;

        // 2. Country ASC
        const countryCompare = a.producer_country.localeCompare(b.producer_country);
        if (countryCompare !== 0) return countryCompare;

        // 3. Brand name ASC
        return a.brand_name.localeCompare(b.brand_name);
      });
  }, [medicine, allMedicines]);

  if (!medicine) return null;

  const isBd = medicine.producer_country.toLowerCase() === 'bangladesh';

  const handleGenericClick = () => {
    setActiveTab('similar');
  };

  const handleOpenInDirectory = (genericName: string) => {
    if (onSelectGeneric) {
      onSelectGeneric(genericName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {isBd ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-navy-200 text-navy-950 shadow-sm">
                🇧🇩 Bangladesh Priority
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                <Globe2 className="w-3.5 h-3.5" />
                {medicine.producer_country}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy-800/80 text-navy-100 border border-navy-700/50">
              {medicine.dosage_form}
            </span>
            {medicine.therapeutic_class && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy-800/80 text-navy-100 truncate max-w-[220px]">
                {medicine.therapeutic_class}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-baseline gap-2">
            {medicine.brand_name}
            <span className="text-sm sm:text-base font-normal text-navy-200">
              {medicine.strength}
            </span>
          </h2>

          {/* Clickable Generic Name with Search & Similar Brands Affordance */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-navy-200">
              <Pill className="w-4 h-4 text-navy-300 shrink-0" />
              <span>Generic:</span>
            </div>

            <button
              type="button"
              onClick={handleGenericClick}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-navy-800/70 hover:bg-navy-700 text-white font-bold text-xs sm:text-sm underline decoration-navy-300 underline-offset-4 transition cursor-pointer border border-navy-600/50 shadow-sm group"
              title="Click to view all alternative brands of this generic"
            >
              <span>{medicine.generic_name}</span>
              <Layers className="w-3.5 h-3.5 text-navy-300 group-hover:scale-110 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenInDirectory(medicine.generic_name)}
              className="inline-flex items-center gap-1 text-xs text-navy-100 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition cursor-pointer"
              title="Filter entire directory by this generic name"
            >
              <Search className="w-3 h-3" />
              <span>Search in Directory</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-navy-700/60 flex items-center justify-between text-xs text-navy-100">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-navy-300 shrink-0" />
              <span className="font-semibold text-white">{medicine.producer_name}</span>
            </div>
            {medicine.price !== null && (
              <div className="text-right">
                <span className="text-base font-extrabold text-white">
                  {medicine.price.toFixed(2)} {medicine.currency}
                </span>
                {medicine.package_info && (
                  <span className="text-navy-300 text-[11px] block">{medicine.package_info}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 text-xs font-semibold text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveTab('clinical')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'clinical'
                ? 'border-navy-700 text-navy-900 bg-white rounded-t-lg shadow-sm font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Indications (নির্দেশনা)</span>
          </button>

          <button
            onClick={() => setActiveTab('similar')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'similar'
                ? 'border-navy-700 text-navy-900 bg-white rounded-t-lg shadow-sm font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-navy-700" />
            <span>Similar Brands (বিকল্প ওষুধ)</span>
            {similarMedicines.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-navy-100 text-navy-800 rounded-full">
                {similarMedicines.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dosage')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'dosage'
                ? 'border-navy-700 text-navy-900 bg-white rounded-t-lg shadow-sm font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dosage (মাত্রা ও সেবনবিধি)</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'safety'
                ? 'border-navy-700 text-navy-900 bg-white rounded-t-lg shadow-sm font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Safety & Side Effects</span>
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'company'
                ? 'border-navy-700 text-navy-900 bg-white rounded-t-lg shadow-sm font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manufacturer (কোম্পানি)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* TAB: SIMILAR MEDICINES / ALTERNATIVE BRANDS */}
          {activeTab === 'similar' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-navy-50 to-slate-50 border border-navy-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-navy-950 flex items-center gap-1.5 text-sm">
                    <Layers className="w-4 h-4 text-navy-700" />
                    Similar Brands with Generic: <u>{medicine.generic_name}</u>
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Compare alternative brands produced by different Bangladeshi & global pharmaceutical manufacturers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenInDirectory(medicine.generic_name)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold shadow-sm transition shrink-0 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search All in Directory</span>
                </button>
              </div>

              {similarMedicines.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-500 flex justify-between px-1">
                    <span>Available Alternatives ({similarMedicines.length})</span>
                    <span>Sorted by: 🇧🇩 Bangladesh Priority</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {similarMedicines.map((simMed) => {
                      const simIsBd = simMed.producer_country.toLowerCase() === 'bangladesh';

                      return (
                        <div
                          key={simMed.medicine_id}
                          onClick={() => {
                            if (onSelectMedicine) {
                              onSelectMedicine(simMed);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 bg-white hover:shadow-md hover:-translate-y-0.5 ${
                            simIsBd
                              ? 'border-navy-200 hover:border-navy-400 bg-gradient-to-r from-navy-50/20 to-white'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-slate-900 text-sm hover:text-navy-700 transition">
                                {simMed.brand_name}
                              </h5>
                              <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                                {simMed.strength}
                              </span>
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {simMed.dosage_form}
                              </span>
                              {simIsBd ? (
                                <span className="text-[10px] font-bold bg-navy-100 text-navy-800 px-2 py-0.5 rounded-full">
                                  🇧🇩 Bangladesh
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                  🌐 {simMed.producer_country}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-medium truncate">{simMed.producer_name}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex items-center gap-2">
                            {simMed.price !== null && (
                              <div>
                                <span className="text-sm font-bold text-slate-900 block">
                                  {simMed.price.toFixed(2)} {simMed.currency}
                                </span>
                                <span className="text-[10px] text-slate-400 block max-w-[100px] truncate">
                                  {simMed.package_info}
                                </span>
                              </div>
                            )}
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-navy-100 hover:text-navy-800 transition">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No other loaded brands found for this generic.</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Search the full directory or live edge cache to discover more manufacturers.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenInDirectory(medicine.generic_name)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-800 text-white text-xs font-semibold hover:bg-navy-900 transition cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search "{medicine.generic_name}" in Full Directory</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: CLINICAL INDICATIONS */}
          {activeTab === 'clinical' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-navy-50/60 border border-navy-100 p-4 rounded-2xl">
                <h4 className="font-bold text-navy-900 mb-1.5 flex items-center gap-1.5 text-sm">
                  <Activity className="w-4 h-4 text-navy-700" />
                  Indications & Clinical Uses
                </h4>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {medicine.indications || 'Detailed clinical indications not specified. Consult your physician or medical guidelines.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Therapeutic Class</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{medicine.therapeutic_class || 'General Medicine'}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Form & Strength</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{medicine.dosage_form} &bull; {medicine.strength}</span>
                </div>
              </div>

              {/* Quick shortcut to Similar Brands */}
              <div
                onClick={() => setActiveTab('similar')}
                className="bg-slate-50 hover:bg-navy-50/60 border border-slate-200 hover:border-navy-300 p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition group"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-navy-700" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-navy-800">
                      Looking for alternatives?
                    </span>
                    <p className="text-[11px] text-slate-500">
                      View all medicines manufactured with {medicine.generic_name}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-navy-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          )}

          {/* TAB: DOSAGE */}
          {activeTab === 'dosage' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <h4 className="font-bold text-navy-950 mb-1.5 flex items-center gap-1.5 text-sm">
                  <FileText className="w-4 h-4 text-navy-700" />
                  Dosage & Administration (সেবনবিধি)
                </h4>
                <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
                  {medicine.dosage_and_administration || 'Standard dosage depends on age, weight, and condition severity. Follow the prescription of a registered physician.'}
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Always take medicines as directed by your doctor or pharmacist. Do not stop or alter dosage without professional consultation.</span>
              </div>
            </div>
          )}

          {/* TAB: SAFETY */}
          {activeTab === 'safety' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-2xl">
                <h4 className="font-bold text-rose-950 mb-1.5 flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Side Effects (পার্শ্বপ্রতিক্রিয়া)
                </h4>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {medicine.side_effects || 'Generally well-tolerated. Individual reactions may vary.'}
                </p>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl">
                <h4 className="font-bold text-amber-950 mb-1.5 flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Precautions & Warnings (সতর্কতা)
                </h4>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {medicine.precautions || 'Consult a doctor if pregnant, nursing, or if you have pre-existing renal or hepatic conditions.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB: COMPANY */}
          {activeTab === 'company' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{medicine.producer_name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Globe2 className="w-3.5 h-3.5" />
                      Country of Origin: <strong>{medicine.producer_country}</strong>
                    </p>
                  </div>
                  {isBd && (
                    <span className="text-xs font-bold text-navy-800 bg-navy-100 px-3 py-1 rounded-full border border-navy-300">
                      Bangladesh Manufacturer
                    </span>
                  )}
                </div>

                {medicine.producer_website && (
                  <a
                    href={medicine.producer_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-700 hover:text-navy-800 underline mt-2"
                  >
                    <span>Visit Official Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">ID: {medicine.medicine_id}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
