import React, { useState } from 'react';
import { DrivingTest, StudentProfile, TestType, TestResultStatus, PaymentStatus } from '../types';

interface AddTestViewProps {
  profile: StudentProfile;
  existingTests: DrivingTest[];
  onSaveTest: (test: Omit<DrivingTest, 'id'>) => void;
  onCancel: () => void;
}

export const AddTestView: React.FC<AddTestViewProps> = ({
  profile,
  existingTests,
  onSaveTest,
  onCancel,
}) => {
  const externalTestsCount = existingTests.filter((t) => t.type === 'חיצוני').length;
  const nextTestNumber = externalTestsCount + 1;
  const hasExistingExternalTest = externalTestsCount > 0;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [testNumber, setTestNumber] = useState<number>(nextTestNumber);
  const [type, setType] = useState<TestType>('חיצוני');
  const [date, setDate] = useState<string>(todayStr);
  const [time, setTime] = useState<string>(currentHHMM);
  const [location, setLocation] = useState<string>('משרד הרישוי');
  const [notes, setNotes] = useState<string>('');

  // Default fee prices requested by user
  const [testFee, setTestFee] = useState<number>(165);
  const [carFee, setCarFee] = useState<number>(231);
  const [includeRegistrationFee, setIncludeRegistrationFee] = useState<boolean>(!hasExistingExternalTest);
  const [registrationFee, setRegistrationFee] = useState<number>(200);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [result, setResult] = useState<TestResultStatus>('planned');

  // Handle type changes
  const handleTypeChange = (newType: TestType) => {
    setType(newType);
    if (newType === 'פנימי') {
      setTestFee(250);
      setCarFee(0);
      setIncludeRegistrationFee(false);
    } else {
      setTestFee(165);
      setCarFee(231);
      setIncludeRegistrationFee(!hasExistingExternalTest);
    }
  };

  const isInternal = type === 'פנימי';
  const calcRegistration = (!isInternal && !hasExistingExternalTest && includeRegistrationFee)
    ? Number(registrationFee || 0)
    : 0;
  const totalPrice = isInternal
    ? Number(testFee || 0)
    : Number(testFee || 0) + Number(carFee || 0) + calcRegistration;

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

    onSaveTest({
      testNumber: Number(testNumber),
      type,
      date,
      formattedDate,
      monthDayShort,
      time,
      location,
      notes,
      testFee: Number(testFee),
      carFee: isInternal ? 0 : Number(carFee),
      registrationFee: calcRegistration,
      totalPrice,
      paymentStatus,
      result,
    });
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pt-4 pb-28 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[17px] font-bold text-[#141c2b] tracking-tight">הוספת טסט חדש</h2>
          <p className="text-[14px] text-[#434654]">הזנת פרטים, מועד ומחירים עבור טסט מעשי</p>
        </div>
        <button
          onClick={onCancel}
          className="text-[#003fb1] font-bold text-[14px] hover:underline"
        >
          ביטול
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-[#c3c5d7] shadow-xs space-y-5">
        {/* Test Number & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#141c2b] mb-1">
              מספר טסט
            </label>
            <input
              type="number"
              min="1"
              value={testNumber}
              onChange={(e) => setTestNumber(Number(e.target.value))}
              className="w-full p-3 border border-[#c3c5d7] rounded-xl text-[15px] focus:ring-2 focus:ring-[#1a56db]"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#141c2b] mb-1">
              סוג טסט
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as TestType)}
              className="w-full p-3 border border-[#c3c5d7] rounded-xl text-[15px] bg-white focus:ring-2 focus:ring-[#1a56db]"
            >
              <option value="חיצוני">טסט חיצוני (משרד הרישוי)</option>
              <option value="פנימי">טסט פנימי (בית ספר לנהיגה)</option>
            </select>
          </div>
        </div>

        {/* Date, Time & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#141c2b] mb-1">
              תאריך הטסט
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-[#c3c5d7] rounded-xl text-[15px] focus:ring-2 focus:ring-[#1a56db]"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#141c2b] mb-1">
              שעה
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="09:30"
              className="w-full p-3 border border-[#c3c5d7] rounded-xl text-[15px] focus:ring-2 focus:ring-[#1a56db]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#141c2b] mb-1">
              מיקום הטסט
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={isInternal ? "בית ספר לנהיגה" : "משרד הרישוי, חולון"}
              className="w-full p-3 border border-[#c3c5d7] rounded-xl text-[15px] focus:ring-2 focus:ring-[#1a56db]"
            />
          </div>
        </div>

        {/* Pricing Breakdown Section */}
        <div className="bg-[#f1f3ff] p-4.5 rounded-xl border border-[#c3c5d7]/60 space-y-3.5">
          <h3 className="font-bold text-[15px] text-[#003fb1] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">payments</span>
            {isInternal ? 'מחיר טסט פנימי' : 'פירוט עלויות ומחירים'}
          </h3>

          {isInternal ? (
            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                מחיר טסט פנימי (₪) [ברירת מחדל: 250]
              </label>
              <input
                type="number"
                value={testFee}
                onChange={(e) => setTestFee(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-bold text-[#141c2b]"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                  אגרת טסט (₪) [ברירת מחדל: 165]
                </label>
                <input
                  type="number"
                  value={testFee}
                  onChange={(e) => setTestFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-bold text-[#141c2b]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                  העמדת רכב לטסט (₪) [ברירת מחדל: 231]
                </label>
                <input
                  type="number"
                  value={carFee}
                  onChange={(e) => setCarFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-bold text-[#141c2b]"
                />
              </div>
            </div>
          )}

          {/* Registration Fee Toggle & Input - ONLY for FIRST EXTERNAL TEST */}
          {!isInternal && !hasExistingExternalTest && (
            <div className="bg-white p-3 rounded-xl border border-[#c3c5d7]/50 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="regFeeCheckbox" className="font-semibold text-[13px] text-[#141c2b] cursor-pointer flex items-center gap-2">
                  <input
                    id="regFeeCheckbox"
                    type="checkbox"
                    checked={includeRegistrationFee}
                    onChange={(e) => setIncludeRegistrationFee(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1a56db] focus:ring-[#1a56db]"
                  />
                  כלול דמי רישום (ברירת מחדל: 200 ₪)
                </label>
                <span className="text-[12px] text-[#434654]">טסט חיצוני ראשון</span>
              </div>

              {includeRegistrationFee && (
                <div className="pt-1">
                  <input
                    type="number"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(Number(e.target.value))}
                    placeholder="200"
                    className="w-full p-2.5 bg-[#f9f9ff] border border-[#c3c5d7] rounded-xl text-[14px] font-bold"
                  />
                </div>
              )}
            </div>
          )}

          {/* Total Sum Display */}
          <div className="flex justify-between items-center pt-2 border-t border-[#c3c5d7]/40">
            <span className="font-bold text-[15px] text-[#141c2b]">סה"כ לתשלום עבור הטסט:</span>
            <span className="text-[20px] font-black text-emerald-700">₪{totalPrice}</span>
          </div>
        </div>

        {/* Initial Result & Payment Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#141c2b] mb-1">
              סטטוס תוצאת הטסט
            </label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as TestResultStatus)}
              className="w-full p-3 border border-[#c3c5d7] rounded-xl text-[14px] bg-white"
            >
              <option value="planned">מתוכנן (עתידי)</option>
              <option value="pending_result">לא ידוע</option>
              <option value="passed">עברתי (בהצלחה - ירוק)</option>
              <option value="failed">נכשלתי (אדום)</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#141c2b] mb-1">
              סטטוס תשלום
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              className="w-full p-3 border border-[#c3c5d7] rounded-xl text-[14px] bg-white"
            >
              <option value="pending">ממתין לתשלום</option>
              <option value="paid">שולם במלואו</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[13px] font-semibold text-[#141c2b] mb-1">
            הערות אישיות / מורה
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="דגשים לטסט, שם הבוחן, מסלול..."
            rows={3}
            className="w-full p-3 border border-[#c3c5d7] rounded-xl text-[14px] focus:ring-2 focus:ring-[#1a56db]"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[#1a56db] text-white py-3.5 rounded-xl font-bold text-[16px] hover:bg-[#003fb1] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[22px]">verified</span>
          שמור טסט
        </button>
      </form>
    </main>
  );
};
