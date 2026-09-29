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
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 text-stone-800">
        <div className="w-16 h-16 bg-[#ede3d3] border border-[#dfd0b8] text-[#0f4c42] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#1c1710]">No Saved Medicines Yet</h3>
        <p className="text-xs text-stone-600 max-w-xs mx-auto">
          Tap the bookmark icon on any medicine card to save it for quick offline access.
        </p>
        <button
          onClick={onExplore}
          className="mt-2 px-5 py-2.5 bg-[#0f4c42] hover:bg-[#0c3c34] text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          Explore Medicines
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 text-stone-800">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1c1710] tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#0f4c42] fill-[#0f4c42]" />
            <span>Saved Medicines</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            {savedMedicines.length} bookmarked for offline reference
          </p>
        </div>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
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
              className={`p-4 bg-white hover:bg-[#fdfbf7] border rounded-2xl transition flex flex-col justify-between shadow-xs hover:shadow-md ${
                isBd ? 'border-[#bbf7d0] ring-1 ring-[#10b981]/30' : 'border-[#dfd0b8]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div onClick={() => onSelectMedicine(med)} className="cursor-pointer group">
                    <h3 className="text-base font-bold text-[#1c1710] group-hover:text-[#0f4c42] transition">
                      {med.brand_name}
                      <span className="text-xs font-normal text-[#0f4c42] px-1.5 py-0.5 ml-1.5 bg-[#f5efe4] border border-[#dfd0b8] rounded-md">
                        {med.strength}
                      </span>
                    </h3>
                    <p className="text-xs text-[#0f4c42] font-medium flex items-center gap-1 mt-1">
                      <Pill className="w-3 h-3" />
                      {med.generic_name}
                    </p>
                  </div>

                  <button
                    onClick={() => onRemoveSaved(med.medicine_id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove from saved"
                    aria-label="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-stone-700 space-y-1 my-2 bg-[#f8f4ec] p-2.5 rounded-xl border border-[#ede3d3]">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Dosage Form:</span>
                    <span className="font-semibold text-[#1c1710]">{med.dosage_form}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Manufacturer:</span>
                    <span className="font-semibold text-[#1c1710] truncate max-w-[160px]">{med.producer_name}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#ede3d3] flex items-center justify-between text-xs">
                {isBd ? (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    🇧🇩 Bangladesh
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-stone-700 bg-[#f5efe4] px-2.5 py-0.5 rounded-full border border-[#dfd0b8] flex items-center gap-1">
                    <Globe2 className="w-3 h-3 text-[#0f4c42]" />
                    {med.producer_country}
                  </span>
                )}

                <button
                  onClick={() => onSelectMedicine(med)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#0f4c42] hover:text-[#0c3c34] transition cursor-pointer"
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
