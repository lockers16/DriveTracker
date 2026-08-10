import React, { useState } from 'react';
import { Lesson, StudentProfile } from '../types';
import { DEFAULT_STUDENT_PROFILE } from '../data/initialData';
import { isLessonPassed, calculateCompletedLessonUnits } from '../utils/lessonHelpers';
import { ShekelIcon } from './ShekelIcon';

interface LessonsListViewProps {
  lessons: Lesson[];
  profile?: StudentProfile;
  hasPassedTest?: boolean;
  onSelectLesson: (lesson: Lesson) => void;
  onAddNewLesson: () => void;
  onOpenTestGoalModal: () => void;
  onQuickUpdateLessonStatus?: (lessonId: string, status: 'completed' | 'cancelled', paymentStatus: 'paid' | 'pending') => void;
  onDeleteMultipleLessons?: (lessonIds: string[]) => void;
}

type FilterType = 'all' | 'completed' | 'unpaid' | 'planned';

export const LessonsListView: React.FC<LessonsListViewProps> = ({
  lessons = [],
  profile = DEFAULT_STUDENT_PROFILE,
  hasPassedTest = false,
  onSelectLesson,
  onAddNewLesson,
  onOpenTestGoalModal,
  onQuickUpdateLessonStatus,
  onDeleteMultipleLessons,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const completedCount = calculateCompletedLessonUnits(lessons || []);
  const requiredCount = profile?.requiredLessons || 28;
  const remainingCount = Math.max(0, requiredCount - completedCount);
  const progressPercent = Math.min(100, Math.round((completedCount / requiredCount) * 100));

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    const searchMatch =
      searchQuery === '' ||
      lesson.lessonNumber.toString().includes(searchQuery) ||
      lesson.topic.includes(searchQuery) ||
      lesson.formattedDate.includes(searchQuery);

    if (!searchMatch) return false;

    if (filter === 'completed') return lesson.status === 'completed';
    if (filter === 'unpaid') return lesson.paymentStatus === 'pending' && lesson.status === 'completed';
    if (filter === 'planned') return lesson.status === 'planned';
    return true;
  });

  const handleTrashButtonClick = () => {
    if (!isSelectMode) {
      setIsSelectMode(true);
      setSelectedIds(new Set());
    } else {
      if (selectedIds.size > 0) {
        setShowDeleteConfirmModal(true);
      } else {
        setIsSelectMode(false);
      }
    }
  };

  const toggleLessonSelection = (lessonId: string) => {
    const next = new Set(selectedIds);
    if (next.has(lessonId)) {
      next.delete(lessonId);
    } else {
      next.add(lessonId);
    }
    setSelectedIds(next);
  };

  return (
    <main className="px-4 pt-4 pb-28 max-w-2xl mx-auto space-y-5">
      {/* Page Title & Header Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-[#141c2b] tracking-tight">רשימת שיעורים</h2>
          <p className="text-[14px] text-[#434654]">מעקב אחר התקדמות לימודי הנהיגה שלך</p>
        </div>

        {/* Buttons container (In RTL: Leftmost = Trash button, Middle = New Lesson button, Rightmost = Completed count badge) */}
        <div className="flex items-stretch flex-wrap sm:flex-nowrap gap-2">
          {/* Red Trash Button Square (משמאל) */}
          <button
            onClick={handleTrashButtonClick}
            disabled={isSelectMode}
            className={`self-stretch w-[46px] min-h-[44px] rounded-xl font-bold transition-all flex items-center justify-center shadow-xs p-0 shrink-0 ${
              isSelectMode
                ? 'bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed shadow-none opacity-50'
                : 'bg-[#ba1a1a] hover:bg-red-700 text-white active:scale-95'
            }`}
            title={isSelectMode ? 'מצב מחיקה פעיל' : 'מחיקת שיעורים (בחירה מרובה)'}
          >
            <span className="material-symbols-outlined text-[22px]">delete</span>
          </button>

          {/* New Lesson Button (בין הפח למונה) with matching height */}
          {hasPassedTest ? (
            <button
              disabled={true}
              className="self-stretch bg-gray-200 border border-gray-300/60 text-gray-400 px-3.5 py-1.5 min-h-[44px] rounded-xl font-bold text-[13px] shadow-none flex items-center gap-1.5 cursor-not-allowed shrink-0 opacity-70"
              title="לא ניתן להוסיף שיעורים לאחר מעבר טסט"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>שיעור חדש</span>
            </button>
          ) : (
            <button
              onClick={onAddNewLesson}
              className="self-stretch bg-[#1a56db] hover:bg-[#003fb1] text-white px-3.5 py-1.5 min-h-[44px] rounded-xl font-bold text-[13px] shadow-xs transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
              title="הוספת שיעור נהיגה חדש"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>שיעור חדש</span>
            </button>
          )}

          {/* Lessons completed badge button (מימין) */}
          <button
            onClick={onOpenTestGoalModal}
            className="self-stretch bg-[#1a56db] text-white px-3.5 py-1.5 min-h-[44px] rounded-xl text-center shadow-xs hover:bg-[#003fb1] transition-colors flex flex-col justify-center shrink-0"
            title="לחץ לעריכת יעד השיעורים לטסט"
          >
            <span className="block text-[10px] opacity-80 font-medium leading-none">שיעורים שבוצעו</span>
            <span className="font-bold text-[17px] leading-tight">
              {completedCount}/{requiredCount}
            </span>
          </button>
        </div>
      </div>

      {/* Select Mode Banner */}
      {isSelectMode && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between text-[14px] animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-red-900 font-bold">
            <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">check_box</span>
            <span>מצב בחירת שיעורים למחיקה ({selectedIds.size} נבחרו)</span>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setShowDeleteConfirmModal(true)}
                className="bg-[#ba1a1a] text-white px-3 py-1 rounded-lg font-bold text-[13px] hover:bg-red-700 transition-colors shadow-xs"
              >
                מחק ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => {
                setIsSelectMode(false);
                setSelectedIds(new Set());
              }}
              className="text-[#434654] hover:text-[#141c2b] text-[13px] font-bold px-2 py-1"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Search Input & Horizontal Filter Scroll */}
      <div className="space-y-2.5">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש לפי שם/נושא, תאריך..."
            className="w-full h-11 pr-10 pl-4 bg-white border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b] focus:ring-2 focus:ring-[#1a56db] focus:border-[#1a56db] transition-all"
          />
          <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#737686] text-[20px]">
            search
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-2.5 text-[#737686] hover:text-[#141c2b]"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>

        {/* Filter Scroll Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sticky top-14 z-30 glass-filter -mx-4 px-4 py-2">
          <button
            onClick={() => setFilter('all')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[14px] font-medium transition-all ${
              filter === 'all'
                ? 'bg-[#003fb1] text-white shadow-xs'
                : 'bg-[#e8eeff] text-[#434654] hover:bg-[#e0e8fd] border border-[#c3c5d7]/60'
            }`}
          >
            הכל
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[14px] font-medium transition-all ${
              filter === 'completed'
                ? 'bg-[#003fb1] text-white shadow-xs'
                : 'bg-[#e8eeff] text-[#434654] hover:bg-[#e0e8fd] border border-[#c3c5d7]/60'
            }`}
          >
            בוצעו
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[14px] font-medium transition-all ${
              filter === 'unpaid'
                ? 'bg-[#003fb1] text-white shadow-xs'
                : 'bg-[#e8eeff] text-[#434654] hover:bg-[#e0e8fd] border border-[#c3c5d7]/60'
            }`}
          >
            טרם שולמו
          </button>
          <button
            onClick={() => setFilter('planned')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[14px] font-medium transition-all ${
              filter === 'planned'
                ? 'bg-[#003fb1] text-white shadow-xs'
                : 'bg-[#e8eeff] text-[#434654] hover:bg-[#e0e8fd] border border-[#c3c5d7]/60'
            }`}
          >
            עתידיים
          </button>
        </div>
      </div>

      {/* Lessons List */}
      <div className="flex flex-col gap-3">
        {lessons.length === 0 ? (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#c3c5d7]/50 text-center space-y-2 shadow-xs my-2">
            <span className="material-symbols-outlined text-[36px] text-[#1a56db]/40 block mx-auto">
              event_busy
            </span>
            <p className="font-bold text-[17px] text-[#141c2b]">אין שיעורים קודמים או מתוכננים</p>
            <p className="text-[13px] text-[#434654]">
              {hasPassedTest
                ? 'לא ניתן להוסיף שיעורים לאחר מעבר טסט'
                : 'לחץ על כפתור "שיעור חדש" כדי להוסיף שיעורים'}
            </p>
            {!hasPassedTest && (
              <div className="pt-2">
                <button
                  onClick={onAddNewLesson}
                  className="bg-[#1a56db] hover:bg-[#003fb1] text-white px-4 py-2 rounded-xl font-bold text-[13px] shadow-xs inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>שיעור חדש</span>
                </button>
              </div>
            )}
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center space-y-3 border border-[#c3c5d7]/50 my-4 shadow-xs">
            <span className="material-symbols-outlined text-[48px] text-[#737686]">find_in_page</span>
            <p className="text-[16px] font-bold text-[#141c2b]">לא נמצאו שיעורים להתאמה זו</p>
            <p className="text-[14px] text-[#434654]">נסה לשנות את הסינון או לחפש מילה אחרת.</p>
            <button
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
              className="text-[#003fb1] font-semibold text-[14px] hover:underline cursor-pointer"
            >
              אפס סינון
            </button>
          </div>
        ) : (
          filteredLessons.map((lesson) => {
            const isPlanned = lesson.status === 'planned';
            const isCancelled = lesson.status === 'cancelled';
            const isPaid = lesson.paymentStatus === 'paid';
            const hasPassed = isLessonPassed(lesson);

            return (
              <div
                key={lesson.id}
                onClick={() => {
                  if (isSelectMode) {
                    toggleLessonSelection(lesson.id);
                  } else {
                    onSelectLesson(lesson);
                  }
                }}
                className={`p-4 rounded-xl shadow-xs transition-all cursor-pointer flex flex-col gap-3 active:scale-[0.99] ${
                  isSelectMode && selectedIds.has(lesson.id)
                    ? 'bg-red-50 border-2 border-[#ba1a1a] shadow-md'
                    : isPlanned && !hasPassed
                    ? 'bg-[#003fb1]/5 border-2 border-[#003fb1] shadow-md'
                    : hasPassed
                    ? 'bg-amber-50/60 border-2 border-amber-400 shadow-sm'
                    : isCancelled
                    ? 'bg-white opacity-70 border border-[#c3c5d7]'
                    : 'bg-white border border-[#c3c5d7]/70 hover:border-[#003fb1]'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Right side info (RTL) */}
                  <div className="flex items-center gap-3">
                    {/* Select Mode Checkbox Indicator */}
                    {isSelectMode && (
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          selectedIds.has(lesson.id)
                            ? 'bg-[#ba1a1a] border-[#ba1a1a] text-white'
                            : 'border-[#c3c5d7] bg-white'
                        }`}
                      >
                        {selectedIds.has(lesson.id) && (
                          <span className="material-symbols-outlined text-[16px] font-bold">
                            check
                          </span>
                        )}
                      </div>
                    )}

                    {/* Date badge */}
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-center leading-tight shrink-0 ${
                        isPlanned && !hasPassed
                          ? 'bg-[#003fb1] text-white'
                          : hasPassed
                          ? 'bg-amber-500 text-white'
                          : 'bg-[#e0e8fd] text-[#003fb1]'
                      }`}
                    >
                      <span className="text-[11px] font-medium opacity-90">
                        {lesson.monthDayShort?.month || 'אפר׳'}
                      </span>
                      <span className="text-[18px] leading-none">
                        {lesson.monthDayShort?.day || lesson.lessonNumber}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-[17px] font-bold ${
                            isPlanned ? 'text-[#003fb1]' : 'text-[#141c2b]'
                          }`}
                        >
                          {lesson.topic}
                        </h3>

                        {/* Status Tags */}
                        {isCancelled ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
                            בוטל
                          </span>
                        ) : hasPassed ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold animate-pulse">
                            התקיים?
                          </span>
                        ) : isPlanned ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#1a56db] text-white text-[11px] font-bold">
                            עתידי
                          </span>
                        ) : isPaid ? (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold">
                            שולם
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold">
                            ממתין לתשלום
                          </span>
                        )}
                      </div>

                      <p className="text-[13px] text-[#434654] mt-0.5 flex items-center gap-1.5">
                        <span>{lesson.time.split('-')[0]} • {lesson.duration} דק׳</span>
                        {lesson.duration >= 70 && (
                          <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-[#e8eeff] text-[#003fb1]">
                            שיעור כפול
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Left side price */}
                  <div className="text-left flex flex-col items-end">
                    <span
                      className={`text-[18px] font-bold ${
                        isCancelled ? 'text-[#737686] line-through' : 'text-[#003fb1]'
                      }`}
                    >
                      ₪{lesson.price}
                    </span>
                    <span className="material-symbols-outlined text-[#737686] text-[18px]">
                      chevron_left
                    </span>
                  </div>
                </div>

                {/* If lesson date/time has passed, render action buttons row for "התקיים?" */}
                {hasPassed && !isSelectMode && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-300 mt-1"
                  >
                    <span className="text-[13px] font-bold text-amber-900">
                      האם השיעור התקיים?
                    </span>
                    <div className="flex items-center gap-2">
                      {/* V Button: Completed & Paid */}
                      <button
                        onClick={() =>
                          onQuickUpdateLessonStatus?.(lesson.id, 'completed', 'paid')
                        }
                        className="w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 shadow-xs active:scale-90 transition-transform"
                        title="התקיים ושולם"
                      >
                        <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                      </button>

                      {/* Check Button: Completed & Pending Payment */}
                      <button
                        onClick={() =>
                          onQuickUpdateLessonStatus?.(lesson.id, 'completed', 'pending')
                        }
                        className="w-9 h-9 bg-amber-600 text-white rounded-full flex items-center justify-center hover:bg-amber-700 shadow-xs active:scale-90 transition-transform"
                        title="התקיים וממתין לתשלום"
                      >
                        <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                      </button>

                      {/* X Button: Cancelled (Leftmost) */}
                      <button
                        onClick={() =>
                          onQuickUpdateLessonStatus?.(lesson.id, 'cancelled', 'pending')
                        }
                        className="w-9 h-9 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 shadow-xs active:scale-90 transition-transform"
                        title="לא התקיים (בוטל)"
                      >
                        <span className="material-symbols-outlined text-[20px] font-bold">close</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Progress Visual Card (Clickable to open Test Goal Modal) */}
      <div
        onClick={onOpenTestGoalModal}
        className="mt-6 bg-[#e8eeff] p-5 rounded-2xl flex flex-col gap-3 border border-[#c3c5d7]/50 cursor-pointer hover:border-[#003fb1] hover:shadow-md transition-all group"
      >
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-[15px] text-[#141c2b] flex items-center gap-2">
            התקדמות כללית לטסט
            <span className="material-symbols-outlined text-[16px] text-[#003fb1] group-hover:scale-110 transition-transform">
              edit
            </span>
          </h4>
          <span className="font-bold text-[14px] text-[#003fb1]">{progressPercent}%</span>
        </div>

        <div className="h-3 w-full bg-[#dbe2f8] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#003fb1] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <p className="text-[13px] text-[#434654] leading-relaxed">
          {remainingCount > 0
            ? `נותרו עוד ${remainingCount} שיעורים לרף היעד (${completedCount}/${requiredCount}). לחץ לשינוי היעד.`
            : 'עברת את מספר השיעורים הנדרש כדי לגשת לטסט!'}
        </p>
      </div>

      {/* Multiple Delete Confirmation Modal Popup */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center border border-[#c3c5d7]">
            <div className="w-12 h-12 bg-red-100 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <h3 className="text-[18px] font-bold text-[#141c2b]">מחיקת שיעורים</h3>
            <p className="text-[14px] text-[#434654] leading-relaxed">
              האם אתה בטוח שברצונך למחוק <span className="font-bold text-[#ba1a1a]">{selectedIds.size}</span> שיעורים שנבחרו? פעולה זו אינה ניתנת לבטול.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (onDeleteMultipleLessons) {
                    onDeleteMultipleLessons(Array.from(selectedIds));
                  }
                  setIsSelectMode(false);
                  setSelectedIds(new Set());
                  setShowDeleteConfirmModal(false);
                }}
                className="flex-1 bg-[#ba1a1a] text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-xs"
              >
                מחק {selectedIds.size} שיעורים
              </button>
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="flex-1 border border-[#c3c5d7] py-3 rounded-xl text-[#434654] font-medium hover:bg-[#f1f3ff]"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
