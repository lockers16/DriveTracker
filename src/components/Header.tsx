import React from 'react';
import { StudentProfile } from '../types';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  profile: StudentProfile;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack,
  onBack,
  profile,
  onOpenProfile,
}) => {
  return (
    <header className="w-full sticky top-0 z-40 shadow-xs bg-[#f9f9ff] dark:bg-[#141c2b] flex justify-between items-center px-4 py-2 border-b border-[#c3c5d7]/30">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-[#e8eeff] text-[#003fb1] transition-colors active:scale-95 flex items-center justify-center"
            title="חזור"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full bg-[#dbe1ff] flex items-center justify-center overflow-hidden border border-[#c3c5d7] hover:ring-2 hover:ring-[#1a56db] transition-all cursor-pointer"
            title="פרופיל הגדרות"
          >
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </button>
        )}

        <h1 className="font-bold text-[16px] sm:text-[17px] text-[#003fb1] dark:text-[#dbe1ff] tracking-tight">
          {title || 'DriveTrack'}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Settings button icon leading to Profile */}
        <button
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full bg-[#e8eeff] hover:bg-[#dbe1ff] text-[#003fb1] flex items-center justify-center transition-all active:scale-95 border border-[#c3c5d7]/40"
          title="הגדרות ופרופיל"
        >
          <span className="material-symbols-outlined text-[24px]">settings</span>
        </button>
      </div>
    </header>
  );
};
