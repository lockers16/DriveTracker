import React, { useState } from 'react';

interface TestGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedLessons: number;
  requiredLessons: number;
  onUpdateRequiredLessons: (newTarget: number) => void;
}

export const TestGoalModal: React.FC<TestGoalModalProps> = ({
  isOpen,
  onClose,
  completedLessons,
  requiredLessons,
  onUpdateRequiredLessons,
}) => {
  const [targetInput, setTargetInput] = useState(requiredLessons);

  if (!isOpen) return null;

  const isCompletedTarget = completedLessons >= requiredLessons;
  const progressPercent = Math.min(100, Math.round((completedLessons / requiredLessons) * 100));
  const remainingLessons = Math.max(0, requiredLessons - completedLessons);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetInput > 0) {
      onUpdateRequiredLessons(Number(targetInput));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-5 sm:p-6 relative max-h-[90vh] max-h-[90dvh] overflow-y-auto space-y-4 sm:space-y-5 border border-[#c3c5d7] my-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#c3c5d7]/40 pb-3">
          <div className="flex items-center gap-2 text-[#003fb1]">
            <span className="material-symbols-outlined text-[28px]">speed</span>
            <h2 className="text-[20px] font-bold text-[#141c2b]">הגדרת רף שיעורים לטסט</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#737686] hover:bg-[#e8eeff] hover:text-[#141c2b] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

          {/* Success Green Banner or Progress Overview */}
          {isCompletedTarget ? (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 text-emerald-900 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-[32px] fill-1">verified</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-emerald-900 leading-tight">
                    עברת את מספר השיעורים הנדרש כדי לגשת לטסט!
                  </h3>
                  <p className="text-[13px] text-emerald-700 font-medium">
                    השלמת {completedLessons} שיעורים מתוך יעד של {requiredLessons}.
                  </p>
                </div>
              </div>
              <p className="text-[13px] text-emerald-800 bg-white/60 p-3 rounded-xl border border-emerald-200">
                🎉 בהצלחה במבחן המעשי! אתה מוכן ומיומן לעבור את הטסט.
              </p>
            </div>
          ) : (
            <div className="bg-[#e8eeff] rounded-2xl p-5 border border-[#1a56db]/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[15px] text-[#141c2b]">התקדמות לטסט</span>
                <span className="font-bold text-[16px] text-[#003fb1]">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#dbe2f8] h-3.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1a56db] h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-[14px] text-[#434654] font-medium">
                נותרו עוד <span className="font-bold text-[#003fb1]">{remainingLessons}</span> שיעורים להשגת רף היעד ({completedLessons}/{requiredLessons}).
              </p>
            </div>
          )}

          {/* Target Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-[#f9f9ff] p-5 rounded-2xl border border-[#c3c5d7]/50">
            <h3 className="font-bold text-[16px] text-[#141c2b]">שינוי רף שיעורים נדרש</h3>
            <p className="text-[13px] text-[#434654]">
              מינימום השיעורים בחוק בישראל הוא 28, אך ניתן להתאים את היעד האישי בהתאם להמלצת מורה הנהיגה.
            </p>

            <div className="space-y-2">
              <label className="block text-[14px] font-semibold text-[#141c2b]">
                כמות שיעורים מבוקשת לטסט
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={targetInput}
                  onChange={(e) => setTargetInput(Number(e.target.value))}
                  className="flex-1 h-12 px-4 bg-white border border-[#c3c5d7] rounded-xl font-bold text-[18px] text-[#141c2b] focus:ring-2 focus:ring-[#1a56db]"
                />
                <button
                  type="button"
                  onClick={() => setTargetInput(28)}
                  className="px-3 h-12 bg-[#e8eeff] text-[#003fb1] rounded-xl font-bold text-[13px] hover:bg-[#dbe1ff]"
                >
                  28 (מינימום)
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#1a56db] hover:bg-[#003fb1] text-white h-12 rounded-xl font-bold transition-colors shadow-xs"
              >
                עדכן רף חדש
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 bg-[#e8eeff] text-[#003fb1] h-12 rounded-xl font-bold hover:bg-[#dbe1ff] transition-colors"
              >
                סגור
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};
