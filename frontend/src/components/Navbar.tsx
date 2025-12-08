import React from 'react';
import { Bell, Search, User } from 'lucide-react';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle }) => {
  return (
    <header className="h-16 bg-white border-b border-neutral-100 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Page Title */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        
        {/* Notifications */}
        <button className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-neutral-200 mx-2"></div>

        {/* User */}
        <button className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors">
          <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-neutral-900">Demo User</p>
            <p className="text-[10px] text-neutral-400">Marketing Team</p>
          </div>
        </button>
      </div>
    </header>
  );
};
