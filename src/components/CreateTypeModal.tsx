import React from 'react';

interface CreateTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'lesson' | 'test') => void;
}

export const CreateTypeModal: React.FC<CreateTypeModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl text-center border border-[#c3c5d7]">
        <div className="flex justify-between items-center border-b border-[#c3c5d7]/40 pb-3">
          <h3 className="text-[18px] font-bold text-[#141c2b]">מה ברצונך להוסיף?</h3>
          <button
            onClick={onClose}
            className="text-[#434654] hover:text-[#141c2b] p-1 rounded-full hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <p className="text-[14px] text-[#434654]">
          בחר אם ברצונך לתזמן שיעור נהיגה חדש או להוסיף טסט פנימי / חיצוני.
        </p>

        <div className="grid grid-cols-1 gap-3 pt-1">
          <button
            onClick={() => {
              onSelectType('lesson');
              onClose();
            }}
            className="w-full bg-[#1a56db] text-white p-4 rounded-xl font-bold flex items-center justify-between hover:bg-[#003fb1] active:scale-[0.99] transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">calendar_add_on</span>
              </div>
              <div className="text-right">
                <div className="text-[15px]">שיעור נהיגה חדש</div>
                <div className="text-[12px] opacity-80 font-normal">הוספת שיעור למעקב השיעורים</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          <button
            onClick={() => {
              onSelectType('test');
              onClose();
            }}
            className="w-full bg-emerald-700 text-white p-4 rounded-xl font-bold flex items-center justify-between hover:bg-emerald-800 active:scale-[0.99] transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div className="text-right">
                <div className="text-[15px]">טסט חדש (פנימי / חיצוני)</div>
                <div className="text-[12px] opacity-80 font-normal">הוספת טסט עם פירוט תשלומים וסטטוס</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
        </div>
      </div>
    </div>
  );
};
