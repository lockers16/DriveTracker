import React, { useState, useEffect } from 'react';
import { DrivingTest, TestType, TestResultStatus, PaymentStatus } from '../types';

interface EditTestModalProps {
  test: DrivingTest | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTest: DrivingTest) => void;
  hasOtherExternalTest: boolean;
}

export const EditTestModal: React.FC<EditTestModalProps> = ({
  test,
  isOpen,
  onClose,
  onSave,
  hasOtherExternalTest,
}) => {
  if (!isOpen || !test) return null;

  const [type, setType] = useState<TestType>(test.type);
  const [date, setDate] = useState<string>(test.date);
  const [time, setTime] = useState<string>(test.time || '09:30');
  const [location, setLocation] = useState<string>(test.location || '');
  const [notes, setNotes] = useState<string>(test.notes || '');

  const [testFee, setTestFee] = useState<number>(test.testFee);
  const [carFee, setCarFee] = useState<number>(test.carFee);
  const [includeRegFee, setIncludeRegFee] = useState<boolean>(test.registrationFee > 0);
  const [regFee, setRegFee] = useState<number>(test.registrationFee || 200);

  const [result, setResult] = useState<TestResultStatus>(test.result);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(test.paymentStatus);

  useEffect(() => {
    if (test) {
      setType(test.type);
      setDate(test.date);
      setTime(test.time || '09:30');
      setLocation(test.location || '');
      setNotes(test.notes || '');
      setTestFee(test.testFee);
      setCarFee(test.carFee);
      setIncludeRegFee(test.registrationFee > 0);
      setRegFee(test.registrationFee || 200);
      setResult(test.result);
      setPaymentStatus(test.paymentStatus);
    }
  }, [test]);

  const isInternal = type === 'פנימי';

  // Calculate totals
  const calcRegFee = (!isInternal && !hasOtherExternalTest && includeRegFee) ? Number(regFee || 0) : 0;
  const totalPrice = isInternal
    ? Number(testFee || 0)
    : Number(testFee || 0) + Number(carFee || 0) + calcRegFee;

  // Check if test date is in the future
  const todayStr = new Date().toISOString().slice(0, 10);
  const isFutureTest = date > todayStr;

  const handleTypeChange = (newType: TestType) => {
    setType(newType);
    if (newType === 'פנימי') {
      setTestFee(250);
      setCarFee(0);
      setIncludeRegFee(false);
    } else {
      setTestFee(165);
      setCarFee(231);
      setIncludeRegFee(!hasOtherExternalTest);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format date string
    const d = new Date(date);
    const day = d.getDate();
    const monthsHebrew = [
      'בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני',
      'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר'
    ];
    const monthsShort = [
      'ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני',
      'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'
    ];
    const monthName = monthsHebrew[d.getMonth()] || '';
    const monthShortName = monthsShort[d.getMonth()] || '';
    const year = d.getFullYear();

    const formattedDate = `${day} ${monthName}, ${year}`;
    const monthDayShort = { month: monthShortName, day: String(day) };

    const finalResult = isFutureTest ? 'planned' : (result === 'planned' ? 'pending_result' : result);

    onSave({
      ...test,
      type,
      date,
      formattedDate,
      monthDayShort,
      time,
      location,
      notes,
      testFee: Number(testFee),
      carFee: isInternal ? 0 : Number(carFee),
      registrationFee: calcRegFee,
      totalPrice,
      result: finalResult,
      paymentStatus,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#c3c5d7] my-8">
        <div className="flex justify-between items-center border-b border-[#c3c5d7]/40 pb-3">
          <h3 className="text-[18px] font-bold text-[#141c2b] flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#1a56db]">edit_square</span>
            עריכת פרטי טסט
          </h3>
          <button
            onClick={onClose}
            className="text-[#434654] hover:text-[#141c2b] p-1 rounded-full hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          {/* Type & Test Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#141c2b] mb-1">
                סוג טסט
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as TestType)}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px] bg-white"
              >
                <option value="חיצוני">טסט חיצוני (משרד הרישוי)</option>
                <option value="פנימי">טסט פנימי (בית ספר לנהיגה)</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#141c2b] mb-1">
                תאריך
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#141c2b] mb-1">
                שעה
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#141c2b] mb-1">
                מיקום
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
              />
            </div>
          </div>

          {/* Fees Breakdown */}
          <div className="bg-[#f1f3ff] p-3.5 rounded-xl border border-[#c3c5d7]/50 space-y-3">
            <span className="font-bold text-[14px] text-[#003fb1] block">
              {isInternal ? 'מחיר טסט פנימי' : 'פירוט תשלומים'}
            </span>

            {isInternal ? (
              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                  מחיר (₪)
                </label>
                <input
                  type="number"
                  value={testFee}
                  onChange={(e) => setTestFee(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-[#c3c5d7] rounded-lg text-[14px] font-bold"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                    אגרת טסט (₪)
                  </label>
                  <input
                    type="number"
                    value={testFee}
                    onChange={(e) => setTestFee(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-[#c3c5d7] rounded-lg text-[14px] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                    העמדת רכב (₪)
                  </label>
                  <input
                    type="number"
                    value={carFee}
                    onChange={(e) => setCarFee(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-[#c3c5d7] rounded-lg text-[14px] font-bold"
                  />
                </div>
              </div>
            )}

            {!isInternal && !hasOtherExternalTest && (
              <div className="bg-white p-2.5 rounded-lg border border-[#c3c5d7]/40 space-y-1.5">
                <label className="flex items-center gap-2 font-semibold text-[12px] text-[#141c2b] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRegFee}
                    onChange={(e) => setIncludeRegFee(e.target.checked)}
                    className="w-4 h-4 text-[#1a56db] rounded"
                  />
                  כולל דמי רישום (200 ₪)
                </label>
                {includeRegFee && (
                  <input
                    type="number"
                    value={regFee}
                    onChange={(e) => setRegFee(Number(e.target.value))}
                    className="w-full p-1.5 bg-[#f9f9ff] border border-[#c3c5d7] rounded text-[13px] font-bold"
                  />
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-1 font-bold text-[14px]">
              <span>סה"כ מחיר:</span>
              <span className="text-[#003fb1] font-black text-[16px]">₪{totalPrice}</span>
            </div>
          </div>

          {/* Result & Payment Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#141c2b] mb-1">
                תוצאת הטסט
              </label>
              {isFutureTest ? (
                <div className="p-2.5 bg-gray-100 border border-gray-300 rounded-xl text-[13px] text-gray-600 font-medium">
                  טסט עתידי (מתוכנן)
                </div>
              ) : (
                <select
                  value={result === 'planned' ? 'pending_result' : result}
                  onChange={(e) => setResult(e.target.value as TestResultStatus)}
                  className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[13px] bg-white"
                >
                  <option value="pending_result">לא ידוע</option>
                  <option value="passed">עברתי (בהצלחה)</option>
                  <option value="failed">נכשלתי</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#141c2b] mb-1">
                סטטוס תשלום
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[13px] bg-white"
              >
                <option value="pending">ממתין לתשלום</option>
                <option value="paid">שולם במלואו</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-semibold text-[#141c2b] mb-1">
              הערות
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[13px]"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#1a56db] text-white py-3 rounded-xl font-bold text-[15px] hover:bg-[#003fb1] transition-colors"
            >
              שמור שינויים
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#c3c5d7] py-3 rounded-xl text-[#434654] font-medium hover:bg-gray-50"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
