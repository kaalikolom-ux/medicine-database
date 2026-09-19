import { Home, Pill, Building2, Bookmark, Info, FileText } from 'lucide-react';

export type NavTab = 'explore' | 'generics' | 'companies' | 'saved' | 'admin' | 'info';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount: number;
}

export function BottomNav({ currentTab, onSelectTab, savedCount }: BottomNavProps) {
  const tabs = [
    { id: 'explore' as NavTab, label: 'Explore', icon: Home },
    { id: 'admin' as NavTab, label: 'Rx Pad', icon: FileText },
    { id: 'generics' as NavTab, label: 'Generics', icon: Pill },
    { id: 'companies' as NavTab, label: 'Companies', icon: Building2 },
    { id: 'saved' as NavTab, label: 'Saved', icon: Bookmark, badge: savedCount },
    { id: 'info' as NavTab, label: 'Info', icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] safe-area-pb">
      <div className="max-w-md mx-auto px-3 py-1 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all select-none ${
                isActive
                  ? 'text-emerald-700 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-black rounded-full ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-0.5 animate-in fade-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
