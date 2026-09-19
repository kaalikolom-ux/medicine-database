import { useState, useMemo } from 'react';
import { Building2, Search, ExternalLink, Globe2, ChevronRight } from 'lucide-react';
import type { MedicineDirectoryItem } from '../../types/database.types';

interface CompaniesViewProps {
  medicines: MedicineDirectoryItem[];
  onSelectCompany: (companyName: string) => void;
}

export function CompaniesView({ medicines, onSelectCompany }: CompaniesViewProps) {
  const [search, setSearch] = useState('');

  // Extract unique companies with origin country and count
  const companiesList = useMemo(() => {
    const map = new Map<string, { name: string; country: string; website?: string; count: number; isBd: boolean }>();

    for (const med of medicines) {
      const existing = map.get(med.producer_name);
      if (existing) {
        existing.count++;
      } else {
        const isBd = med.producer_country.toLowerCase() === 'bangladesh';
        map.set(med.producer_name, {
          name: med.producer_name,
          country: med.producer_country,
          website: med.producer_website,
          count: 1,
          isBd,
        });
      }
    }

    // Sort: Bangladesh companies first, then others alphabetically
    return Array.from(map.values()).sort((a, b) => {
      if (a.isBd !== b.isBd) return a.isBd ? -1 : 1;
      const countryCmp = a.country.localeCompare(b.country);
      if (countryCmp !== 0) return countryCmp;
      return a.name.localeCompare(b.name);
    });
  }, [medicines]);

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companiesList;
    const q = search.toLowerCase();
    return companiesList.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }, [companiesList, search]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-emerald-600" />
          <span>Pharmaceutical Companies</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Priority Listing: <strong>Bangladesh Manufacturers</strong> first, followed by Global Producers (A-Z)
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search company (e.g. Square, Beximco, Pfizer)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      <div className="text-xs text-slate-500 font-medium">
        Showing {filteredCompanies.length} companies
      </div>

      {/* Companies Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredCompanies.map((item) => (
          <div
            key={item.name}
            className={`p-4 bg-white border rounded-2xl transition flex flex-col justify-between shadow-sm hover:shadow-md ${
              item.isBd
                ? 'border-emerald-200 ring-1 ring-emerald-50'
                : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {item.name}
                </h3>
                {item.isBd ? (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
                    🇧🇩 BD Priority
                  </span>
                ) : (
                  <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 shrink-0 flex items-center gap-1">
                    <Globe2 className="w-3 h-3" />
                    {item.country}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mb-3">
                Origin: <strong>{item.country}</strong>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => onSelectCompany(item.name)}
                className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <span>View {item.count} medicines</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {item.website && (
                <a
                  href={item.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-700 p-1"
                  aria-label="Visit website"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
