import React, { useState } from 'react';
import { Lesson, StudentProfile } from '../types';
import { calculateEndTime, calculateDurationFromTimes, getNextSuggestedLessonTopic } from '../utils/lessonHelpers';

interface AddLessonViewProps {
  profile: StudentProfile;
  allLessons: Lesson[];
  onSaveLesson: (newLesson: Omit<Lesson, 'id'>) => void;
  onCancel: () => void;
  totalCompletedCount: number;
}

export const AddLessonView: React.FC<AddLessonViewProps> = ({
  profile,
  allLessons,
  onSaveLesson,
  onCancel,
  totalCompletedCount,
}) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const suggestedTopic = getNextSuggestedLessonTopic(allLessons);

  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState(currentHHMM);
  const [duration, setDuration] = useState(45);
  const [endTime, setEndTime] = useState(() => calculateEndTime(currentHHMM, 45));
  const [price, setPrice] = useState(profile?.pricePerLesson ?? 0);
  const [topic, setTopic] = useState(suggestedTopic);
  const [location, setLocation] = useState('תל אביב, מרכז');
  const [status, setStatus] = useState<'planned' | 'completed'>('planned');
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Auto sync end time when start time or duration changes
  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    setEndTime(calculateEndTime(newStart, duration));
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    setEndTime(calculateEndTime(startTime, newDuration));
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd);
    const calculated = calculateDurationFromTimes(startTime, newEnd);
    setDuration(calculated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);

      const dateObj = new Date(date);
      const monthsHebrew = [
        'ינואר',
        'פברואר',
        'מרץ',
        'אפריל',
        'מאי',
        'יוני',
        'יולי',
        'אוגוסט',
        'ספטמבר',
        'אוקטובר',
        'נובמבר',
        'דצמבר',
      ];
      const monthShortHebrew = [
        'ינו׳',
        'פבר׳',
        'מרץ',
        'אפר׳',
        'מאי',
        'יוני',
        'יולי',
        'אוג׳',
        'ספט׳',
        'אוק׳',
        'נוב׳',
        'דצמ׳',
      ];

      const dayNum = dateObj.getDate() || 14;
      const monthIdx = dateObj.getMonth() || 9;
      const year = dateObj.getFullYear() || 2024;

      const formattedDate = `${dayNum} ב${monthsHebrew[monthIdx]}, ${year}`;
      const monthDayShort = {
        month: monthShortHebrew[monthIdx],
        day: dayNum.toString(),
      };

      const fullTimeStr = `${startTime} - ${endTime}`;

      const newLessonData: Omit<Lesson, 'id'> = {
        lessonNumber: totalCompletedCount + 1,
        date,
        formattedDate,
        monthDayShort,
        time: fullTimeStr,
        duration,
        topic,
        instructor: profile.instructorName,
        location,
        price: Number(price),
        status,
        paymentStatus: isPaid ? 'paid' : 'pending',
        notes,
      };

      setTimeout(() => {
        onSaveLesson(newLessonData);
      }, 500);
    }, 600);
  };

  const nextCount = totalCompletedCount + (status === 'completed' ? 1 : 0);
  const requiredCount = profile.requiredLessons;
  const progressPercent = Math.min(100, Math.round((nextCount / requiredCount) * 100));

  return (
    <main className="max-w-xl mx-auto px-4 pt-4 pb-32 space-y-6">
      <div>
        <h2 className="text-[17px] font-bold text-[#141c2b] mb-1">הוספת שיעור</h2>
        <p className="text-[15px] text-[#434654]">
          הזן את פרטי השיעור החדש כדי לעקוב אחר התקדמות הנהיגה.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-[#c3c5d7] p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Topic / Name */}
          <div className="space-y-1.5">
            <label className="block text-[14px] font-semibold text-[#434654]">
              שם / נושא השיעור
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={`לדוגמה: שיעור ${totalCompletedCount + 1}`}
              required
              className="w-full h-12 px-4 bg-transparent border border-[#c3c5d7] rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-[#1a56db] transition-all text-[15px] text-[#141c2b] font-bold"
            />
          </div>

          {/* Date Field */}
          <div className="space-y-1.5">
            <label className="block text-[14px] font-semibold text-[#434654]">
              תאריך השיעור
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full h-12 px-4 bg-transparent border border-[#c3c5d7] rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-[#1a56db] transition-all text-[15px] text-[#141c2b]"
            />
          </div>

          {/* Time & Duration Auto Sync Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[12px] font-semibold text-[#434654]">
                שעת התחלה
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                required
                className="w-full h-11 px-2.5 bg-transparent border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12px] font-semibold text-[#434654]">
                משך (דקות)
              </label>
              <input
                type="number"
                min={10}
                max={240}
                step={5}
                value={duration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                required
                className="w-full h-11 px-3 bg-white border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b] font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12px] font-semibold text-[#434654]">
                שעת סיום
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                required
                className="w-full h-11 px-2.5 bg-transparent border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b]"
              />
            </div>
          </div>

          {/* Price Field */}
          <div className="space-y-1.5">
            <label className="block text-[14px] font-semibold text-[#434654]">
              מחיר השיעור (₪)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="0.00"
                required
                className="w-full h-12 px-4 bg-transparent border border-[#c3c5d7] rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-[#1a56db] transition-all text-[15px] text-[#141c2b]"
              />
              <span className="absolute left-4 font-bold text-[#737686]">₪</span>
            </div>
          </div>

          {/* Meeting Location */}
          <div className="space-y-1.5">
            <label className="block text-[14px] font-semibold text-[#434654]">
              נקודת מפגש / איסוף
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="לדוגמה: תל אביב, מרכז"
              className="w-full h-12 px-4 bg-transparent border border-[#c3c5d7] rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-[#1a56db] transition-all text-[15px] text-[#141c2b]"
            />
          </div>

          {/* Lesson Status Select */}
          <div className="space-y-1.5">
            <label className="block text-[14px] font-semibold text-[#434654]">
              סטטוס שיעור
            </label>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="lesson_status"
                  value="planned"
                  checked={status === 'planned'}
                  onChange={() => setStatus('planned')}
                  className="sr-only"
                />
                <div
                  className={`flex items-center justify-center py-3 border rounded-xl transition-all font-semibold text-[14px] ${
                    status === 'planned'
                      ? 'bg-[#1a56db] text-white border-[#1a56db] shadow-xs'
                      : 'bg-white text-[#434654] border-[#c3c5d7] hover:bg-[#f1f3ff]'
                  }`}
                >
                  עתידי
                </div>
              </label>

              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="lesson_status"
                  value="completed"
                  checked={status === 'completed'}
                  onChange={() => setStatus('completed')}
                  className="sr-only"
                />
                <div
                  className={`flex items-center justify-center py-3 border rounded-xl transition-all font-semibold text-[14px] ${
                    status === 'completed'
                      ? 'bg-[#1a56db] text-white border-[#1a56db] shadow-xs'
                      : 'bg-white text-[#434654] border-[#c3c5d7] hover:bg-[#f1f3ff]'
                  }`}
                >
                  בוצע
                </div>
              </label>
            </div>
          </div>

          {/* Payment Checkbox */}
          <div className="flex items-center justify-between bg-[#f1f3ff] p-4 rounded-xl border border-[#c3c5d7]/50">
            <div className="flex flex-col">
              <span className="font-semibold text-[14px] text-[#141c2b]">
                סטטוס תשלום
              </span>
              <span className="text-[12px] text-[#434654]">
                האם השיעור שולם במלואו?
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#c3c5d7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a56db]"></div>
            </label>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="block text-[14px] font-semibold text-[#434654]">
              הערות אישיות (אופציונלי)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="רשום הערות אישיות לגבי דגשי השיעור..."
              rows={2}
              className="w-full p-3 bg-transparent border border-[#c3c5d7] rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-[#1a56db] transition-all text-[14px] text-[#141c2b]"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving || savedSuccess}
              className={`w-full h-14 rounded-xl font-bold text-[18px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1a56db] text-white hover:bg-[#003fb1]'
              }`}
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[24px]">
                    sync
                  </span>
                  שומר שיעור...
                </>
              ) : savedSuccess ? (
                <>
                  <span className="material-symbols-outlined text-[24px]">
                    check_circle
                  </span>
                  נשמר בהצלחה!
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[24px]">save</span>
                  שמירת שיעור
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-full text-[#434654] font-medium text-[14px] py-2 hover:underline transition-all text-center block"
          >
            ביטול וחזרה
          </button>
        </form>
      </div>

      {/* Progress Indicator Card */}
      <div className="p-5 bg-[#e0e8fd] rounded-2xl border border-[#1a56db]/20 space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-[14px] text-[#141c2b]">
            התקדמות במסלול השיעורים
          </span>
          <span className="font-bold text-[14px] text-[#003fb1]">
            {nextCount} / {requiredCount}
          </span>
        </div>
        <div className="w-full bg-white h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#003fb1] h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </main>
  );
};
