import React from 'react';
import { Lesson, DrivingTest, StudentProfile } from '../types';
import { DEFAULT_STUDENT_PROFILE } from '../data/initialData';

interface PaidSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: Lesson[];
  tests: DrivingTest[];
  profile?: StudentProfile;
}

export const PaidSummaryModal: React.FC<PaidSummaryModalProps> = ({
  isOpen,
  onClose,
  lessons = [],
  tests = [],
  profile = DEFAULT_STUDENT_PROFILE,
}) => {
  if (!isOpen) return null;

  // 1. Lessons paid
  const completedPaidLessons = (lessons || []).filter(
    (l) => l.paymentStatus === 'paid' && l.status === 'completed'
  );
  const lessonsPaidSum = completedPaidLessons.reduce((sum, l) => sum + (l.price || 0), 0);

  // 2. Tests paid (internal + external)
  const paidTests = (tests || []).filter((t) => t.paymentStatus === 'paid');
  const testsPaidSum = paidTests.reduce((sum, t) => sum + (t.totalPrice || 0), 0);

  // 3. Registration fee
  const isRegPaid = profile?.registrationFeePayment?.isPaid ?? false;
  const regFeePaidSum = isRegPaid ? (profile?.registrationFeePayment?.amount ?? profile?.defaultRegistrationFee ?? 0) : 0;

  // Total overall paid
  const totalPaid = lessonsPaidSum + testsPaidSum + regFeePaidSum;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-5 sm:p-6 relative max-h-[90vh] max-h-[90dvh] overflow-y-auto space-y-4 sm:space-y-5 border border-[#c3c5d7] my-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#c3c5d7]/40 pb-3">
          <div className="flex items-center gap-2.5 text-[#003fb1]">
            <div className="w-10 h-10 rounded-xl bg-[#e8eeff] flex items-center justify-center text-[#003fb1] shrink-0">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <div>
              <h2 className="text-[18px] sm:text-[19px] font-bold text-[#141c2b] leading-tight">פירוט סכומים ששולמו</h2>
              <p className="text-[12px] text-[#434654]">חלוקה לפי שיעורים, טסטים ודמי רישום</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#737686] hover:bg-[#e8eeff] hover:text-[#141c2b] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* 3 Categories Breakdown List */}
        <div className="space-y-2.5 sm:space-y-3">
          {/* Category 1: שיעורים */}
          <div className="bg-[#f0f4ff]/80 p-3.5 sm:p-4 rounded-2xl border border-[#1a56db]/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#dbe1ff] text-[#003fb1] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">speed</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-[#141c2b]">שיעורים</h3>
                <p className="text-[12px] text-[#434654] leading-tight">
                  {completedPaidLessons.length} שיעורים ששולמו
                </p>
              </div>
            </div>
            <div className="text-left font-black text-[17px] sm:text-[18px] text-[#003fb1] shrink-0">
              ₪{lessonsPaidSum.toLocaleString()}
            </div>
          </div>

          {/* Category 2: טסטים */}
          <div className="bg-emerald-50/80 p-3.5 sm:p-4 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-[#141c2b]">טסטים</h3>
                <p className="text-[12px] text-[#434654] leading-tight">
                  {paidTests.length} מבחנים מעשיים ששולמו
                </p>
              </div>
            </div>
            <div className="text-left font-black text-[17px] sm:text-[18px] text-emerald-800 shrink-0">
              ₪{testsPaidSum.toLocaleString()}
            </div>
          </div>

          {/* Category 3: דמי רישום */}
          <div className="bg-amber-50/80 p-3.5 sm:p-4 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-[#141c2b]">דמי רישום</h3>
                <p className="text-[12px] text-[#434654] leading-tight">
                  דמי רישום לבית הספר לנהיגה
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center shrink-0">
              {isRegPaid ? (
                <span className="font-black text-[17px] sm:text-[18px] text-amber-900">
                  ₪{regFeePaidSum.toLocaleString()}
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-100/90 text-amber-950 border border-amber-300 rounded-full font-bold text-[12px] inline-flex items-center justify-center text-center whitespace-nowrap shadow-2xs">
                  לא שולמו
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Total Summary Footer */}
        <div className="bg-[#1a56db] text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
          <div className="text-[15px] sm:text-[16px] font-bold text-white leading-tight">
            הסכום הכולל ששולם בפועל
          </div>
          <div className="text-[22px] sm:text-[24px] font-black tracking-tight shrink-0">
            ₪{totalPaid.toLocaleString()}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-11 bg-[#e8eeff] hover:bg-[#dbe1ff] active:scale-98 text-[#003fb1] font-bold text-[14px] rounded-xl transition-all cursor-pointer"
        >
          סגירה
        </button>
      </div>
    </div>
  );
};
