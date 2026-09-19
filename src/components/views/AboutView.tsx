import { ShieldCheck, Database, Globe, Smartphone, Heart, Sparkles } from 'lucide-react';

interface AboutViewProps {
  totalMedicines: number;
}

export function AboutView({ totalMedicines }: AboutViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span>About Worldwide Medicine Database</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Open reference directory with Bangladesh Pharmaceutical Priority
        </p>
      </div>

      {/* Priority Logic Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl shadow-md space-y-2">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Priority Sorting Architecture</span>
        </div>
        <h3 className="text-lg font-bold">Bangladesh First &bull; Global Directory</h3>
        <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
          In both default browsing and search queries, medicines produced by Bangladeshi companies are given top priority (Group 0), followed by international pharmaceutical companies ordered alphabetically by country (A to Z) and brand name.
        </p>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Database className="w-4 h-4" />
            <span>DGDA (Bangladesh)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Data sourced and structured from the Directorate General of Drug Administration (DGDA) standard registries, covering manufacturers like Square, Beximco, Incepta, Renata, ACI, Eskayef, and Acme.
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <Globe className="w-4 h-4" />
            <span>openFDA & WHO ATC</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Global pharmaceutical references including FDA product catalogs and the World Health Organization Anatomical Therapeutic Chemical (ATC) classification.
          </p>
        </div>
      </div>

      {/* Mobile App & PWA Status */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>PWA & Android Mobile Ready</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          This web application is configured with Progressive Web App (PWA) offline capabilities and wrapped as a standalone <strong>Capacitor Android APK</strong>.
        </p>
        <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
          <li><strong>Offline Caching:</strong> Fast loading with Service Worker.</li>
          <li><strong>Live Database:</strong> Currently indexing over {totalMedicines} verified formulations.</li>
          <li><strong>Native Experience:</strong> Optimized touch targets, safe-area layout, and bottom navigation.</li>
        </ul>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400 pt-4 flex items-center justify-center gap-1">
        <span>Made with</span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        <span>for public health reference</span>
      </div>
    </div>
  );
}
