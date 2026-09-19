import { useEffect, useState } from 'react';
import { X, Pill, Building2, Globe2, AlertTriangle, ShieldCheck, FileText, ExternalLink, Activity, Info } from 'lucide-react';
import type { MedicineDirectoryItem } from '../../types/database.types';

interface MedicineDetailsModalProps {
  medicine: MedicineDirectoryItem | null;
  onClose: () => void;
}

export function MedicineDetailsModal({ medicine, onClose }: MedicineDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'clinical' | 'dosage' | 'safety' | 'company'>('clinical');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!medicine) return null;

  const isBd = medicine.producer_country.toLowerCase() === 'bangladesh';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {isBd ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400 text-emerald-950 shadow-sm">
                🇧🇩 Bangladesh Priority
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                <Globe2 className="w-3.5 h-3.5" />
                {medicine.producer_country}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-700/80 text-emerald-100 border border-emerald-600/50">
              {medicine.dosage_form}
            </span>
            {medicine.therapeutic_class && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-800/80 text-teal-100 truncate max-w-[220px]">
                {medicine.therapeutic_class}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-baseline gap-2">
            {medicine.brand_name}
            <span className="text-sm sm:text-base font-normal text-emerald-200">
              {medicine.strength}
            </span>
          </h2>

          <p className="text-sm font-medium text-emerald-200 mt-1 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-emerald-300" />
            <span>Generic: <strong className="text-white underline decoration-emerald-400/60">{medicine.generic_name}</strong></span>
          </p>

          <div className="mt-4 pt-3 border-t border-emerald-700/60 flex items-center justify-between text-xs text-emerald-100">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold text-white">{medicine.producer_name}</span>
            </div>
            {medicine.price !== null && (
              <div className="text-right">
                <span className="text-base font-extrabold text-white">
                  {medicine.price.toFixed(2)} {medicine.currency}
                </span>
                {medicine.package_info && (
                  <span className="text-emerald-300 text-[11px] block">{medicine.package_info}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 text-xs font-semibold text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveTab('clinical')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition ${
              activeTab === 'clinical'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Indications (নির্দেশনা)</span>
          </button>
          <button
            onClick={() => setActiveTab('dosage')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition ${
              activeTab === 'dosage'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dosage (মাত্রা ও সেবনবিধি)</span>
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition ${
              activeTab === 'safety'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Safety & Side Effects (পার্শ্বপ্রতিক্রিয়া)</span>
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition ${
              activeTab === 'company'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manufacturer (প্রস্তুতকারক)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {activeTab === 'clinical' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl">
                <h4 className="font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5 text-sm">
                  <Activity className="w-4 h-4 text-emerald-600" />
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
            </div>
          )}

          {activeTab === 'dosage' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-teal-50/60 border border-teal-100 p-4 rounded-2xl">
                <h4 className="font-bold text-teal-950 mb-1.5 flex items-center gap-1.5 text-sm">
                  <FileText className="w-4 h-4 text-teal-700" />
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
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                      Bangladesh Manufacturer
                    </span>
                  )}
                </div>

                {medicine.producer_website && (
                  <a
                    href={medicine.producer_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline mt-2"
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
            className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
