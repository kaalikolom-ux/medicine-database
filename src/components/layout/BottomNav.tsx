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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#061c21]/95 backdrop-blur-md border-t border-[#12424b] shadow-[0_-4px_24px_rgba(0,0,0,0.6)] safe-area-pb">
      <div className="max-w-md mx-auto px-3 py-1 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all select-none cursor-pointer ${
                isActive
                  ? 'text-teal-300 font-bold scale-105'
                  : 'text-teal-100/40 hover:text-teal-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.4px] text-teal-300' : 'stroke-[1.8px]'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-teal-400 text-navy-950 text-[10px] font-black rounded-full ring-2 ring-[#061c21]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-0.5 shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-in fade-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
