import React, { useState, useEffect } from 'react';
import { Lesson, DrivingTest, StudentProfile, TestType, TestResultStatus, PaymentStatus, RegistrationFeePayment } from '../types';
import { DEFAULT_STUDENT_PROFILE } from '../data/initialData';
import { calculateEndTime, calculateDurationFromTimes, getNextSuggestedLessonTopic, getNextLessonNumber, isTestDateTimePassed } from '../utils/lessonHelpers';
import { CreateActionType } from './CreateTypeModal';

interface AddUnifiedViewProps {
  profile?: StudentProfile;
  allLessons: Lesson[];
  existingTests: DrivingTest[];
  initialMode?: CreateActionType;
  hasPassedTest?: boolean;
  onSaveLesson: (newLesson: Omit<Lesson, 'id'>) => void;
  onSaveTest: (test: Omit<DrivingTest, 'id'>) => void;
  onSaveRegistrationFee: (payment: RegistrationFeePayment) => void;
  onCancel: () => void;
  totalCompletedCount: number;
}

export const AddUnifiedView: React.FC<AddUnifiedViewProps> = ({
  profile = DEFAULT_STUDENT_PROFILE,
  allLessons = [],
  existingTests = [],
  initialMode = 'lesson',
  hasPassedTest = false,
  onSaveLesson,
  onSaveTest,
  onSaveRegistrationFee,
  onCancel,
  totalCompletedCount = 0,
}) => {
  const isRegPaid = profile?.registrationFeePayment?.isPaid ?? false;

  // Mode: 'lesson' | 'test' | 'registration-fee'
  const [activeMode, setActiveMode] = useState<CreateActionType>(() => {
    if (hasPassedTest) {
      return isRegPaid ? 'lesson' : 'registration-fee';
    }
    if (initialMode === 'registration-fee' && isRegPaid) {
      return 'lesson';
    }
    return initialMode;
  });

  useEffect(() => {
    if (hasPassedTest && !isRegPaid) {
      setActiveMode('registration-fee');
    } else if (initialMode === 'registration-fee' && isRegPaid) {
      setActiveMode('lesson');
    } else {
      setActiveMode(initialMode);
    }
  }, [initialMode, isRegPaid, hasPassedTest]);

  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // ==========================================
  // 1. LESSON FORM STATE
  // ==========================================
  const [lessonDuration, setLessonDuration] = useState(40);
  const [lessonEndTime, setLessonEndTime] = useState(() => calculateEndTime(currentHHMM, 40));
  const suggestedTopic = getNextSuggestedLessonTopic(allLessons, 40);
  const [lessonDate, setLessonDate] = useState(todayStr);
  const [lessonStartTime, setLessonStartTime] = useState(currentHHMM);
  const [lessonPrice, setLessonPrice] = useState(profile?.pricePerLesson ?? 0);
  const [lessonTopic, setLessonTopic] = useState(suggestedTopic);
  const [lessonLocation, setLessonLocation] = useState('');
  const [lessonStatus, setLessonStatus] = useState<'planned' | 'completed' | 'cancelled'>('planned');
  const [lessonIsPaid, setLessonIsPaid] = useState(false);
  const [lessonNotes, setLessonNotes] = useState('');

  const handleStartTimeChange = (newStart: string) => {
    setLessonStartTime(newStart);
    setLessonEndTime(calculateEndTime(newStart, lessonDuration));
  };

  const handleDurationChange = (newDuration: number) => {
    setLessonDuration(newDuration);
    setLessonEndTime(calculateEndTime(lessonStartTime, newDuration));
    
    // Auto-update price according to duration: 80 min = 2x price per lesson
    const basePrice = profile?.pricePerLesson ?? 0;
    if (basePrice > 0) {
      setLessonPrice(newDuration >= 70 ? basePrice * 2 : basePrice);
    }

    // Auto-update topic if using default lesson topic name pattern
    const nextNum = getNextLessonNumber(allLessons);
    if (!lessonTopic.trim() || lessonTopic === `שיעור ${nextNum}` || lessonTopic === `שיעור ${nextNum}-${nextNum + 1}`) {
      setLessonTopic(getNextSuggestedLessonTopic(allLessons, newDuration));
    }
  };

  const handleEndTimeChange = (newEnd: string) => {
    setLessonEndTime(newEnd);
    const calculated = calculateDurationFromTimes(lessonStartTime, newEnd);
    setLessonDuration(calculated);
    const basePrice = profile?.pricePerLesson ?? 0;
    if (basePrice > 0) {
      setLessonPrice(calculated >= 70 ? basePrice * 2 : basePrice);
    }
  };

  const handleLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dateObj = new Date(lessonDate);
    const monthsHebrew = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    const monthShortHebrew = [
      'ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני',
      'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'
    ];

    const dayNum = dateObj.getDate() || 14;
    const monthIdx = dateObj.getMonth() || 9;
    const year = dateObj.getFullYear() || 2024;

    const formattedDate = `${dayNum} ב${monthsHebrew[monthIdx]}, ${year}`;
    const monthDayShort = {
      month: monthShortHebrew[monthIdx],
      day: dayNum.toString(),
    };

    const fullTimeStr = `${lessonStartTime} - ${lessonEndTime}`;
    const nextNum = getNextLessonNumber(allLessons);

    const newLessonData: Omit<Lesson, 'id'> = {
      lessonNumber: nextNum,
      date: lessonDate,
      formattedDate,
      monthDayShort,
      time: fullTimeStr,
      duration: lessonDuration,
      topic: lessonTopic.trim() || getNextSuggestedLessonTopic(allLessons, lessonDuration),
      instructor: profile?.instructorName || 'מורה נהיגה',
      location: lessonLocation.trim(),
      price: Number(lessonPrice),
      status: lessonStatus,
      paymentStatus: lessonStatus === 'cancelled' ? 'pending' : (lessonIsPaid ? 'paid' : 'pending'),
      notes: lessonNotes.trim() || undefined,
    };

    setSavedSuccess('השיעור נוסף בהצלחה!');
    setTimeout(() => {
      onSaveLesson(newLessonData);
    }, 400);
  };

  // ==========================================
  // 2. TEST FORM STATE
  // ==========================================
  const [testType, setTestType] = useState<TestType>('חיצוני');
  const [testDate, setTestDate] = useState(todayStr);
  const [testTime, setTestTime] = useState('10:00');
  const [testLocation, setTestLocation] = useState('');

  // Internal test fee
  const [testInternalFee, setTestInternalFee] = useState(profile?.defaultInternalTestFee ?? 0);

  // External test fees
  const [testGovFee, setTestGovFee] = useState(profile?.defaultTestFee ?? 0);
  const [testCarFee, setTestCarFee] = useState(profile?.defaultCarFee ?? 0);

  const [testResult, setTestResult] = useState<TestResultStatus>('pending_result');
  const [testPaymentStatus, setTestPaymentStatus] = useState<PaymentStatus>('pending');
  const [testNotes, setTestNotes] = useState('');

  const externalTestsCount = existingTests.filter((t) => t.type === 'חיצוני').length;
  const isTestPassedTime = isTestDateTimePassed(testDate, testTime);

  const calculateTestTotal = () => {
    if (testType === 'פנימי') {
      return Number(testInternalFee);
    } else {
      return Number(testGovFee) + Number(testCarFee);
    }
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const total = calculateTestTotal();

    const dateObj = new Date(testDate);
    const monthsHebrew = [
      'בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני',
      'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר'
    ];
    const monthShortHebrew = [
      'ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני',
      'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'
    ];

    const dayNum = dateObj.getDate() || 1;
    const monthIdx = dateObj.getMonth() || 0;
    const year = dateObj.getFullYear() || 2024;

    const formattedDate = `${dayNum} ${monthsHebrew[monthIdx]}, ${year}`;
    const monthDayShort = {
      month: monthShortHebrew[monthIdx],
      day: dayNum.toString(),
    };

    const finalResult: TestResultStatus = isTestPassedTime ? testResult : 'planned';

    const newTestData: Omit<DrivingTest, 'id'> = {
      testNumber: testType === 'חיצוני' ? externalTestsCount + 1 : 1,
      type: testType,
      date: testDate,
      formattedDate,
      monthDayShort,
      time: testTime,
      location: testLocation.trim(),
      notes: testNotes.trim() || undefined,
      testFee: testType === 'פנימי' ? Number(testInternalFee) : Number(testGovFee),
      carFee: testType === 'פנימי' ? 0 : Number(testCarFee),
      registrationFee: 0,
      totalPrice: total,
      paymentStatus: testPaymentStatus,
      result: finalResult,
    };

    setSavedSuccess(`טסט ${testType} נוסף בהצלחה!`);
    setTimeout(() => {
      onSaveTest(newTestData);
    }, 400);
  };

  // ==========================================
  // 3. REGISTRATION FEE FORM STATE
  // ==========================================
  const [regFeeDate, setRegFeeDate] = useState(todayStr);
  const [regFeeAmount, setRegFeeAmount] = useState(profile?.defaultRegistrationFee ?? 0);
  const [regFeeNotes, setRegFeeNotes] = useState('');

  const handleRegistrationFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const d = new Date(regFeeDate);
    const monthsHebrew = [
      'בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני',
      'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר'
    ];
    const formattedDate = `${d.getDate()} ${monthsHebrew[d.getMonth()] || ''}, ${d.getFullYear()}`;

    setSavedSuccess('דיווח דמי הרישום נשמר בהצלחה!');
    setTimeout(() => {
      onSaveRegistrationFee({
        isPaid: true,
        date: regFeeDate,
        formattedDate,
        amount: Number(regFeeAmount),
        notes: regFeeNotes.trim(),
      });
    }, 400);
  };

  return (
    <main className="max-w-xl mx-auto px-4 pt-4 pb-32 space-y-5">
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div className="text-right">
          <h2 className="text-[17px] font-bold text-[#141c2b] mb-0.5">הוספה חדשה</h2>
          <p className="text-[13px] text-[#434654]">
            הזנת פרטים עבור שיעורי נהיגה, טסטים או דיווח תשלום דמי רישום
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-[#003fb1] hover:underline font-bold text-[14px] px-2 py-1 cursor-pointer"
        >
          חזרה
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl font-bold text-[14px] flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[24px] text-emerald-600">check_circle</span>
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Top Selector Grid: 3 Categories in a Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* 1. Lesson */}
        <button
          type="button"
          disabled={hasPassedTest}
          onClick={() => {
            if (!hasPassedTest) setActiveMode('lesson');
          }}
          className={`p-3.5 rounded-2xl text-right transition-all flex items-center sm:flex-col justify-between sm:justify-between border gap-3 ${
            hasPassedTest
              ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
              : activeMode === 'lesson'
              ? 'bg-[#1a56db] text-white border-[#1a56db] shadow-md cursor-pointer'
              : 'bg-white text-[#141c2b] border-[#c3c5d7] hover:bg-[#f0f4ff] cursor-pointer'
          }`}
        >
          <div className="flex items-center sm:justify-between sm:w-full gap-3 flex-1 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                hasPassedTest
                  ? 'bg-gray-200 text-gray-400'
                  : activeMode === 'lesson'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#1a56db]/10 text-[#1a56db]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">speed</span>
            </div>
            <div className="text-right flex-1 min-w-0 sm:hidden">
              <div className="font-bold text-[14px]">שיעור נהיגה</div>
              <div
                className={`text-[11px] ${
                  hasPassedTest
                    ? 'text-gray-500'
                    : activeMode === 'lesson'
                    ? 'opacity-80'
                    : 'text-[#434654]'
                }`}
              >
                {hasPassedTest ? 'לא ניתן להוסיף לאחר מעבר טסט' : 'הוספת שיעור'}
              </div>
            </div>
            {activeMode === 'lesson' && !hasPassedTest && (
              <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 sm:block hidden"></span>
            )}
          </div>
          <div className="text-right w-full hidden sm:block">
            <div className="font-bold text-[14px]">שיעור נהיגה</div>
            <div
              className={`text-[11px] ${
                hasPassedTest
                  ? 'text-gray-500'
                  : activeMode === 'lesson'
                  ? 'opacity-80'
                  : 'text-[#434654]'
              }`}
            >
              {hasPassedTest ? 'לא ניתן להוסיף לאחר מעבר טסט' : 'הוספת שיעור'}
            </div>
          </div>
          {activeMode === 'lesson' && !hasPassedTest && (
            <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 sm:hidden"></span>
          )}
        </button>

        {/* 2. Test (Internal or External) */}
        <button
          type="button"
          disabled={hasPassedTest}
          onClick={() => {
            if (!hasPassedTest) setActiveMode('test');
          }}
          className={`p-3.5 rounded-2xl text-right transition-all flex items-center sm:flex-col justify-between sm:justify-between border gap-3 ${
            hasPassedTest
              ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
              : activeMode === 'test'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md cursor-pointer'
              : 'bg-white text-[#141c2b] border-[#c3c5d7] hover:bg-emerald-50 cursor-pointer'
          }`}
        >
          <div className="flex items-center sm:justify-between sm:w-full gap-3 flex-1 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                hasPassedTest
                  ? 'bg-gray-200 text-gray-400'
                  : activeMode === 'test'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div className="text-right flex-1 min-w-0 sm:hidden">
              <div className="font-bold text-[14px]">מבחן מעשי (טסט)</div>
              <div
                className={`text-[11px] ${
                  hasPassedTest
                    ? 'text-gray-500'
                    : activeMode === 'test'
                    ? 'opacity-80'
                    : 'text-[#434654]'
                }`}
              >
                {hasPassedTest ? 'לא ניתן להוסיף לאחר מעבר טסט' : 'פנימי או חיצוני'}
              </div>
            </div>
            {activeMode === 'test' && !hasPassedTest && (
              <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 sm:block hidden"></span>
            )}
          </div>
          <div className="text-right w-full hidden sm:block">
            <div className="font-bold text-[14px]">מבחן מעשי (טסט)</div>
            <div
              className={`text-[11px] ${
                hasPassedTest
                  ? 'text-gray-500'
                  : activeMode === 'test'
                  ? 'opacity-80'
                  : 'text-[#434654]'
              }`}
            >
              {hasPassedTest ? 'לא ניתן להוסיף לאחר מעבר טסט' : 'פנימי או חיצוני'}
            </div>
          </div>
          {activeMode === 'test' && !hasPassedTest && (
            <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 sm:hidden"></span>
          )}
        </button>

        {/* 3. Registration Fee */}
        <button
          type="button"
          disabled={isRegPaid}
          onClick={() => {
            if (!isRegPaid) setActiveMode('registration-fee');
          }}
          className={`p-3.5 rounded-2xl text-right transition-all flex items-center sm:flex-col justify-between sm:justify-between border gap-3 ${
            isRegPaid
              ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
              : activeMode === 'registration-fee'
              ? 'bg-orange-500 text-white border-orange-500 shadow-md cursor-pointer'
              : 'bg-white text-[#141c2b] border-[#c3c5d7] hover:bg-orange-50 cursor-pointer'
          }`}
        >
          <div className="flex items-center sm:justify-between sm:w-full gap-3 flex-1 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isRegPaid
                  ? 'bg-gray-200 text-gray-400'
                  : activeMode === 'registration-fee'
                  ? 'bg-white/20 text-white'
                  : 'bg-orange-100 text-orange-700'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {isRegPaid ? 'check_circle' : 'payments'}
              </span>
            </div>
            <div className="text-right flex-1 min-w-0 sm:hidden">
              <div className="font-bold text-[14px]">
                {isRegPaid ? 'דמי רישום לבית הספר לנהיגה' : 'דמי רישום'}
              </div>
              <div
                className={`text-[11px] ${
                  isRegPaid
                    ? 'text-gray-500'
                    : activeMode === 'registration-fee'
                    ? 'opacity-90'
                    : 'text-[#434654]'
                }`}
              >
                {isRegPaid ? 'דמי הרישום כבר שולמו' : 'לביה"ס לנהיגה'}
              </div>
            </div>
            {isRegPaid ? (
              <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded shrink-0">
                שולם
              </span>
            ) : (
              activeMode === 'registration-fee' && (
                <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 sm:block hidden"></span>
              )
            )}
          </div>
          <div className="text-right w-full hidden sm:block">
            <div className="font-bold text-[14px]">
              {isRegPaid ? 'דמי רישום לבית הספר לנהיגה' : 'דמי רישום'}
            </div>
            <div
              className={`text-[11px] ${
                isRegPaid
                  ? 'text-gray-500'
                  : activeMode === 'registration-fee'
                  ? 'opacity-90'
                  : 'text-[#434654]'
              }`}
            >
              {isRegPaid ? 'דמי הרישום כבר שולמו' : 'לביה"ס לנהיגה'}
            </div>
          </div>
          {!isRegPaid && activeMode === 'registration-fee' && (
            <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 sm:hidden"></span>
          )}
        </button>
      </div>

      {/* When user has passed a test and registration fee is paid */}
      {hasPassedTest && isRegPaid && (
        <div className="bg-white p-8 rounded-3xl border border-[#c3c5d7] shadow-xs text-center space-y-3 animate-in fade-in">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">celebration</span>
          </div>
          <h3 className="text-[18px] font-bold text-[#141c2b]">סיימת בהצלחה את תהליך לימודי הנהיגה! 🎉</h3>
          <p className="text-[14px] text-[#434654] max-w-md mx-auto">
            לא ניתן להוסיף שיעורים או טסטים חדשים לאחר מעבר טסט מעשי וסיום תשלום דמי הרישום. ניתן לערוך את השיעורים והטסטים הקיימים במסכים הרלוונטיים.
          </p>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. LESSON FORM */}
      {/* ======================================================== */}
      {activeMode === 'lesson' && !hasPassedTest && (
        <form
          onSubmit={handleLessonSubmit}
          className="bg-white p-6 rounded-3xl border border-[#c3c5d7] shadow-xs space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex justify-between items-center border-b border-[#c3c5d7]/50 pb-3">
            <div className="flex items-center gap-2 text-[#003fb1]">
              <span className="material-symbols-outlined text-[24px]">speed</span>
              <h3 className="font-bold text-[17px] text-[#141c2b] text-right">הוספת שיעור נהיגה חדש</h3>
            </div>
            <span className="bg-[#e8eeff] text-[#003fb1] text-[12px] font-bold px-2.5 py-1 rounded-lg">
              שיעור מס' {totalCompletedCount + 1}
            </span>
          </div>

          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                תאריך השיעור
              </label>
              <input
                type="date"
                value={lessonDate}
                onChange={(e) => setLessonDate(e.target.value)}
                required
                className="w-full p-3 bg-white border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b] focus:ring-2 focus:ring-[#1a56db]"
              />
            </div>

            {/* Times */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1 text-right">
                  שעת התחלה
                </label>
                <input
                  type="time"
                  value={lessonStartTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[13px] text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1 text-right">
                  משך (דקות)
                </label>
                <select
                  value={lessonDuration}
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                  className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[13px] text-center bg-white cursor-pointer"
                >
                  <option value={40}>40 דק'</option>
                  <option value={80}>80 דק' (כפול)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1 text-right">
                  שעת סיום
                </label>
                <input
                  type="time"
                  value={lessonEndTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[13px] text-center bg-gray-50 font-medium"
                />
              </div>
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                נושא השיעור
              </label>
              <input
                type="text"
                value={lessonTopic}
                onChange={(e) => setLessonTopic(e.target.value)}
                placeholder="לדוגמה: נהיגה עירונית וחניה במקביל"
                required
                className="w-full p-3 bg-white border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b] focus:ring-2 focus:ring-[#1a56db]"
              />
            </div>

            {/* Location & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  נקודת איסוף / מיקום (אופציונלי)
                </label>
                <input
                  type="text"
                  value={lessonLocation}
                  onChange={(e) => setLessonLocation(e.target.value)}
                  placeholder="לדוגמה: מרכז העיר / ליד הבית"
                  className="w-full p-3 bg-white border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  מחיר השיעור (₪)
                </label>
                <input
                  type="number"
                  min={0}
                  value={lessonPrice}
                  onChange={(e) => setLessonPrice(Number(e.target.value))}
                  required
                  className="w-full p-3 bg-white border border-[#c3c5d7] rounded-xl text-[15px] font-bold text-[#003fb1]"
                />
              </div>
            </div>

            {/* Status & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                  סטטוס קיום השיעור
                </label>
                <div className="flex rounded-xl bg-[#f0f4ff] p-1 border border-[#c3c5d7]/50">
                  <button
                    type="button"
                    onClick={() => setLessonStatus('planned')}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all cursor-pointer ${
                      lessonStatus === 'planned'
                        ? 'bg-[#1a56db] text-white shadow-xs'
                        : 'text-[#434654] hover:text-[#141c2b]'
                    }`}
                  >
                    מתוכנן
                  </button>
                  <button
                    type="button"
                    onClick={() => setLessonStatus('completed')}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all cursor-pointer ${
                      lessonStatus === 'completed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-[#434654] hover:text-[#141c2b]'
                    }`}
                  >
                    התקיים
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLessonStatus('cancelled');
                      setLessonIsPaid(false);
                    }}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all cursor-pointer ${
                      lessonStatus === 'cancelled'
                        ? 'bg-[#ba1a1a] text-white shadow-xs'
                        : 'text-[#434654] hover:text-[#ba1a1a]'
                    }`}
                  >
                    בוטל
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                  סטטוס תשלום
                </label>
                {lessonStatus === 'cancelled' ? (
                  <div
                    className="flex items-center justify-center h-[34px] px-2 rounded-xl bg-gray-100 border border-gray-300 text-gray-400 text-[12px] font-bold cursor-not-allowed opacity-80"
                    title="לא ניתן לשלם (השיעור בוטל)"
                  >
                    לא ניתן לשלם (השיעור בוטל)
                  </div>
                ) : (
                  <div className="flex rounded-xl bg-[#f0f4ff] p-1 border border-[#c3c5d7]/50">
                    <button
                      type="button"
                      onClick={() => setLessonIsPaid(false)}
                      className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all cursor-pointer ${
                        !lessonIsPaid
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-[#434654]'
                      }`}
                    >
                      טרם שולם
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonIsPaid(true)}
                      className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all cursor-pointer ${
                        lessonIsPaid
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-[#434654]'
                      }`}
                    >
                      שולם
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                הערות / דגשים לשיעור
              </label>
              <textarea
                value={lessonNotes}
                onChange={(e) => setLessonNotes(e.target.value)}
                placeholder="למשל: דגש על מתן זכות קדימה במעגל תנועה..."
                rows={2}
                className="w-full p-3 bg-white border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b]"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1a56db] text-white py-3.5 rounded-2xl font-bold text-[15px] hover:bg-[#003fb1] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">check</span>
            שמור שיעור במערכת
          </button>
        </form>
      )}

      {/* ======================================================== */}
      {/* 2. TEST FORM (With Internal / External toggle inside) */}
      {/* ======================================================== */}
      {activeMode === 'test' && !hasPassedTest && (
        <form
          onSubmit={handleTestSubmit}
          className="bg-white p-6 rounded-3xl border border-emerald-300 shadow-xs space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex justify-between items-center border-b border-[#c3c5d7]/50 pb-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <span className="material-symbols-outlined text-[24px]">verified</span>
              <h3 className="font-bold text-[17px] text-[#141c2b] text-right">
                {testType === 'חיצוני' ? 'הוספת טסט חיצוני' : 'הוספת טסט פנימי'}
              </h3>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[12px] font-bold px-2.5 py-1 rounded-lg">
              {testType === 'חיצוני' ? `טסט חיצוני מס' ${externalTestsCount + 1}` : 'טסט פנימי'}
            </span>
          </div>

          {/* Test Type Selector Inside Form */}
          <div className="bg-[#f0f4ff] p-3 rounded-2xl border border-[#1a56db]/30 space-y-2">
            <label className="block text-[13px] font-bold text-[#003fb1] text-right px-1">
              בחר סוג טסט:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTestType('פנימי')}
                className={`py-3 px-4 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2.5 cursor-pointer text-center ${
                  testType === 'פנימי'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-white text-[#434654] hover:text-[#141c2b] border border-[#c3c5d7]/70 hover:bg-teal-50/40'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">assignment</span>
                <span>טסט פנימי (בית ספר לנהיגה)</span>
              </button>

              <button
                type="button"
                onClick={() => setTestType('חיצוני')}
                className={`py-3 px-4 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2.5 cursor-pointer text-center ${
                  testType === 'חיצוני'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white text-[#434654] hover:text-[#141c2b] border border-[#c3c5d7]/70 hover:bg-emerald-50/40'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">verified</span>
                <span>טסט חיצוני (משרד הרישוי)</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  תאריך הטסט
                </label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  required
                  className="w-full p-3 bg-white border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  שעת המבחן
                </label>
                <input
                  type="time"
                  value={testTime}
                  onChange={(e) => setTestTime(e.target.value)}
                  required
                  className="w-full p-3 bg-white border border-[#c3c5d7] rounded-xl text-[14px] text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                מיקום נקודת היציאה לטסט (אופציונלי)
              </label>
              <input
                type="text"
                value={testLocation}
                onChange={(e) => setTestLocation(e.target.value)}
                placeholder="למשל: סניף משרד הרישוי / נקודת מפגש"
                className="w-full p-3 bg-white border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b]"
              />
            </div>

            {/* Pricing fields depending on internal vs external */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
              <h4 className="text-[13px] font-bold text-emerald-900 text-right">
                פירוט עלויות הטסט ({testType})
              </h4>

              {testType === 'פנימי' ? (
                <div>
                  <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                    מחיר מבחן פנימי לביה"ס (₪)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={testInternalFee}
                    onChange={(e) => setTestInternalFee(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-[15px] font-bold text-emerald-900"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                      מחיר אגרת טסט (₪)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={testGovFee}
                      onChange={(e) => setTestGovFee(Number(e.target.value))}
                      required
                      className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-[14px] font-bold text-[#141c2b]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                      מחיר העמדת רכב לטסט (₪)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={testCarFee}
                      onChange={(e) => setTestCarFee(Number(e.target.value))}
                      required
                      className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-[14px] font-bold text-[#141c2b]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-emerald-200 text-[14px] font-bold text-emerald-950">
                <span>סך הכל עלות הטסט:</span>
                <span className="text-[18px]">₪{calculateTestTotal().toLocaleString()}</span>
              </div>
            </div>

            {/* Test Result & Payment Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                  תוצאת הטסט
                </label>
                {isTestPassedTime ? (
                  <select
                    value={testResult}
                    onChange={(e) => setTestResult(e.target.value as TestResultStatus)}
                    className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[13px] bg-white font-medium text-right"
                  >
                    <option value="pending_result">ממתין לתוצאה</option>
                    <option value="passed">עברתי בהצלחה! 🎉</option>
                    <option value="failed">נכשלתי (לא עברתי)</option>
                  </select>
                ) : (
                  <div className="w-full p-2.5 border border-amber-200 bg-amber-50 rounded-xl text-[12px] text-amber-900 font-medium text-right">
                    טסט עתידי – לא ניתן לעדכן תוצאה עד למועד הטסט
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                  סטטוס תשלום
                </label>
                <div className="flex rounded-xl bg-[#f0f4ff] p-1 border border-[#c3c5d7]/50 h-10 items-center">
                  <button
                    type="button"
                    onClick={() => setTestPaymentStatus('pending')}
                    className={`flex-1 py-1 text-[12px] font-bold rounded-lg transition-all ${
                      testPaymentStatus === 'pending'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-[#434654]'
                    }`}
                  >
                    ממתין לתשלום
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestPaymentStatus('paid')}
                    className={`flex-1 py-1 text-[12px] font-bold rounded-lg transition-all ${
                      testPaymentStatus === 'paid'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-[#434654]'
                    }`}
                  >
                    שולם במלואו
                  </button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                הערות לטסט
              </label>
              <textarea
                value={testNotes}
                onChange={(e) => setTestNotes(e.target.value)}
                placeholder="הערות לגבי הטסט, שמו של הטסטר או מסלול המבחן..."
                rows={2}
                className="w-full p-3 bg-white border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b]"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-[15px] hover:bg-emerald-800 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">check</span>
            שמור טסט במערכת
          </button>
        </form>
      )}

      {/* ======================================================== */}
      {/* 3. REGISTRATION FEE FORM (Only if not already paid) */}
      {/* ======================================================== */}
      {activeMode === 'registration-fee' && !isRegPaid && (
        <form
          onSubmit={handleRegistrationFeeSubmit}
          className="bg-white p-6 rounded-3xl border border-orange-300 shadow-xs space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex justify-between items-center border-b border-[#c3c5d7]/50 pb-3">
            <div className="flex items-center gap-2 text-orange-600">
              <span className="material-symbols-outlined text-[24px]">payments</span>
              <h3 className="font-bold text-[17px] text-[#141c2b] text-right">דיווח תשלום דמי רישום לביה"ס</h3>
            </div>
            <span className="bg-orange-100 text-orange-800 text-[12px] font-bold px-2.5 py-1 rounded-lg">
              חד פעמי
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                תאריך תשלום דמי הרישום
              </label>
              <input
                type="date"
                value={regFeeDate}
                onChange={(e) => setRegFeeDate(e.target.value)}
                required
                className="w-full p-3 bg-white border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                סכום דמי הרישום ששולם (₪)
              </label>
              <input
                type="number"
                min={0}
                value={regFeeAmount}
                onChange={(e) => setRegFeeAmount(Number(e.target.value))}
                required
                className="w-full p-3 bg-white border border-[#c3c5d7] rounded-xl text-[16px] font-bold text-orange-600"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                הערות / אסמכתא
              </label>
              <input
                type="text"
                value={regFeeNotes}
                onChange={(e) => setRegFeeNotes(e.target.value)}
                placeholder="לדוגמה: שולם בהעברה בנקאית / מזומן למזכירות"
                className="w-full p-3 bg-white border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3.5 rounded-2xl font-bold text-[15px] hover:bg-orange-600 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">check</span>
            אישור ודיווח תשלום דמי רישום
          </button>
        </form>
      )}
    </main>
  );
};

