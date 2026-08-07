import React, { useEffect } from 'react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-red-200 p-5 sm:p-6 space-y-4 sm:space-y-5 text-right animate-in zoom-in-95 duration-200 max-h-[90vh] max-h-[90dvh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px] sm:text-[28px]">warning</span>
          </div>
          <div>
            <h3 className="text-[17px] sm:text-[18px] font-black text-[#141c2b] leading-snug">
              אישור איפוס נתוני האפליקציה
            </h3>
            <p className="text-[12px] sm:text-[13px] text-[#434654] mt-0.5">
              פעולה זו תמחק את כל המידע השמור באפליקציה
            </p>
          </div>
        </div>

        {/* Warning Body */}
        <div className="bg-red-50/80 border border-red-200/80 rounded-2xl p-3.5 sm:p-4 space-y-2 text-[13px] text-red-950">
          <p className="font-bold text-red-900 flex items-center gap-1.5 text-[13px]">
            <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
            <span>שים לב: פעולה זו היא בלתי הפיכה!</span>
          </p>
          <p className="text-[12px] sm:text-[13px] text-red-900/90 leading-relaxed">
            לאחר האיפוס, כל הנתונים הבאים יימחקו לצמיתות מהמכשיר והאפליקציה תחזור למסך ההגדרה הראשוני:
          </p>
          <ul className="space-y-1.5 pr-4 list-disc text-[12px] text-red-900/85">
            <li>כל שיעורי הנהיגה שבוצעו ומתוכננים</li>
            <li>כל הטסטים (פנימיים וחיצוניים) ותוצאותיהם</li>
            <li>נתוני תשלום דמי הרישום לבית הספר</li>
            <li>הגדרות הפרופיל, המורה, המחירים ויעד השיעורים</li>
          </ul>
        </div>

        <p className="text-[12px] text-[#434654] bg-[#f0f4ff] p-3 rounded-xl border border-[#c3c5d7]/50 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#1a56db] shrink-0">info</span>
          <span>טיפ: אם ברצונך לשמור גיבוי, תוכל לבצע <b>"ייצוא קובץ JSON"</b> לפני האיפוס.</span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-[#ba1a1a] hover:bg-red-700 active:scale-95 text-white py-3 px-4 rounded-xl font-bold text-[14px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2"
          >
            <span className="material-symbols-outlined text-[20px]">delete_forever</span>
            <span>כן, אפס ומחק הכל</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 active:scale-95 text-[#141c2b] py-3 px-4 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-1.5 cursor-pointer order-2 sm:order-1 border border-gray-300/70"
          >
            <span>ביטול</span>
          </button>
        </div>
      </div>
    </div>
  );
};
