import React from 'react';

export type CreateActionType = 'lesson' | 'test' | 'registration-fee';

interface CreateTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: CreateActionType) => void;
  isRegistrationPaid?: boolean;
  hasPassedTest?: boolean;
}

export const CreateTypeModal: React.FC<CreateTypeModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
  isRegistrationPaid = false,
  hasPassedTest = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl border border-[#c3c5d7] max-h-[90vh] max-h-[90dvh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#c3c5d7]/40 pb-3">
          <div className="flex items-center gap-2 text-[#003fb1]">
            <span className="material-symbols-outlined text-[24px]">add_circle</span>
            <h3 className="text-[18px] font-bold text-[#141c2b] text-right">מה ברצונך להוסיף?</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#434654] hover:text-[#141c2b] p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <p className="text-[13px] text-[#434654] text-right">
          בחר את הפעולה הרצויה להוספה או דיווח במערכת:
        </p>

        {/* 3 Categories in Menu */}
        <div className="grid grid-cols-1 gap-3 pt-1">
          {/* 1. Lesson */}
          <button
            type="button"
            disabled={hasPassedTest}
            onClick={() => {
              if (hasPassedTest) return;
              onSelectType('lesson');
              onClose();
            }}
            className={`w-full p-3.5 rounded-2xl font-bold flex items-center justify-between transition-all text-right ${
              hasPassedTest
                ? 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed opacity-75'
                : 'bg-[#1a56db] text-white hover:bg-[#003fb1] active:scale-[0.99] shadow-xs cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  hasPassedTest ? 'bg-gray-200 text-gray-400' : 'bg-white/20 text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">speed</span>
              </div>
              <div className="text-right flex-1 min-w-0">
                <div className="text-[15px] font-bold text-right">שיעור נהיגה</div>
                <div
                  className={`text-[12px] font-normal text-right ${
                    hasPassedTest ? 'text-gray-500' : 'opacity-80'
                  }`}
                >
                  {hasPassedTest
                    ? 'לא ניתן להוסיף שיעורים לאחר מעבר טסט'
                    : 'הוספת שיעור למעקב השיעורים'}
                </div>
              </div>
            </div>
            {!hasPassedTest && (
              <span className="material-symbols-outlined text-[20px] shrink-0">chevron_left</span>
            )}
          </button>

          {/* 2. Test (Internal or External) */}
          <button
            type="button"
            disabled={hasPassedTest}
            onClick={() => {
              if (hasPassedTest) return;
              onSelectType('test');
              onClose();
            }}
            className={`w-full p-3.5 rounded-2xl font-bold flex items-center justify-between transition-all text-right ${
              hasPassedTest
                ? 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed opacity-75'
                : 'bg-emerald-700 text-white hover:bg-emerald-800 active:scale-[0.99] shadow-xs cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  hasPassedTest ? 'bg-gray-200 text-gray-400' : 'bg-white/20 text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div className="text-right flex-1 min-w-0">
                <div className="text-[15px] font-bold text-right">מבחן מעשי (טסט)</div>
                <div
                  className={`text-[12px] font-normal text-right ${
                    hasPassedTest ? 'text-gray-500' : 'opacity-80'
                  }`}
                >
                  {hasPassedTest
                    ? 'לא ניתן להוסיף טסטים לאחר מעבר טסט'
                    : 'טסט פנימי או טסט חיצוני של משרד הרישוי'}
                </div>
              </div>
            </div>
            {!hasPassedTest && (
              <span className="material-symbols-outlined text-[20px] shrink-0">chevron_left</span>
            )}
          </button>

          {/* 3. Registration Fee Payment */}
          <button
            type="button"
            disabled={isRegistrationPaid}
            onClick={() => {
              if (isRegistrationPaid) return;
              onSelectType('registration-fee');
              onClose();
            }}
            className={`w-full p-3.5 rounded-2xl font-bold flex items-center justify-between transition-all text-right ${
              isRegistrationPaid
                ? 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed opacity-75'
                : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.99] shadow-xs cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isRegistrationPaid ? 'bg-gray-200 text-gray-400' : 'bg-white/20 text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {isRegistrationPaid ? 'check_circle' : 'payments'}
                </span>
              </div>
              <div className="text-right flex-1 min-w-0">
                <div className="text-[15px] font-bold text-right">
                  {isRegistrationPaid ? 'דמי רישום לבית הספר לנהיגה' : 'תשלום דמי רישום'}
                </div>
                <div
                  className={`text-[12px] font-normal text-right ${
                    isRegistrationPaid ? 'text-gray-500' : 'opacity-90'
                  }`}
                >
                  {isRegistrationPaid ? 'דמי הרישום כבר שולמו' : 'דמי רישום לבית הספר לנהיגה'}
                </div>
              </div>
            </div>
            {isRegistrationPaid ? (
              <span className="text-[11px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md shrink-0">
                שולם
              </span>
            ) : (
              <span className="material-symbols-outlined text-[20px] shrink-0">chevron_left</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
