import { Lesson } from '../types';

/**
 * Checks if a lesson's date and end time have passed.
 */
export function isLessonPassed(lesson: Lesson): boolean {
  if (lesson.status === 'completed' || lesson.status === 'cancelled') {
    return false;
  }

  const now = new Date();
  const lessonDate = new Date(lesson.date);

  if (isNaN(lessonDate.getTime())) return false;

  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lessonMidnight = new Date(lessonDate.getFullYear(), lessonDate.getMonth(), lessonDate.getDate());

  if (lessonMidnight < todayMidnight) {
    return true;
  }

  if (lessonMidnight.getTime() === todayMidnight.getTime()) {
    const timeParts = lesson.time.split('-');
    const endTimeStr = timeParts[1] ? timeParts[1].trim() : timeParts[0].trim();
    const [hours, minutes] = endTimeStr.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const lessonEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      return now >= lessonEndTime;
    }
  }

  return false;
}

/**
 * Calculate end time string "HH:MM" given a start time "HH:MM" and duration in minutes.
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  if (!startTime || !startTime.includes(':')) return '';
  const [h, m] = startTime.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '';

  const totalMinutes = h * 60 + m + durationMinutes;
  const endH = Math.floor((totalMinutes / 60) % 24);
  const endM = totalMinutes % 60;

  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

/**
 * Calculate duration in minutes given start time "HH:MM" and end time "HH:MM".
 */
export function calculateDurationFromTimes(startTime: string, endTime: string): number {
  if (!startTime || !endTime || !startTime.includes(':') || !endTime.includes(':')) return 45;

  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 45;

  const startTotal = sh * 60 + sm;
  let endTotal = eh * 60 + em;

  if (endTotal < startTotal) {
    endTotal += 24 * 60; // Next day fallback
  }

  const diff = endTotal - startTotal;
  return diff > 0 ? diff : 45;
}

/**
 * Suggest next lesson topic name automatically based on completed lessons count + 1.
 */
export function getNextSuggestedLessonTopic(lessons: Lesson[]): string {
  const completedCount = lessons.filter((l) => l.status === 'completed').length;
  return `שיעור ${completedCount + 1}`;
}

/**
 * Checks if a driving test's date and time have passed.
 */
export function isTestDateTimePassed(testDate: string, testTime?: string): boolean {
  if (!testDate) return false;
  const now = new Date();
  const testD = new Date(testDate);
  if (isNaN(testD.getTime())) return false;

  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const testMidnight = new Date(testD.getFullYear(), testD.getMonth(), testD.getDate());

  if (testMidnight < todayMidnight) {
    return true;
  }
  if (testMidnight > todayMidnight) {
    return false;
  }

  // Same day: compare time if available
  if (!testTime) return true;
  const startPart = testTime.split('-')[0].trim();
  const [hours, minutes] = startPart.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return true;

  const testStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  return now >= testStartTime;
}
