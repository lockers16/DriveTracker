import React, { useState, useEffect } from 'react';
import { RegistrationFeePayment, StudentProfile } from '../types';
import { DEFAULT_STUDENT_PROFILE } from '../data/initialData';

interface RegistrationFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: StudentProfile;
  onSaveRegistrationFee: (payment: RegistrationFeePayment) => void;
  onDeleteRegistrationFee?: () => void;
}

export const RegistrationFeeModal: React.FC<RegistrationFeeModalProps> = ({
  isOpen,
  onClose,
  profile = DEFAULT_STUDENT_PROFILE,
  onSaveRegistrationFee,
  onDeleteRegistrationFee,
}) => {
  const currentPayment = profile?.registrationFeePayment;
  const isCurrentlyPaid = currentPayment?.isPaid ?? false;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const [date, setDate] = useState<string>(currentPayment?.date || todayStr);
  const [amount, setAmount] = useState<number>(
    currentPayment?.amount || profile?.defaultRegistrationFee || 0
  );
  const [notes, setNotes] = useState<string>(currentPayment?.notes || '');
  const [isEditing, setIsEditing] = useState<boolean>(!isCurrentlyPaid);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(!isCurrentlyPaid);
      setDate(currentPayment?.date || todayStr);
      setAmount(currentPayment?.amount || profile?.defaultRegistrationFee || 0);
      setNotes(currentPayment?.notes || '');
    }
  }, [isOpen, isCurrentlyPaid, currentPayment, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const d = new Date(date);
    const monthsHebrew = [
      'בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני',
      'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר'
    ];
    const formattedDate = `${d.getDate()} ${monthsHebrew[d.getMonth()] || ''}, ${d.getFullYear()}`;

    onSaveRegistrationFee({
      isPaid: true,
      date,
      formattedDate,
      amount: Number(amount),
      notes: notes.trim(),
    });
    setIsEditing(false);
    onClose();
  };

  const handleMarkAsUnpaid = () => {
    if (onDeleteRegistrationFee) {
      onDeleteRegistrationFee();
    } else {
      onSaveRegistrationFee({
        isPaid: false,
        amount: profile?.defaultRegistrationFee || 0,
      });
    }
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-5 sm:p-6 relative max-h-[90vh] max-h-[90dvh] overflow-y-auto space-y-4 sm:space-y-5 border border-[#c3c5d7] my-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#c3c5d7]/40 pb-3">
          <div className="flex items-center gap-2.5 text-amber-700">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#141c2b] leading-tight">דמי רישום לבית הספר לנהיגה</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#737686] hover:bg-[#e8eeff] hover:text-[#141c2b] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {isCurrentlyPaid && !isEditing ? (
          /* View Details Mode */
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-emerald-900">
                <span className="material-symbols-outlined text-[26px] text-emerald-600">check_circle</span>
                <div>
                  <div className="font-bold text-[15px]">התשלום בוצע בהצלחה</div>
                  <div className="text-[12px] text-emerald-700">{currentPayment?.formattedDate || currentPayment?.date}</div>
                </div>
              </div>
              <div className="text-left font-black text-[20px] text-emerald-900">
                ₪{currentPayment?.amount?.toLocaleString()}
              </div>
            </div>

            {currentPayment?.notes && currentPayment.notes.trim() !== '' && (
              <div className="bg-[#f9f9ff] p-3.5 rounded-xl border border-[#c3c5d7]/50 text-[13px] text-[#434654]">
                <span className="font-bold text-[#141c2b] block mb-1">הערות תשלום:</span>
                <p className="whitespace-pre-wrap">{currentPayment.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-[#1a56db] hover:bg-[#003fb1] text-white font-bold h-11 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                עריכת פרטים
              </button>

              <button
                type="button"
                onClick={handleMarkAsUnpaid}
                className="px-4 border border-red-300 text-red-700 hover:bg-red-50 font-bold h-11 rounded-xl transition-colors cursor-pointer"
              >
                סימון כלא שולם
              </button>
            </div>
          </div>
        ) : (
          /* Edit / Report Payment Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-[13px] text-amber-900">
              הזן את פרטי התשלום עבור דמי הרישום לבית הספר לנהיגה.
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#141c2b] mb-1">
                תאריך ביצוע התשלום
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full h-11 px-3.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-medium text-[#141c2b] focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#141c2b] mb-1">
                סכום לתשלום (₪)
              </label>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full h-11 px-3.5 bg-white border border-[#c3c5d7] rounded-xl text-[16px] font-bold text-[#141c2b] focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <p className="text-[11px] text-[#434654] mt-1">
                ברירת המחדל מההגדרות: ₪{profile.defaultRegistrationFee || 0}
              </p>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#141c2b] mb-1">
                הערות (אופציונלי)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="לדוגמה: שולם בהעברה בנקאית / מזומן"
                className="w-full h-11 px-3.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-medium text-[#141c2b] focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                שמירת דיווח תשלום
              </button>

              {isCurrentlyPaid && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 border border-[#c3c5d7] text-[#434654] hover:bg-gray-100 font-bold h-11 rounded-xl transition-colors cursor-pointer"
                >
                  ביטול
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

