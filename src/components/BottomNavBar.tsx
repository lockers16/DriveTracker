import React from 'react';
import { NavigationTab } from '../types';

interface BottomNavBarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'דף הבית', icon: 'home' },
    { id: 'lessons', label: 'שיעורים', icon: 'calendar_today' },
    { id: 'tests', label: 'טסטים', icon: 'verified' },
    { id: 'add', label: 'חדש', icon: 'add_circle' },
    { id: 'profile', label: 'פרופיל', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-[#f9f9ff] dark:bg-[#141c2b] border-t border-[#c3c5d7] shadow-lg safe-pb">
      <div className="flex justify-around items-center h-16 w-full max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-[#1a56db] text-white rounded-full px-4 py-1.5 shadow-sm'
                  : 'text-[#434654] dark:text-[#c3c5d7] hover:text-[#003fb1] py-1 px-2'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  isActive ? 'fill-1' : ''
                }`}
              >
                {tab.icon}
              </span>
              <span className="text-[12px] font-medium leading-none mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
