import { useState, useMemo } from 'react';
import { Pill, Search, ChevronRight, Activity } from 'lucide-react';
import type { MedicineDirectoryItem } from '../../types/database.types';

interface GenericsViewProps {
  medicines: MedicineDirectoryItem[];
  onSelectGeneric: (genericName: string) => void;
}

export function GenericsView({ medicines, onSelectGeneric }: GenericsViewProps) {
  const [search, setSearch] = useState('');

  // Extract unique generics with count & therapeutic class
  const genericsList = useMemo(() => {
    const map = new Map<string, { name: string; therapeuticClass?: string; count: number }>();

    for (const med of medicines) {
      const existing = map.get(med.generic_name);
      if (existing) {
        existing.count++;
      } else {
        map.set(med.generic_name, {
          name: med.generic_name,
          therapeuticClass: med.therapeutic_class,
          count: 1,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [medicines]);

  const filteredGenerics = useMemo(() => {
    if (!search.trim()) return genericsList;
    const q = search.toLowerCase();
    return genericsList.filter(
      (g) => g.name.toLowerCase().includes(q) || g.therapeuticClass?.toLowerCase().includes(q)
    );
  }, [genericsList, search]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 text-stone-800">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1c1710] tracking-tight flex items-center gap-2">
          <Pill className="w-6 h-6 text-[#0f4c42]" />
          <span>Generics & Formulations</span>
        </h2>
        <p className="text-xs text-stone-600 mt-1">Browse active pharmaceutical ingredients and therapeutic classes</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search generic (e.g. Paracetamol, Omeprazole)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dfd0b8] rounded-xl text-xs sm:text-sm text-[#1c1710] placeholder-stone-400 focus:ring-2 focus:ring-[#0f4c42] focus:outline-none shadow-sm"
        />
      </div>

      <div className="text-xs text-stone-600 font-medium">
        Showing {filteredGenerics.length} generics
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredGenerics.map((item) => (
          <button
            key={item.name}
            onClick={() => onSelectGeneric(item.name)}
            className="flex items-center justify-between p-4 bg-white hover:bg-[#fdfbf7] border border-[#dfd0b8] hover:border-[#0f4c42] rounded-2xl text-left shadow-xs hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="pr-3">
              <h3 className="text-sm font-bold text-[#1c1710] group-hover:text-[#0f4c42] transition">
                {item.name}
              </h3>
              {item.therapeuticClass && (
                <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                  <Activity className="w-3 h-3 text-[#0f4c42] shrink-0" />
                  <span className="truncate max-w-[200px]">{item.therapeuticClass}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-0.5 bg-[#f5efe4] border border-[#dfd0b8] group-hover:border-[#0f4c42]/50 text-[#0f4c42] text-xs font-semibold rounded-full transition">
                {item.count} {item.count === 1 ? 'brand' : 'brands'}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#0f4c42] group-hover:translate-x-0.5 transition" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
