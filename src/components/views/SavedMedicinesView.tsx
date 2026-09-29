import { Bookmark, Pill, Trash2, ChevronRight, Globe2 } from 'lucide-react';
import type { MedicineDirectoryItem } from '../../types/database.types';

interface SavedMedicinesViewProps {
  savedMedicines: MedicineDirectoryItem[];
  onSelectMedicine: (medicine: MedicineDirectoryItem) => void;
  onRemoveSaved: (medicineId: string) => void;
  onClearAll: () => void;
  onExplore: () => void;
}

export function SavedMedicinesView({
  savedMedicines,
  onSelectMedicine,
  onRemoveSaved,
  onClearAll,
  onExplore,
}: SavedMedicinesViewProps) {
  if (savedMedicines.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 text-slate-100">
        <div className="w-16 h-16 bg-[#08252c] border border-[#144e53] text-teal-300 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No Saved Medicines Yet</h3>
        <p className="text-xs text-slate-300 max-w-xs mx-auto">
          Tap the bookmark icon on any medicine card to save it for quick offline access.
        </p>
        <button
          onClick={onExplore}
          className="mt-2 px-5 py-2.5 bg-gradient-to-r from-[#0d5c52] to-[#0a4841] hover:from-[#116e62] text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
        >
          Explore Medicines
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-teal-300 fill-teal-400" />
            <span>Saved Medicines</span>
          </h2>
          <p className="text-xs text-teal-200/70 mt-1">
            {savedMedicines.length} bookmarked for offline reference
          </p>
        </div>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-950/40 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {savedMedicines.map((med) => {
          const isBd = med.producer_country.toLowerCase() === 'bangladesh';

          return (
            <div
              key={med.medicine_id}
              className={`p-4 bg-[#082228]/85 hover:bg-[#0b2d35] border rounded-2xl transition flex flex-col justify-between shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] ${
                isBd ? 'border-[#145663] ring-1 ring-teal-500/30' : 'border-[#103a42]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div onClick={() => onSelectMedicine(med)} className="cursor-pointer group">
                    <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition">
                      {med.brand_name}
                      <span className="text-xs font-normal text-teal-300 px-1.5 py-0.5 ml-1.5 bg-[#05171b] border border-[#10434c] rounded-md">
                        {med.strength}
                      </span>
                    </h3>
                    <p className="text-xs text-teal-400 font-medium flex items-center gap-1 mt-1">
                      <Pill className="w-3 h-3" />
                      {med.generic_name}
                    </p>
                  </div>

                  <button
                    onClick={() => onRemoveSaved(med.medicine_id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                    title="Remove from saved"
                    aria-label="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-300 space-y-1 my-2 bg-[#05181c]/80 p-2.5 rounded-xl border border-[#0d343b]">
                  <div className="flex justify-between">
                    <span className="text-teal-300/60">Dosage Form:</span>
                    <span className="font-semibold text-teal-100">{med.dosage_form}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-300/60">Manufacturer:</span>
                    <span className="font-semibold text-teal-200 truncate max-w-[160px]">{med.producer_name}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#0e373e] flex items-center justify-between text-xs">
                {isBd ? (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    🇧🇩 Bangladesh
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-teal-200/80 bg-[#05171b] px-2.5 py-0.5 rounded-full border border-[#10434c] flex items-center gap-1">
                    <Globe2 className="w-3 h-3 text-teal-400" />
                    {med.producer_country}
                  </span>
                )}

                <button
                  onClick={() => onSelectMedicine(med)}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-300 hover:text-white transition cursor-pointer"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
