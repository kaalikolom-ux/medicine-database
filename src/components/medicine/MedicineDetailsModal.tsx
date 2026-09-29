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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl bg-[#082228] text-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#144b54]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#041519] via-[#07252c] to-[#0a2f37] text-white p-5 sm:p-6 relative border-b border-[#12424b]">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {isBd ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm">
                🇧🇩 Bangladesh Priority
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#05171b] border border-[#10434c] text-teal-200">
                <Globe2 className="w-3.5 h-3.5 text-teal-400" />
                {medicine.producer_country}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#05171b] text-teal-300 border border-[#10434c]">
              {medicine.dosage_form}
            </span>
            {medicine.therapeutic_class && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#05171b] text-teal-200 truncate max-w-[220px] border border-[#10434c]">
                {medicine.therapeutic_class}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-baseline gap-2">
            {medicine.brand_name}
            <span className="text-sm sm:text-base font-normal text-teal-300">
              {medicine.strength}
            </span>
          </h2>

          {/* Clickable Generic Name with Search & Similar Brands Affordance */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-teal-200">
              <Pill className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Generic:</span>
            </div>

            <button
              type="button"
              onClick={handleGenericClick}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#092b32] hover:bg-[#0e3740] text-teal-200 hover:text-white font-bold text-xs sm:text-sm underline decoration-teal-400 underline-offset-4 transition cursor-pointer border border-[#145663] shadow-sm group"
              title="Click to view all alternative brands of this generic"
            >
              <span>{medicine.generic_name}</span>
              <Layers className="w-3.5 h-3.5 text-teal-300 group-hover:scale-110 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenInDirectory(medicine.generic_name)}
              className="inline-flex items-center gap-1 text-xs text-teal-100 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition cursor-pointer"
              title="Filter entire directory by this generic name"
            >
              <Search className="w-3 h-3" />
              <span>Search in Directory</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[#12424b] flex items-center justify-between text-xs text-teal-100">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="font-semibold text-white">{medicine.producer_name}</span>
            </div>
            {medicine.price !== null && (
              <div className="text-right">
                <span className="text-base font-extrabold text-amber-400">
                  {medicine.price.toFixed(2)} {medicine.currency}
                </span>
                {medicine.package_info && (
                  <span className="text-teal-200/70 text-[11px] block">{medicine.package_info}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#0e373e] bg-[#061c21] px-4 pt-2 gap-1 text-xs font-semibold text-teal-100/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('clinical')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'clinical'
                ? 'border-teal-400 text-teal-300 bg-[#082228] rounded-t-lg shadow-sm font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Indications (নির্দেশনা)</span>
          </button>

          <button
            onClick={() => setActiveTab('similar')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'similar'
                ? 'border-teal-400 text-teal-300 bg-[#082228] rounded-t-lg shadow-sm font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>Similar Brands (বিকল্প ওষুধ)</span>
            {similarMedicines.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#092b32] text-teal-300 border border-[#145663] rounded-full">
                {similarMedicines.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dosage')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'dosage'
                ? 'border-teal-400 text-teal-300 bg-[#082228] rounded-t-lg shadow-sm font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dosage (মাত্রা ও সেবনবিধি)</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'safety'
                ? 'border-teal-400 text-teal-300 bg-[#082228] rounded-t-lg shadow-sm font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Safety & Side Effects</span>
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'company'
                ? 'border-teal-400 text-teal-300 bg-[#082228] rounded-t-lg shadow-sm font-bold'
                : 'border-transparent hover:text-white'
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
              <div className="bg-[#061c21] border border-[#12424b] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-1.5 text-sm">
                    <Layers className="w-4 h-4 text-teal-400" />
                    Similar Brands with Generic: <u className="text-teal-300">{medicine.generic_name}</u>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Compare alternative brands produced by different Bangladeshi & global pharmaceutical manufacturers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenInDirectory(medicine.generic_name)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0d5c52] to-[#0a4841] hover:from-[#116e62] text-white text-xs font-semibold shadow-md transition shrink-0 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search All in Directory</span>
                </button>
              </div>

              {similarMedicines.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-teal-200/70 flex justify-between px-1">
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
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 bg-[#061c21] hover:bg-[#0a2f38] hover:-translate-y-0.5 shadow-md ${
                            simIsBd
                              ? 'border-[#145663] hover:border-teal-400'
                              : 'border-[#103a42] hover:border-teal-400/50'
                          }`}
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-white text-sm hover:text-teal-300 transition">
                                {simMed.brand_name}
                              </h5>
                              <span className="text-xs text-teal-300 font-medium px-2 py-0.5 bg-[#05171b] rounded border border-[#10434c]">
                                {simMed.strength}
                              </span>
                              <span className="text-xs text-slate-300 bg-[#05171b] px-2 py-0.5 rounded border border-[#10434c]">
                                {simMed.dosage_form}
                              </span>
                              {simIsBd ? (
                                <span className="text-[10px] font-bold bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                                  🇧🇩 Bangladesh
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium bg-[#05171b] text-teal-200/80 px-2 py-0.5 rounded-full border border-[#10434c]">
                                  🌐 {simMed.producer_country}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-300">
                              <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                              <span className="font-medium truncate">{simMed.producer_name}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex items-center gap-2">
                            {simMed.price !== null && (
                              <div>
                                <span className="text-sm font-bold text-amber-400 block">
                                  {simMed.price.toFixed(2)} {simMed.currency}
                                </span>
                                <span className="text-[10px] text-teal-200/60 block max-w-[100px] truncate">
                                  {simMed.package_info}
                                </span>
                              </div>
                            )}
                            <div className="w-7 h-7 rounded-full bg-[#05171b] border border-[#10434c] flex items-center justify-center text-teal-300 hover:bg-teal-500 hover:text-navy-950 transition">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-[#061c21] rounded-2xl border border-dashed border-[#12424b]">
                  <Pill className="w-8 h-8 text-teal-400/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">No other loaded brands found for this generic.</p>
                  <p className="text-xs text-slate-300 mt-1 mb-4">
                    Search the full directory or live edge cache to discover more manufacturers.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenInDirectory(medicine.generic_name)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0d5c52] to-[#0a4841] text-white text-xs font-semibold hover:from-[#116e62] transition cursor-pointer shadow-md"
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
              <div className="bg-[#061c21] border border-[#12424b] p-4 rounded-2xl">
                <h4 className="font-bold text-teal-200 mb-1.5 flex items-center gap-1.5 text-sm">
                  <Activity className="w-4 h-4 text-teal-400" />
                  Indications & Clinical Uses
                </h4>
                <p className="text-slate-200 leading-relaxed text-sm">
                  {medicine.indications || 'Detailed clinical indications not specified. Consult your physician or medical guidelines.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-[#061c21] border border-[#12424b] p-3.5 rounded-xl">
                  <span className="text-xs font-semibold text-teal-300/70 uppercase tracking-wider block">Therapeutic Class</span>
                  <span className="font-semibold text-white text-sm mt-0.5 block">{medicine.therapeutic_class || 'General Medicine'}</span>
                </div>
                <div className="bg-[#061c21] border border-[#12424b] p-3.5 rounded-xl">
                  <span className="text-xs font-semibold text-teal-300/70 uppercase tracking-wider block">Form & Strength</span>
                  <span className="font-semibold text-white text-sm mt-0.5 block">{medicine.dosage_form} &bull; {medicine.strength}</span>
                </div>
              </div>

              {/* Quick shortcut to Similar Brands */}
              <div
                onClick={() => setActiveTab('similar')}
                className="bg-[#061c21] hover:bg-[#0a2f38] border border-[#12424b] hover:border-teal-400/60 p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition group"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-teal-300">
                      Looking for alternatives?
                    </span>
                    <p className="text-[11px] text-teal-200/70">
                      View all medicines manufactured with {medicine.generic_name}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          )}

          {/* TAB: DOSAGE */}
          {activeTab === 'dosage' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#061c21] border border-[#12424b] p-4 rounded-2xl">
                <h4 className="font-bold text-teal-200 mb-1.5 flex items-center gap-1.5 text-sm">
                  <FileText className="w-4 h-4 text-teal-400" />
                  Dosage & Administration (সেবনবিধি)
                </h4>
                <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-line">
                  {medicine.dosage_and_administration || 'Standard dosage depends on age, weight, and condition severity. Follow the prescription of a registered physician.'}
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-200">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Always take medicines as directed by your doctor or pharmacist. Do not stop or alter dosage without professional consultation.</span>
              </div>
            </div>
          )}

          {/* TAB: SAFETY */}
          {activeTab === 'safety' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl">
                <h4 className="font-bold text-rose-200 mb-1.5 flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Side Effects (পার্শ্বপ্রতিক্রিয়া)
                </h4>
                <p className="text-slate-200 leading-relaxed text-sm">
                  {medicine.side_effects || 'Generally well-tolerated. Individual reactions may vary.'}
                </p>
              </div>

              <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-2xl">
                <h4 className="font-bold text-amber-200 mb-1.5 flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Precautions & Warnings (সতর্কতা)
                </h4>
                <p className="text-slate-200 leading-relaxed text-sm">
                  {medicine.precautions || 'Consult a doctor if pregnant, nursing, or if you have pre-existing renal or hepatic conditions.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB: COMPANY */}
          {activeTab === 'company' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#061c21] border border-[#12424b] p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{medicine.producer_name}</h4>
                    <p className="text-xs text-teal-200/70 flex items-center gap-1 mt-0.5">
                      <Globe2 className="w-3.5 h-3.5 text-teal-400" />
                      Country of Origin: <strong className="text-white">{medicine.producer_country}</strong>
                    </p>
                  </div>
                  {isBd && (
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                      Bangladesh Manufacturer
                    </span>
                  )}
                </div>

                {medicine.producer_website && (
                  <a
                    href={medicine.producer_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300 hover:text-white underline mt-2"
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
        <div className="bg-[#061c21] p-4 border-t border-[#0e373e] flex items-center justify-between">
          <span className="text-[11px] text-teal-200/50">ID: {medicine.medicine_id}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-[#0d5c52] to-[#0a4841] hover:from-[#116e62] text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
