import React, { useState } from 'react';
import { Lesson, StudentProfile } from '../types';
import { DEFAULT_STUDENT_PROFILE } from '../data/initialData';
import { calculateEndTime, calculateDurationFromTimes } from '../utils/lessonHelpers';

interface LessonDetailsViewProps {
  lesson: Lesson;
  profile?: StudentProfile;
  completedCount: number;
  onBack: () => void;
  onUpdateLesson: (updated: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
}

export const LessonDetailsView: React.FC<LessonDetailsViewProps> = ({
  lesson,
  profile = DEFAULT_STUDENT_PROFILE,
  completedCount,
  onBack,
  onUpdateLesson,
  onDeleteLesson,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(lesson.notes || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Parse initial time
  const timeParts = (lesson.time || '').split('-');
  const initialStart = timeParts[0] ? timeParts[0].trim() : '16:30';
  const initialEnd = timeParts[1] ? timeParts[1].trim() : calculateEndTime(initialStart, lesson.duration || 45);

  // Edit form states
  const [editTopic, setEditTopic] = useState(lesson.topic || '');
  const [editStartTime, setEditStartTime] = useState(initialStart);
  const [editDuration, setEditDuration] = useState(lesson.duration || 45);
  const [editEndTime, setEditEndTime] = useState(initialEnd);
  const [editLocation, setEditLocation] = useState(lesson.location || '');
  const [editPrice, setEditPrice] = useState(lesson.price || 150);
  const [editStatus, setEditStatus] = useState(lesson.status || 'planned');
  const [editPayment, setEditPayment] = useState(lesson.paymentStatus || 'pending');

  const requiredCount = profile?.requiredLessons || 28;
  const progressPercent = Math.min(100, Math.round((completedCount / requiredCount) * 100));

  // Time Sync Handlers
  const handleStartTimeChange = (newStart: string) => {
    setEditStartTime(newStart);
    setEditEndTime(calculateEndTime(newStart, editDuration));
  };

  const handleDurationChange = (newDuration: number) => {
    setEditDuration(newDuration);
    setEditEndTime(calculateEndTime(editStartTime, newDuration));
    const basePrice = profile?.pricePerLesson ?? 0;
    if (basePrice > 0) {
      setEditPrice(newDuration >= 70 ? basePrice * 2 : basePrice);
    }
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEditEndTime(newEnd);
    const calculated = calculateDurationFromTimes(editStartTime, newEnd);
    setEditDuration(calculated);
    const basePrice = profile?.pricePerLesson ?? 0;
    if (basePrice > 0) {
      setEditPrice(calculated >= 70 ? basePrice * 2 : basePrice);
    }
  };

  const handleSaveNotes = () => {
    onUpdateLesson({
      ...lesson,
      notes: editedNotes,
    });
    setIsEditingNotes(false);
  };

  const handleTogglePayment = () => {
    if (lesson.status === 'cancelled') return;
    const newPaymentStatus = lesson.paymentStatus === 'paid' ? 'pending' : 'paid';
    onUpdateLesson({
      ...lesson,
      paymentStatus: newPaymentStatus,
    });
  };

  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullTimeStr = `${editStartTime} - ${editEndTime}`;
    const finalPayment = editStatus === 'cancelled' ? 'pending' : editPayment;

    onUpdateLesson({
      ...lesson,
      topic: editTopic,
      time: fullTimeStr,
      duration: editDuration,
      location: editLocation,
      price: Number(editPrice),
      status: editStatus,
      paymentStatus: finalPayment,
    });
    setShowEditModal(false);
  };

  const isPaid = lesson.paymentStatus === 'paid';

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 pb-28 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Lesson Info */}
        <section className="md:col-span-8 space-y-5">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-[#c3c5d7]">
            {/* Header / Status & Type */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[#434654] text-[13px] font-semibold">סטטוס שיעור</p>
                <span
                  className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-[12px] font-bold border ${
                    isPaid
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : lesson.status === 'cancelled'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] ml-1 fill-1">
                    {isPaid
                      ? 'check_circle'
                      : lesson.status === 'cancelled'
                      ? 'cancel'
                      : 'schedule'}
                  </span>
                  {isPaid
                    ? 'שולם'
                    : lesson.status === 'cancelled'
                    ? 'בוטל'
                    : 'ממתין לתשלום'}
                </span>
              </div>

              <div className="text-left">
                <p className="text-[#434654] text-[13px] font-semibold">סוג / נושא שיעור</p>
                <p className="font-bold text-[18px] sm:text-[20px] text-[#141c2b]">
                  {lesson.topic}
                </p>
              </div>
            </div>

            {/* 4 Detail Pills Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-[#f1f3ff] border border-[#c3c5d7]/40">
                <span className="material-symbols-outlined text-[#003fb1] mb-1 text-[20px]">
                  calendar_today
                </span>
                <p className="text-[#434654] text-[11px] font-medium">תאריך</p>
                <p className="font-bold text-[13px] text-[#141c2b]">
                  {lesson.formattedDate}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#f1f3ff] border border-[#c3c5d7]/40">
                <span className="material-symbols-outlined text-[#003fb1] mb-1 text-[20px]">
                  schedule
                </span>
                <p className="text-[#434654] text-[11px] font-medium">שעה</p>
                <p className="font-bold text-[13px] text-[#141c2b]">{lesson.time}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#f1f3ff] border border-[#c3c5d7]/40">
                <span className="material-symbols-outlined text-[#003fb1] mb-1 text-[20px]">
                  timer
                </span>
                <p className="text-[#434654] text-[11px] font-medium">משך זמן</p>
                <p className="font-bold text-[13px] text-[#141c2b]">
                  {lesson.duration} דקות {lesson.duration >= 70 ? '(שיעור כפול)' : ''}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#f1f3ff] border border-[#c3c5d7]/40">
                <span className="material-symbols-outlined text-[#003fb1] mb-1 text-[20px]">
                  location_on
                </span>
                <p className="text-[#434654] text-[11px] font-medium">מיקום איסוף</p>
                <p className="font-bold text-[13px] text-[#141c2b] truncate">
                  {lesson.location}
                </p>
              </div>
            </div>

            {/* Personal Notes ("הערות אישיות") */}
            <div className="space-y-2 pt-2 border-t border-[#c3c5d7]/50">
              <div className="flex justify-between items-center">
                <h3 className="text-[#434654] font-bold text-[14px]">
                  הערות אישיות
                </h3>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-[#003fb1] text-[12px] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    ערוך הערה
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-[#1a56db] rounded-xl text-[14px] text-[#141c2b] focus:ring-2 focus:ring-[#1a56db]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNotes}
                      className="px-4 py-1.5 bg-[#1a56db] text-white rounded-lg text-[13px] font-bold hover:bg-[#003fb1]"
                    >
                      שמור הערה
                    </button>
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1.5 text-[#434654] text-[13px] hover:underline"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[#141c2b] text-[15px] leading-relaxed py-1 bg-[#f9f9ff] p-3 rounded-xl border border-[#c3c5d7]/30 italic">
                  {lesson.notes || 'לא נרשמו הערות אישיות לשיעור זה.'}
                </p>
              )}
            </div>
          </div>

          {/* Progress Visual */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#c3c5d7]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[16px] text-[#141c2b]">התקדמות כללית</h3>
              <span className="text-[#003fb1] font-bold text-[14px]">
                {completedCount} מתוך {requiredCount} שיעורים
              </span>
            </div>

            <div className="h-3 w-full bg-[#e8eeff] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#003fb1] transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* Sidebar Info & Payment Summary */}
        <aside className="md:col-span-4 space-y-5">
          {/* Payment Summary */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#c3c5d7] bg-gradient-to-br from-white to-[#f1f3ff]">
            <h3 className="font-bold text-[16px] text-[#141c2b] mb-3">מחיר השיעור</h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-[#434654] font-medium">עלות השיעור</span>
                <span className="font-bold text-[22px] text-[#003fb1]">₪{lesson.price}</span>
              </div>
            </div>

            <div className="mt-4">
              {isPaid ? (
                <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px] fill-1">
                      verified
                    </span>
                    <span className="text-emerald-800 text-[13px] font-bold">
                      התשלום התקבל בהצלחה
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl flex items-center justify-between border border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600 text-[20px]">
                      pending
                    </span>
                    <span className="text-amber-800 text-[13px] font-bold">
                      ממתין לתשלום
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            {lesson.status === 'cancelled' ? (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 bg-gray-100 border border-gray-300 text-gray-400 py-3.5 rounded-xl font-bold text-[15px] cursor-not-allowed opacity-80 shadow-none"
                title="לא ניתן לשלם (השיעור בוטל)"
              >
                <span className="material-symbols-outlined text-[20px] text-gray-400">block</span>
                לא ניתן לשלם (השיעור בוטל)
              </button>
            ) : isPaid ? (
              <button
                onClick={handleTogglePayment}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-bold text-[16px] transition-colors shadow-xs active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">undo</span>
                בטל סימון תשלום
              </button>
            ) : (
              <button
                onClick={handleTogglePayment}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-[16px] transition-colors shadow-xs active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">payments</span>
                סמן כשולם
              </button>
            )}

            <button
              onClick={() => setShowEditModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#003fb1] text-white py-3.5 rounded-xl font-bold text-[16px] hover:bg-[#002d80] transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
              עריכת פרטי שיעור
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#ba1a1a] hover:bg-red-700 text-white py-3.5 rounded-xl font-bold text-[16px] transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
              מחיקת שיעור
            </button>
          </div>
        </aside>
      </div>

      {/* Edit Lesson Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center border-b border-[#c3c5d7] pb-3">
              <h3 className="text-[20px] font-bold text-[#141c2b]">
                עריכת שיעור {lesson.lessonNumber}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#737686] hover:text-[#141c2b]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveFullEdit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1">
                  נושא השיעור
                </label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full p-3 border border-[#c3c5d7] rounded-xl text-[14px]"
                  required
                />
              </div>

              {/* Time Sync Controls */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                    שעת התחלה
                  </label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[13px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                    משך השיעור
                  </label>
                  <select
                    value={editDuration}
                    onChange={(e) => handleDurationChange(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[13px] font-bold bg-white cursor-pointer"
                    required
                  >
                    <option value={40}>40 דק'</option>
                    <option value={80}>80 דק' (כפול)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                    שעת סיום
                  </label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[13px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1">
                  מיקום איסוף
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full p-3 border border-[#c3c5d7] rounded-xl text-[14px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-[#434654] mb-1">
                    מחיר (₪)
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full p-3 border border-[#c3c5d7] rounded-xl text-[14px]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#434654] mb-1">
                    סטטוס תשלום
                  </label>
                  <select
                    value={editStatus === 'cancelled' ? 'pending' : editPayment}
                    disabled={editStatus === 'cancelled'}
                    onChange={(e) => setEditPayment(e.target.value as any)}
                    className={`w-full p-3 border rounded-xl text-[14px] ${
                      editStatus === 'cancelled'
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-80'
                        : 'border-[#c3c5d7] bg-white cursor-pointer'
                    }`}
                  >
                    {editStatus === 'cancelled' ? (
                      <option value="pending">לא ניתן לשלם (השיעור בוטל)</option>
                    ) : (
                      <>
                        <option value="paid">שולם</option>
                        <option value="pending">ממתין לתשלום</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1">
                  סטטוס שיעור
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    setEditStatus(newStatus);
                    if (newStatus === 'cancelled') {
                      setEditPayment('pending');
                    }
                  }}
                  className="w-full p-3 border border-[#c3c5d7] rounded-xl text-[14px] bg-white cursor-pointer"
                >
                  <option value="completed">בוצע</option>
                  <option value="planned">עתידי</option>
                  <option value="cancelled">בוטל</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#1a56db] text-white py-3 rounded-xl font-bold hover:bg-[#003fb1] transition-colors"
                >
                  שמור שינויים
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-3 border border-[#c3c5d7] rounded-xl text-[#434654]"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">delete</span>
            </div>
            <h3 className="text-[18px] font-bold text-[#141c2b]">מחיקת שיעור {lesson.lessonNumber}</h3>
            <p className="text-[14px] text-[#434654]">
              האם אתה בטוח שברצונך למחוק שיעור זה?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onDeleteLesson(lesson.id);
                  setShowDeleteModal(false);
                  onBack();
                }}
                className="flex-1 bg-[#ba1a1a] text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                מחק
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-[#c3c5d7] py-3 rounded-xl text-[#434654] font-medium"
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
