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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Pill className="w-6 h-6 text-emerald-600" />
          <span>Generics & Formulations</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">Browse active pharmaceutical ingredients and therapeutic classes</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search generic (e.g. Paracetamol, Omeprazole)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      <div className="text-xs text-slate-500 font-medium">
        Showing {filteredGenerics.length} generics
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredGenerics.map((item) => (
          <button
            key={item.name}
            onClick={() => onSelectGeneric(item.name)}
            className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-emerald-400 hover:shadow-md transition group"
          >
            <div className="pr-3">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                {item.name}
              </h3>
              {item.therapeuticClass && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Activity className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate max-w-[200px]">{item.therapeuticClass}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-800 text-xs font-semibold rounded-full transition">
                {item.count} {item.count === 1 ? 'brand' : 'brands'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
