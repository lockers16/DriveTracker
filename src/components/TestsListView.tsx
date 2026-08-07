import React, { useState } from 'react';
import { DrivingTest, StudentProfile, TestResultStatus, PaymentStatus } from '../types';
import { DEFAULT_STUDENT_PROFILE } from '../data/initialData';
import { isTestDateTimePassed } from '../utils/lessonHelpers';
import { EditTestModal } from './EditTestModal';

interface TestsListViewProps {
  tests: DrivingTest[];
  profile?: StudentProfile;
  hasPassedTest?: boolean;
  onAddNewTest: () => void;
  onUpdateTestStatus: (testId: string, result: TestResultStatus, paymentStatus?: PaymentStatus) => void;
  onUpdateTest: (test: DrivingTest) => void;
  onDeleteTest: (testId: string) => void;
}

export const TestsListView: React.FC<TestsListViewProps> = ({
  tests = [],
  profile = DEFAULT_STUDENT_PROFILE,
  hasPassedTest = false,
  onAddNewTest,
  onUpdateTestStatus,
  onUpdateTest,
  onDeleteTest,
}) => {
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'pending'>('all');
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [editingTest, setEditingTest] = useState<DrivingTest | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Compute stats ONLY for EXTERNAL tests ('חיצוני')
  const externalTests = (tests || []).filter((t) => t.type === 'חיצוני');
  const externalTestsAsc = [...externalTests].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const passedCount = externalTests.filter((t) => t.result === 'passed').length;
  const failedCount = externalTests.filter((t) => t.result === 'failed').length;
  const pendingCount = externalTests.filter((t) => t.result === 'pending_result' || t.result === 'planned').length;

  const filteredTests = tests
    .filter((t) => {
      if (filter === 'passed') return t.result === 'passed';
      if (filter === 'failed') return t.result === 'failed';
      if (filter === 'pending') return t.result === 'pending_result' || t.result === 'planned';
      return true;
    })
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

  return (
    <main className="px-4 pt-4 pb-28 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[17px] font-bold text-[#141c2b] tracking-tight">מבחנים מעשיים</h2>
          <p className="text-[14px] text-[#434654]">מעקב תוצאות ועלויות טסט פנימי וחיצוני</p>
        </div>

        {hasPassedTest ? (
          <button
            disabled={true}
            className="bg-gray-200 border border-gray-300/60 text-gray-400 font-bold text-[14px] px-3.5 py-2 rounded-xl shadow-none flex items-center gap-1.5 cursor-not-allowed shrink-0 opacity-70"
            title="לא ניתן להוסיף טסטים לאחר מעבר טסט"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            טסט חדש
          </button>
        ) : (
          <button
            onClick={onAddNewTest}
            className="bg-[#1a56db] hover:bg-[#003fb1] text-white font-bold text-[14px] px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            טסט חדש
          </button>
        )}
      </div>

      {/* Overview Stats Badges (EXTERNAL TESTS ONLY) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex sm:flex-col items-center justify-between sm:justify-center text-center">
          <span className="text-[12px] font-bold text-emerald-900">עברתי בהצלחה (חיצוני)</span>
          <span className="text-[22px] font-black text-emerald-700 leading-tight">{passedCount}</span>
        </div>
        <div className="bg-red-50 border border-red-200 p-3 rounded-2xl flex sm:flex-col items-center justify-between sm:justify-center text-center">
          <span className="text-[12px] font-bold text-red-900">נכשלתי (חיצוני)</span>
          <span className="text-[22px] font-black text-red-700 leading-tight">{failedCount}</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex sm:flex-col items-center justify-between sm:justify-center text-center">
          <span className="text-[12px] font-bold text-amber-900">ממתין לתוצאה (חיצוני)</span>
          <span className="text-[22px] font-black text-amber-700 leading-tight">{pendingCount}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all ${
            filter === 'all'
              ? 'bg-[#1a56db] text-white shadow-xs'
              : 'bg-white text-[#434654] border border-[#c3c5d7]/50 hover:bg-[#f1f3ff]'
          }`}
        >
          הכל ({tests.length})
        </button>
        <button
          onClick={() => setFilter('passed')}
          className={`px-3.5 py-1.5 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all ${
            filter === 'passed'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-[#434654] border border-[#c3c5d7]/50 hover:bg-emerald-50'
          }`}
        >
          עברתי ({passedCount})
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-3.5 py-1.5 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all ${
            filter === 'failed'
              ? 'bg-[#ba1a1a] text-white shadow-xs'
              : 'bg-white text-[#434654] border border-[#c3c5d7]/50 hover:bg-red-50'
          }`}
        >
          נכשלתי ({failedCount})
        </button>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {filteredTests.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-[#c3c5d7] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f1f3ff] text-[#003fb1] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">verified</span>
            </div>
            <h3 className="font-bold text-[16px] text-[#141c2b]">אין טסטים ברשימה זו</h3>
            <p className="text-[13px] text-[#434654]">
              {hasPassedTest
                ? 'לא ניתן להוסיף טסטים נוספים לאחר מעבר טסט.'
                : 'לחץ על "טסט חדש" כדי להוסיף טסט פנימי או חיצוני.'}
            </p>
          </div>
        ) : (
          filteredTests.map((test) => {
            const isExternal = test.type === 'חיצוני';
            // Compute numbering for external tests only
            const externalIndex = isExternal
              ? externalTestsAsc.findIndex((t) => t.id === test.id) + 1
              : null;

            const isPassed = test.result === 'passed';
            const isFailed = test.result === 'failed';
            const isPassedTime = isTestDateTimePassed(test.date, test.time);
            const isFuture = !isPassedTime;
            const isPendingResult = !isFuture && (test.result === 'pending_result' || test.result === 'planned');

            const isResultLocked = isPassed || isFailed;

            return (
              <div
                key={test.id}
                className={`p-5 rounded-2xl shadow-xs border-2 transition-all space-y-4 ${
                  isPassed
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
                    : isFailed
                    ? 'bg-red-50/70 border-red-400 shadow-sm'
                    : isPendingResult
                    ? 'bg-amber-50/80 border-amber-500 shadow-sm'
                    : 'bg-white border-[#1a56db]/40'
                }`}
              >
                {/* Header Row: Title & Result Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-[16px] shrink-0 ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isFailed
                          ? 'bg-[#ba1a1a] text-white'
                          : isPendingResult
                          ? 'bg-amber-600 text-white'
                          : 'bg-[#1a56db] text-white'
                      }`}
                    >
                      {isExternal ? `T${externalIndex}` : 'פנימי'}
                    </div>

                    <div>
                      <h3 className="font-bold text-[17px] text-[#141c2b] leading-tight">
                        {isExternal ? `טסט חיצוני #${externalIndex}` : 'טסט פנימי'}
                      </h3>
                      <p className="text-[13px] text-[#434654] flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        {test.formattedDate} ({test.time})
                      </p>
                    </div>
                  </div>

                  {/* Actions & Result Pill Badge */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-0 border-[#c3c5d7]/30">
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-bold border inline-flex items-center justify-center gap-1 shrink-0 whitespace-nowrap ${
                        isPassed
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                          : isFailed
                          ? 'bg-red-100 text-red-900 border-red-400'
                          : isPendingResult
                          ? 'bg-amber-100 text-amber-900 border-amber-400'
                          : 'bg-[#e8eeff] text-[#003fb1] border-[#003fb1]/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isPassed
                          ? 'check_circle'
                          : isFailed
                          ? 'cancel'
                          : isPendingResult
                          ? 'help'
                          : 'event'}
                      </span>
                      {isPassed
                        ? 'עברתי! 🎉'
                        : isFailed
                        ? 'נכשלתי'
                        : isPendingResult
                        ? 'לא ידוע'
                        : 'מתוכנן'}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Edit button */}
                      <button
                        onClick={() => setEditingTest(test)}
                        className="p-1.5 text-[#1a56db] hover:bg-[#e8eeff] rounded-lg transition-colors"
                        title="ערוך טסט"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => setTestToDelete(test.id)}
                        className="p-1.5 text-gray-400 hover:text-[#ba1a1a] rounded-lg hover:bg-red-50 transition-colors"
                        title="מחק טסט"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pricing & Fees Breakdown */}
                <div className="bg-white/80 p-3.5 rounded-xl border border-[#c3c5d7]/50 space-y-2 text-[13px]">
                  {test.type === 'פנימי' ? (
                    <div className="flex justify-between items-center font-bold text-[14px]">
                      <span className="text-[#141c2b]">מחיר טסט פנימי:</span>
                      <span className="text-[#003fb1] font-black text-[16px]">₪{test.totalPrice || test.testFee}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-[#434654]">
                        <span>אגרת טסט:</span>
                        <span className="font-bold text-[#141c2b]">₪{test.testFee}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#434654]">
                        <span>העמדת רכב:</span>
                        <span className="font-bold text-[#141c2b]">₪{test.carFee}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#c3c5d7]/40 font-bold text-[14px]">
                        <span className="text-[#141c2b]">סה"כ עלות טסט:</span>
                        <span className="text-[#003fb1] font-black text-[16px]">₪{(test.testFee || 0) + (test.carFee || 0)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Location & Notes */}
                {(test.location || test.notes) && (
                  <div className="text-[13px] text-[#434654] space-y-1 bg-white/50 p-3 rounded-xl border border-[#c3c5d7]/30">
                    {test.location && (
                      <p className="flex items-center gap-1.5 font-medium">
                        <span className="material-symbols-outlined text-[16px] text-[#003fb1]">location_on</span>
                        {test.location}
                      </p>
                    )}
                    {test.notes && <p className="italic text-[12px] opacity-90">{test.notes}</p>}
                  </div>
                )}

                {/* Action Controls Footer */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-black/10">
                  {isFuture ? (
                    <div className="text-[12px] font-semibold text-[#434654] flex items-center gap-1.5 py-1">
                      <span className="material-symbols-outlined text-[18px] text-[#1a56db]">event</span>
                      <span>טסט עתידי - לא ניתן לסמן תוצאה עד למועד הטסט</span>
                    </div>
                  ) : isResultLocked ? (
                    <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                      <span className="text-[12px] font-bold text-[#141c2b]">
                        תוצאה שסומנה: <span className="text-[#003fb1]">{isPassed ? 'עברתי 🎉' : 'נכשלתי'}</span>
                      </span>
                    </div>
                  ) : (
                    /* Quick Result Toggle Buttons for test that already occurred */
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[12px] font-bold text-[#141c2b] ml-1">סימון תוצאה:</span>
                      <button
                        onClick={() => onUpdateTestStatus(test.id, 'passed')}
                        className="px-3 py-1.5 rounded-xl font-bold text-[12px] bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-all flex items-center gap-1 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        עברתי
                      </button>

                      <button
                        onClick={() => onUpdateTestStatus(test.id, 'failed')}
                        className="px-3 py-1.5 rounded-xl font-bold text-[12px] bg-red-100 hover:bg-red-200 text-red-900 transition-all flex items-center gap-1 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        נכשלתי
                      </button>

                      <button
                        onClick={() => onUpdateTestStatus(test.id, 'pending_result')}
                        className="px-3 py-1.5 rounded-xl font-bold text-[12px] bg-amber-100 hover:bg-amber-200 text-amber-900 transition-all flex items-center gap-1 shadow-xs"
                        title="לא ידוע"
                      >
                        <span className="material-symbols-outlined text-[16px]">help</span>
                        לא ידוע
                      </button>
                    </div>
                  )}

                  {/* Payment Status */}
                  <div className="flex items-center justify-end sm:justify-auto">
                    {test.paymentStatus === 'paid' ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-3 py-1.5 rounded-xl font-bold text-[12px]">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        שולם במלואו
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          onUpdateTestStatus(test.id, test.result, 'paid')
                        }
                        className="w-full sm:w-auto px-4 py-1.5 rounded-xl text-[12px] font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">payments</span>
                        סמן כשולם
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Single Test Delete Confirm Modal */}
      {testToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center border border-[#c3c5d7]">
            <div className="w-12 h-12 bg-red-100 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <h3 className="text-[18px] font-bold text-[#141c2b]">מחיקת טסט</h3>
            <p className="text-[14px] text-[#434654]">
              האם אתה בטוח שברצונך למחוק את הטסט מהרשימה?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onDeleteTest(testToDelete);
                  setTestToDelete(null);
                }}
                className="flex-1 bg-[#ba1a1a] text-white py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                מחק טסט
              </button>
              <button
                onClick={() => setTestToDelete(null)}
                className="flex-1 border border-[#c3c5d7] py-2.5 rounded-xl text-[#434654] font-medium hover:bg-[#f1f3ff]"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Test Modal */}
      <EditTestModal
        test={editingTest}
        isOpen={!!editingTest}
        onClose={() => setEditingTest(null)}
        onSave={(updated) => {
          onUpdateTest(updated);
          setEditingTest(null);
        }}
        profile={profile}
      />
    </main>
  );
};
