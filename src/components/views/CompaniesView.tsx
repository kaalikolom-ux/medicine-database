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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 text-slate-100">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-teal-300" />
          <span>Pharmaceutical Companies</span>
        </h2>
        <p className="text-xs text-teal-200/70 mt-1">
          Priority Listing: <strong>Bangladesh Manufacturers</strong> first, followed by Global Producers (A-Z)
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400/70" />
        <input
          type="text"
          placeholder="Search company (e.g. Square, Beximco, Pfizer)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#05171b] border border-[#134952] rounded-xl text-xs sm:text-sm text-white placeholder-teal-100/40 focus:ring-2 focus:ring-teal-400 focus:outline-none"
        />
      </div>

      <div className="text-xs text-teal-200/70 font-medium">
        Showing {filteredCompanies.length} companies
      </div>

      {/* Companies Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredCompanies.map((item) => (
          <div
            key={item.name}
            className={`p-4 bg-[#082228]/85 hover:bg-[#0b2d35] border rounded-2xl transition flex flex-col justify-between shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] ${
              item.isBd
                ? 'border-[#145663] ring-1 ring-teal-500/30'
                : 'border-[#103a42]'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-white">
                  {item.name}
                </h3>
                {item.isBd ? (
                  <span className="text-[10px] font-bold bg-emerald-950/80 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shrink-0">
                    🇧🇩 BD Priority
                  </span>
                ) : (
                  <span className="text-[10px] font-medium bg-[#05171b] text-teal-200/80 px-2.5 py-0.5 rounded-full border border-[#10434c] shrink-0 flex items-center gap-1">
                    <Globe2 className="w-3 h-3 text-teal-400" />
                    {item.country}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mb-3">
                Origin: <strong className="text-teal-200">{item.country}</strong>
              </p>
            </div>

            <div className="pt-3 border-t border-[#0e373e] flex items-center justify-between text-xs">
              <button
                onClick={() => onSelectCompany(item.name)}
                className="flex items-center gap-1 font-semibold text-teal-300 hover:text-white transition cursor-pointer"
              >
                <span>View {item.count} medicines</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {item.website && (
                <a
                  href={item.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400/60 hover:text-teal-300 p-1 transition"
                  title="Visit website"
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
