import { ShieldCheck, Database, Globe, Smartphone, Heart, Sparkles } from 'lucide-react';

interface AboutViewProps {
  totalMedicines: number;
}

export function AboutView({ totalMedicines }: AboutViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 text-slate-100">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-300" />
          <span>About Worldwide Medicine Database</span>
        </h2>
        <p className="text-xs text-teal-200/70 mt-1">
          Open reference directory with Bangladesh Pharmaceutical Priority
        </p>
      </div>

      {/* Priority Logic Banner */}
      <div className="p-5 bg-gradient-to-r from-[#041519] via-[#07252c] to-[#0a2f37] text-white rounded-3xl border border-[#144e53] shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Priority Sorting Architecture</span>
        </div>
        <h3 className="text-lg font-bold">Bangladesh First &bull; Global Directory</h3>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          In both default browsing and search queries, medicines produced by Bangladeshi companies are given top priority (Group 0), followed by international pharmaceutical companies ordered alphabetically by country (A to Z) and brand name.
        </p>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-[#082228]/85 border border-[#103a42] rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
            <Database className="w-4 h-4 text-teal-400" />
            <span>DGDA (Bangladesh)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Data sourced and structured from the Directorate General of Drug Administration (DGDA) standard registries, covering manufacturers like Square, Beximco, Incepta, Renata, ACI, Eskayef, and Acme.
          </p>
        </div>

        <div className="p-4 bg-[#082228]/85 border border-[#103a42] rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
            <Globe className="w-4 h-4 text-teal-400" />
            <span>openFDA & WHO ATC</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Global pharmaceutical references including FDA product catalogs and the World Health Organization Anatomical Therapeutic Chemical (ATC) classification.
          </p>
        </div>
      </div>

      {/* Mobile App & PWA Status */}
      <div className="p-4 bg-[#082228]/85 border border-[#103a42] rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Smartphone className="w-4 h-4 text-teal-300" />
          <span>PWA & Android Mobile Ready</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          This web application is configured with Progressive Web App (PWA) offline capabilities and wrapped as a standalone <strong>Capacitor Android APK</strong>.
        </p>
        <ul className="text-xs text-teal-200/70 space-y-1 list-disc pl-4">
          <li><strong className="text-white">Offline Caching:</strong> Fast loading with Service Worker.</li>
          <li><strong className="text-white">Live Database:</strong> Currently indexing over {totalMedicines} verified formulations.</li>
          <li><strong className="text-white">Native Experience:</strong> Optimized touch targets, safe-area layout, and bottom navigation.</li>
        </ul>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-teal-200/50 pt-4 flex items-center justify-center gap-1">
        <span>Made with</span>
        <Heart className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />
        <span>for public health reference</span>
      </div>
    </div>
  );
}
