import React, { useState } from 'react';
import { Lesson, DrivingTest, StudentProfile, NavigationTab } from '../types';
import { isLessonPassed } from '../utils/lessonHelpers';

interface DashboardViewProps {
  lessons: Lesson[];
  tests: DrivingTest[];
  profile: StudentProfile;
  onSelectLesson: (lesson: Lesson) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onQuickAdd: () => void;
  onOpenTestGoalModal: () => void;
  onQuickUpdateLessonStatus?: (lessonId: string, status: 'completed' | 'cancelled', paymentStatus: 'paid' | 'pending') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lessons,
  tests = [],
  profile,
  onSelectLesson,
  onNavigateTab,
  onQuickAdd,
  onOpenTestGoalModal,
  onQuickUpdateLessonStatus,
}) => {
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Compute stats
  const completedLessons = lessons.filter((l) => l.status === 'completed');
  const completedCount = completedLessons.length;

  const lessonsPaidSum = lessons
    .filter((l) => l.paymentStatus === 'paid' && l.status === 'completed')
    .reduce((sum, l) => sum + l.price, 0);

  const testsPaidSum = tests
    .filter((t) => t.paymentStatus === 'paid')
    .reduce((sum, t) => sum + t.totalPrice, 0);

  const totalPaid = lessonsPaidSum + testsPaidSum;

  const externalTestsCount = tests.filter((t) => t.type === 'חיצוני').length;
  const hasTests = tests.length > 0;

  const hasPassedExternalTest = tests.some((t) => t.type === 'חיצוני' && t.result === 'passed');

  const requiredCount = profile.requiredLessons;
  const progressPercent = Math.min(100, Math.round((completedCount / requiredCount) * 100));

  // Find next upcoming item (closest future lesson or test)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localDateStr = `${year}-${month}-${day}`;
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentKey = `${localDateStr} ${hours}:${minutes}`;

  const parseTimeStart = (t: string) => {
    if (!t) return '00:00';
    return t.split('-')[0].trim().padStart(5, '0');
  };

  type UpcomingItem =
    | { type: 'lesson'; data: Lesson; dateKey: string }
    | { type: 'test'; data: DrivingTest; dateKey: string };

  const plannedLessons = lessons.filter(
    (l) =>
      l.status !== 'completed' &&
      l.status !== 'cancelled' &&
      `${l.date} ${parseTimeStart(l.time)}` >= currentKey
  );

  const plannedTests = tests.filter(
    (t) =>
      t.result !== 'passed' &&
      t.result !== 'failed' &&
      `${t.date} ${parseTimeStart(t.time)}` >= currentKey
  );

  const upcomingItems: UpcomingItem[] = [
    ...plannedLessons.map((l) => ({ type: 'lesson' as const, data: l, dateKey: `${l.date} ${parseTimeStart(l.time)}` })),
    ...plannedTests.map((t) => ({ type: 'test' as const, data: t, dateKey: `${t.date} ${parseTimeStart(t.time)}` })),
  ].sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  const nextUpcoming = upcomingItems[0];

  type RecentItem =
    | { itemType: 'lesson'; data: Lesson; dateKey: string }
    | { itemType: 'test'; data: DrivingTest; dateKey: string };

  const recentActivityList: RecentItem[] = [
    ...lessons.map((l) => ({ itemType: 'lesson' as const, data: l, dateKey: `${l.date} ${parseTimeStart(l.time)}` })),
    ...tests.map((t) => ({ itemType: 'test' as const, data: t, dateKey: `${t.date} ${parseTimeStart(t.time)}` })),
  ].sort((a, b) => b.dateKey.localeCompare(a.dateKey)).slice(0, 4);

  return (
    <main className="px-4 pt-4 pb-32 max-w-2xl mx-auto space-y-6">
      {/* Congratulations Banner if user passed a practical test */}
      {hasPassedExternalTest && (
        <div className="bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 text-white rounded-2xl p-5 shadow-lg border border-amber-300/40 relative overflow-hidden flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-500">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-1.5 text-amber-200 text-[13px] font-bold tracking-wide uppercase">
              <span className="material-symbols-outlined text-[20px]">celebration</span>
              ברכות על הוצאת הרישיון!
            </div>
            <h2 className="text-[19px] sm:text-[21px] font-black leading-tight">
              מזל טוב! עברת בהצלחה את מבחן הנהיגה המעשי! 🎉
            </h2>
            <p className="text-[13px] sm:text-[14px] text-emerald-100 font-medium">
              סיימת בהצלחה את תהליך לימודי הנהיגה!
            </p>
          </div>
          <div className="text-[44px] sm:text-[52px] shrink-0 z-10">
            🥳
          </div>
          <div className="absolute -left-6 -bottom-6 opacity-15 pointer-events-none text-white">
            <span className="material-symbols-outlined text-[130px]">celebration</span>
          </div>
        </div>
      )}

      {/* Quick Stats Bento Grid */}
      <section className={`grid gap-3.5 ${hasTests ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {/* 1. Total Lessons */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#c3c5d7]/50 flex flex-col justify-between hover:border-[#1a56db]/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[#003fb1] material-symbols-outlined bg-[#dbe1ff] p-2 rounded-lg text-[22px]">
              speed
            </span>
          </div>
          <div className="mt-2">
            <p className="text-[12px] font-medium text-[#434654]">סה"כ שיעורים</p>
            <p className="text-[26px] font-bold text-[#141c2b] leading-tight">{completedCount}</p>
          </div>
        </div>

        {/* 2. Amount Paid (Lessons + Tests) */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#c3c5d7]/50 flex flex-col justify-between hover:border-[#1a56db]/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[#852b00] material-symbols-outlined bg-[#ffdbcf] p-2 rounded-lg text-[22px]">
              payments
            </span>
          </div>
          <div className="mt-2">
            <p className="text-[12px] font-medium text-[#434654]">סכום ששולם</p>
            <p className="text-[24px] sm:text-[26px] font-bold text-[#141c2b] leading-tight">₪{totalPaid.toLocaleString()}</p>
          </div>
        </div>

        {/* 3. Progress Card */}
        <div
          onClick={onOpenTestGoalModal}
          className="bg-white p-4 rounded-xl shadow-xs border border-[#c3c5d7]/50 flex flex-col justify-between cursor-pointer hover:border-[#1a56db] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#7127e5] material-symbols-outlined bg-[#eaddff] p-2 rounded-lg text-[22px] group-hover:scale-110 transition-transform">
              trending_up
            </span>
            <p className="text-[13px] font-semibold text-[#141c2b]">התקדמות לטסט</p>
          </div>
          <div className="space-y-2 mt-auto">
            <div className="w-full h-3 bg-[#e8eeff] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a56db] rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[12px] font-semibold">
              <span className="text-[#434654]">
                {completedCount} מתוך {requiredCount}
              </span>
              <span className="text-[#003fb1] font-bold">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* 4. External Tests Count (Far left in RTL order) - Shown if tests.length > 0 */}
        {hasTests && (
          <div
            onClick={() => onNavigateTab('tests')}
            className="bg-white p-4 rounded-xl shadow-xs border border-[#c3c5d7]/50 flex flex-col justify-between cursor-pointer hover:border-[#1a56db] transition-all"
          >
            <div className="flex justify-between items-start">
              <span className="text-emerald-700 material-symbols-outlined bg-emerald-100 p-2 rounded-lg text-[22px]">
                verified
              </span>
            </div>
            <div className="mt-2">
              <p className="text-[12px] font-medium text-[#434654]">טסטים חיצוניים עד כה</p>
              <p className="text-[26px] font-bold text-[#141c2b] leading-tight">{externalTestsCount}</p>
            </div>
          </div>
        )}
      </section>

      {/* Next Session Highlight (Closest upcoming Lesson or Test) */}
      <section className="space-y-3">
        <h2 className="text-[17px] font-bold text-[#141c2b]">
          {nextUpcoming?.type === 'test' && nextUpcoming.data.type === 'חיצוני'
            ? 'המבחן המעשי הבא'
            : 'השיעור הבא'}
        </h2>
        
        {nextUpcoming ? (
          nextUpcoming.type === 'lesson' ? (
            <div
              onClick={() => onSelectLesson(nextUpcoming.data)}
              className="relative overflow-hidden bg-[#1a56db] text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="absolute -left-6 -bottom-6 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined !text-[140px]">directions_car</span>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/90">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span className="text-[14px] font-medium">{nextUpcoming.data.formattedDate}</span>
                  </div>
                  <h3 className="text-[20px] sm:text-[22px] font-bold leading-tight">
                    {nextUpcoming.data.time.split('-')[0]} - {nextUpcoming.data.topic}
                  </h3>
                  <div className="flex items-center gap-2 text-white/90">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span className="text-[14px]">מורה נהיגה: {nextUpcoming.data.instructor || profile.instructorName}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 md:pt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLocationModal(true);
                    }}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-[14px] font-semibold transition-colors flex items-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    מיקום איסוף
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => onNavigateTab('tests')}
              className="relative overflow-hidden bg-gradient-to-r from-[#003fb1] to-[#1a56db] text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="absolute -left-6 -bottom-6 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined !text-[140px]">verified</span>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span className="text-[14px] font-bold">טסט {nextUpcoming.data.type}</span>
                  </div>
                  <h3 className="text-[20px] sm:text-[22px] font-bold leading-tight">
                    {nextUpcoming.data.formattedDate} בשעה {nextUpcoming.data.time}
                  </h3>
                  <div className="flex items-center gap-2 text-white/90">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span className="text-[14px]">{nextUpcoming.data.location || 'משרד הרישוי'}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateTab('tests');
                  }}
                  className="bg-white text-[#003fb1] font-bold px-4 py-2 rounded-xl text-[14px] shadow-sm hover:bg-emerald-50 transition-colors"
                >
                  מעבר לעמוד טסטים
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-[#c3c5d7]/50 text-center text-[#737686] space-y-2">
            <span className="material-symbols-outlined text-[36px] text-[#1a56db]/40 block mx-auto">
              event_busy
            </span>
            <p className="font-bold text-[16px] text-[#141c2b]">אין שיעורים בקרוב</p>
            <p className="text-[13px] text-[#434654]">ניתן להוסיף שיעור או טסט חדש בלחיצה על כפתור הפלוס</p>
          </div>
        )}
      </section>

      {/* Recent Activity / History (Lessons & Tests) */}
      <section className="space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-[17px] font-bold text-[#141c2b]">
            {hasTests ? 'שיעורים וטסטים אחרונים' : 'שיעורים אחרונים'}
          </h2>

          {hasTests ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('lessons')}
                className="bg-[#e8eeff] hover:bg-[#dbe1ff] text-[#003fb1] font-bold text-[12px] sm:text-[13px] px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-xs active:scale-95"
              >
                כל השיעורים
                <span className="material-symbols-outlined text-[16px] font-bold">chevron_left</span>
              </button>
              <button
                onClick={() => onNavigateTab('tests')}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[12px] sm:text-[13px] px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-xs active:scale-95"
              >
                כל הטסטים
                <span className="material-symbols-outlined text-[16px] font-bold">chevron_left</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigateTab('lessons')}
              className="bg-[#e8eeff] hover:bg-[#dbe1ff] text-[#003fb1] font-bold text-[13px] px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-xs active:scale-95"
            >
              הצג הכל
              <span className="material-symbols-outlined text-[16px] font-bold">chevron_left</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {recentActivityList.map((activityItem) => {
            if (activityItem.itemType === 'lesson') {
              const lesson = activityItem.data;
              const hasPassed = isLessonPassed(lesson);

              return (
                <div
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className="bg-white p-3.5 rounded-xl border border-[#c3c5d7]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-[#1a56db] hover:shadow-xs transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#e8eeff] rounded-full flex items-center justify-center text-[#003fb1] shrink-0">
                      <span className="material-symbols-outlined text-[22px]">
                        {lesson.topic.includes('לילה')
                          ? 'nightlight'
                          : lesson.topic.includes('בינעירונית')
                          ? 'route'
                          : 'directions_car'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-[#141c2b]">{lesson.topic}</p>
                      <p className="text-[12px] text-[#434654]">{lesson.formattedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-[#c3c5d7]/30">
                    {hasPassed ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl"
                      >
                        <span className="text-[12px] font-bold text-amber-800 ml-1">התקיים?</span>
                        <button
                          onClick={() => onQuickUpdateLessonStatus?.(lesson.id, 'completed', 'paid')}
                          className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 active:scale-90"
                          title="התקיים ושולם"
                        >
                          <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                        </button>
                        <button
                          onClick={() => onQuickUpdateLessonStatus?.(lesson.id, 'completed', 'pending')}
                          className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center hover:bg-amber-700 active:scale-90"
                          title="התקיים וממתין לתשלום"
                        >
                          <span className="material-symbols-outlined text-[16px]">payments</span>
                        </button>
                        <button
                          onClick={() => onQuickUpdateLessonStatus?.(lesson.id, 'cancelled', 'pending')}
                          className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 active:scale-90"
                          title="בוטל"
                        >
                          <span className="material-symbols-outlined text-[18px] font-bold">close</span>
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          lesson.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : lesson.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : lesson.status === 'planned'
                            ? 'bg-[#1a56db] text-white'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {lesson.status === 'cancelled'
                          ? 'בוטל'
                          : lesson.status === 'planned'
                          ? 'עתידי'
                          : lesson.paymentStatus === 'paid'
                          ? 'שולם'
                          : 'ממתין לתשלום'}
                      </span>
                    )}

                    <span className="material-symbols-outlined text-[#737686] text-[18px]">
                      chevron_left
                    </span>
                  </div>
                </div>
              );
            } else {
              // Test Activity Card
              const test = activityItem.data;
              const isPassed = test.result === 'passed';
              const isFailed = test.result === 'failed';

              return (
                <div
                  key={test.id}
                  onClick={() => onNavigateTab('tests')}
                  className="bg-[#f0f4ff] p-3.5 rounded-xl border border-[#1a56db]/30 flex items-center justify-between gap-2 hover:border-[#1a56db] transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">verified</span>
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-[#141c2b]">
                        טסט {test.type}
                      </p>
                      <p className="text-[12px] text-[#434654]">{test.formattedDate} ({test.time})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isFailed
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {isPassed ? 'עברתי! 🎉' : isFailed ? 'נכשלתי' : 'לא ידוע'}
                    </span>
                    <span className="material-symbols-outlined text-[#737686] text-[18px]">
                      chevron_left
                    </span>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </section>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-[#c3c5d7]">
            <button
              onClick={() => setShowLocationModal(false)}
              className="absolute top-4 left-4 p-1 rounded-full text-[#737686] hover:bg-[#e8eeff] transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-2 text-[#003fb1]">
              <span className="material-symbols-outlined text-[28px]">location_on</span>
              <h3 className="text-[20px] font-bold">מיקום איסוף</h3>
            </div>
            <p className="text-[#434654] text-[15px]">
              נקודת האיסוף לשיעור הבא ({nextUpcoming?.type === 'lesson' ? nextUpcoming.data.topic : ''}):{' '}
              <span className="font-bold text-[#141c2b]">
                {nextUpcoming?.type === 'lesson' ? nextUpcoming.data.location : profile.instructorName}
              </span>
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const loc = nextUpcoming?.type === 'lesson' ? nextUpcoming.data.location : 'תל אביב';
                  window.open(`https://maps.google.com/?q=${encodeURIComponent(loc)}`, '_blank');
                }}
                className="flex-1 bg-[#1a56db] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#003fb1] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">near_me</span>
                פתח ב-Waze / Google Maps
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Add Button */}
      <button
        onClick={onQuickAdd}
        className="fixed bottom-20 left-4 w-14 h-14 bg-[#1a56db] text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-all z-40 group hover:bg-[#003fb1]"
        title="הוסף שיעור חדש"
      >
        <span className="material-symbols-outlined text-[32px] transition-transform group-hover:rotate-90">
          add
        </span>
      </button>
    </main>
  );
};
