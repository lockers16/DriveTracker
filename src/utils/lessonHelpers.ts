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
 * Extract HH:MM from time string (e.g. "14:30 - 15:15" -> "14:30") formatted with leading zeros.
 */
export function parseTimeStart(timeStr?: string): string {
  if (!timeStr) return '00:00';
  const start = timeStr.split('-')[0].trim();
  const [h, m] = start.split(':').map(Number);
  if (isNaN(h)) return '00:00';
  const hh = h.toString().padStart(2, '0');
  const mm = (isNaN(m) ? 0 : m).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Compare two lessons chronologically (earliest date & time first).
 */
export function compareLessonsChronological(a: Lesson, b: Lesson): number {
  const dateComp = (a.date || '').localeCompare(b.date || '');
  if (dateComp !== 0) return dateComp;
  const timeA = parseTimeStart(a.time);
  const timeB = parseTimeStart(b.time);
  const timeComp = timeA.localeCompare(timeB);
  if (timeComp !== 0) return timeComp;
  return (a.id || '').localeCompare(b.id || '');
}

/**
 * Updates a lesson topic string with a new lesson number/range,
 * while preserving any custom suffix/description (e.g. "שיעור 16 - חניה" -> "שיעור 15 - חניה").
 * If the user set a custom topic without "שיעור <number>", it leaves it untouched.
 */
export function updateTopicWithNewNumber(
  currentTopic: string,
  startNum: number,
  endNum: number,
  units: number
): string {
  if (!currentTopic || !currentTopic.trim()) {
    return units >= 2 ? `שיעור ${startNum}-${endNum}` : `שיעור ${startNum}`;
  }

  const trimmed = currentTopic.trim();
  // Match prefix "שיעור" followed by digits and optional range "-digits"
  const match = trimmed.match(/^שיעור\s+(\d+)(?:\s*-\s*\d+)?(.*)$/);

  if (!match) {
    // Custom topic (e.g. "חניה במקביל", "מגרש הדרכה") without lesson number prefix
    return currentTopic;
  }

  const remainder = match[2] || '';
  const prefix = units >= 2 ? `שיעור ${startNum}-${endNum}` : `שיעור ${startNum}`;
  return `${prefix}${remainder}`;
}

/**
 * Recalculates lesson numbering across all lessons:
 * - Sorts lessons chronologically (earliest to latest).
 * - Only active (non-cancelled) lessons receive active lesson numbers and count towards units.
 * - Handles double lessons (duration >= 70) as 2 units, advancing numbering appropriately.
 * - If a lesson before them is cancelled (single or double), subsequent lessons automatically drop their numbers.
 * - If a lesson is uncancelled or changed, numbering re-adjusts automatically.
 * - Preserves the array order of the original lessons list.
 */
export function recalculateLessonNumbers(lessons: Lesson[]): Lesson[] {
  if (!lessons || lessons.length === 0) return [];

  const sorted = [...lessons].sort(compareLessonsChronological);
  const updates = new Map<string, { lessonNumber: number; topic: string }>();

  let currentUnit = 1;

  for (const lesson of sorted) {
    if (lesson.status === 'cancelled') {
      // Cancelled lessons do NOT consume active units or advance currentUnit.
      // Subsequent active lessons will take this place in numbering.
      continue;
    }

    const units = getLessonUnits(lesson);
    const startNum = currentUnit;
    const endNum = startNum + units - 1;

    const newTopic = updateTopicWithNewNumber(lesson.topic, startNum, endNum, units);

    updates.set(lesson.id, {
      lessonNumber: startNum,
      topic: newTopic,
    });

    currentUnit += units;
  }

  return lessons.map((lesson) => {
    const update = updates.get(lesson.id);
    if (update) {
      return {
        ...lesson,
        lessonNumber: update.lessonNumber,
        topic: update.topic,
      };
    }
    return lesson;
  });
}

/**
 * Returns how many standard lesson units (40 min each) a lesson represents.
 * 40 min = 1 unit, 80 min (or double lesson) = 2 units.
 */
export function getLessonUnits(lesson: { duration?: number }): number {
  const d = lesson.duration || 40;
  if (d >= 70) return 2;
  return 1;
}

/**
 * Calculates total completed lesson units from a list of lessons.
 */
export function calculateCompletedLessonUnits(lessons: Lesson[]): number {
  return (lessons || [])
    .filter((l) => l.status === 'completed')
    .reduce((sum, l) => sum + getLessonUnits(l), 0);
}

/**
 * Calculates total lesson units of all non-cancelled lessons.
 */
export function calculateTotalLessonUnits(lessons: Lesson[]): number {
  return (lessons || [])
    .filter((l) => l.status !== 'cancelled')
    .reduce((sum, l) => sum + getLessonUnits(l), 0);
}

/**
 * Calculates the next lesson starting number based on 1 + (total lesson time in minutes)/40:
 * 1 + total units so far.
 */
export function getNextLessonNumber(lessons: Lesson[]): number {
  const units = calculateTotalLessonUnits(lessons);
  return units + 1;
}

/**
 * Suggest next lesson topic name automatically based on next lesson number and duration.
 */
export function getNextSuggestedLessonTopic(lessons: Lesson[], duration: number = 40): string {
  const nextNum = getNextLessonNumber(lessons);
  if (duration >= 70) {
    return `שיעור ${nextNum}-${nextNum + 1}`;
  }
  return `שיעור ${nextNum}`;
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
