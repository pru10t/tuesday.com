import React from 'react';
import { 
  Users, 
  Zap, 
  BarChart3, 
  Clock, 
  GitCompare, 
  Sparkles,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  selectedCount: number;
}

const navItems = [
  { 
    id: 'audience', 
    label: 'Audience', 
    icon: Users, 
    description: 'Manage digital twins',
    available: true 
  },
  { 
    id: 'simulate', 
    label: 'Simulate', 
    icon: Zap, 
    description: 'Run campaign predictions',
    available: true 
  },
  { 
    id: 'compare', 
    label: 'A/B Compare', 
    icon: GitCompare, 
    description: 'Compare two campaigns',
    available: true
  },
  { 
    id: 'optimize', 
    label: 'Send Time', 
    icon: Clock, 
    description: 'Find optimal timing',
    available: false,
    badge: 'Soon'
  },
  { 
    id: 'insights', 
    label: 'Insights', 
    icon: BarChart3, 
    description: 'Audience analytics',
    available: false,
    badge: 'Soon'
  },
  { 
    id: 'ai-coach', 
    label: 'AI Coach', 
    icon: Sparkles, 
    description: 'Subject line optimizer',
    available: false,
    badge: 'Soon'
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, selectedCount }) => {
  return (
    <aside className="w-72 bg-white border-r border-neutral-100 flex flex-col h-screen sticky top-0 font-['Plus_Jakarta_Sans']">
      {/* Logo */}
      <div className="p-8 pb-12">
        <h1 className="font-['Jersey_25'] text-4xl text-black tracking-wide">Tomorrow</h1>
        <p className="text-[10px] text-neutral-400 font-medium tracking-widest uppercase mt-2">
          Predict. Optimize. Send.
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => item.available && onViewChange(item.id)}
              disabled={!item.available}
              className={`
                w-full flex items-center gap-4 px-4 py-3 rounded-md text-left transition-all group relative
                ${isActive 
                  ? 'text-black font-semibold' 
                  : item.available 
                    ? 'text-neutral-500 hover:text-black hover:bg-neutral-50' 
                    : 'text-neutral-300 cursor-not-allowed'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-1 bg-black rounded-full" />
              )}
              
              <Icon 
                className={`
                  w-5 h-5 transition-colors
                  ${isActive ? 'text-black' : item.available ? 'text-neutral-400 group-hover:text-black' : 'text-neutral-200'}
                `} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px]">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-neutral-100 text-neutral-400 bg-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Selection Status */}
      {selectedCount > 0 && (
        <div className="p-6">
          <div className="bg-black text-white rounded-xl p-6 shadow-xl shadow-neutral-200/50">
            <div className="flex items-center justify-between mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">Active Selection</p>
            </div>
            <p className="font-['Jersey_25'] text-4xl mb-1">{selectedCount}</p>
            <p className="text-xs text-neutral-400 font-medium">Digital Twins Ready</p>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="p-4 mt-auto">
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-50 transition-all">
          <Settings className="w-5 h-5" />
          <span className="text-[14px] font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
};
