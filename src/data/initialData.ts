import { Lesson, StudentProfile, NotificationItem, DrivingTest } from '../types';

export const DEFAULT_INSTRUCTOR_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuDQeXLFAlA0RYwN4gLSL4CwZOYVFS1EKEBeY_bVthPef9XScYHYTXmy1wCA2nLzICPfF2fJ0UaOH6HHkVM90iNMBPDby-ui5L8fk-EWQBor4wfZz44WERMQR1_5QHP1tQBxBFPK9r-tkzP5LeE28ujVbS4_cPbFSRdQnr19VvhphrYdMBJhh83mOTi_H3p_ItjozRwmGopcujxr2mL8ZFMokGxOx43Na5ExLL5n5WAXJmIOJZfO60m-xg";

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  isConfigured: false,
  name: "",
  avatarUrl: "",
  instructorName: "",
  instructorPhone: "",
  instructorMessagingType: "whatsapp",
  carModel: "",
  gearType: "אוטומט",
  requiredLessons: 28,
  pricePerLesson: 0,
  defaultRegistrationFee: 0,
  defaultInternalTestFee: 0,
  defaultTestFee: 0,
  defaultCarFee: 0,
  registrationFeePayment: {
    isPaid: false,
    amount: 0,
  },
  showSkillsChecklist: true,
  skillsList: [
    { id: '1', name: 'חניה במקביל למדרכה', isChecked: false },
    { id: '2', name: 'זינוק בעלייה', isChecked: false },
    { id: '3', name: 'פנייה שמאלה בצומת מרומזר', isChecked: false },
    { id: '4', name: 'השתלבות בכביש מהיר', isChecked: false },
    { id: '5', name: 'נסיעה בכיכר דו-נתיבית', isChecked: false },
    { id: '6', name: 'נהיגה בתנאי חשיכה (לילה)', isChecked: false },
  ],
};

export const INITIAL_TESTS: DrivingTest[] = [];

export const INITIAL_LESSONS: Lesson[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

// LocalStorage Persistence Helpers
const STORAGE_KEY_LESSONS = "drivetrack_lessons_v1";
const STORAGE_KEY_TESTS = "drivetrack_tests_v1";
const STORAGE_KEY_PROFILE = "drivetrack_profile_v1";
const STORAGE_KEY_NOTIFS = "drivetrack_notifs_v1";

export function getStoredTests(): DrivingTest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_TESTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error reading tests from localStorage", e);
  }
  return INITIAL_TESTS;
}

export function saveStoredTests(tests: DrivingTest[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(tests));
  } catch (e) {
    console.error("Error saving tests to localStorage", e);
  }
}

export function getStoredLessons(): Lesson[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_LESSONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error reading lessons from localStorage", e);
  }
  return INITIAL_LESSONS;
}

export function saveStoredLessons(lessons: Lesson[]) {
  try {
    localStorage.setItem(STORAGE_KEY_LESSONS, JSON.stringify(lessons));
  } catch (e) {
    console.error("Error saving lessons to localStorage", e);
  }
}

export function getStoredProfile(): StudentProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (data) {
      const parsed = JSON.parse(data);
      let hasExistingLessons = false;
      let hasExistingTests = false;
      try {
        const lData = localStorage.getItem(STORAGE_KEY_LESSONS);
        if (lData && JSON.parse(lData).length > 0) hasExistingLessons = true;
        const tData = localStorage.getItem(STORAGE_KEY_TESTS);
        if (tData && JSON.parse(tData).length > 0) hasExistingTests = true;
      } catch (_) {}

      const hasLegacyData = Boolean(
        parsed.name ||
        parsed.instructorName ||
        parsed.carModel ||
        parsed.pricePerLesson ||
        parsed.defaultRegistrationFee ||
        parsed.defaultTestFee ||
        hasExistingLessons ||
        hasExistingTests
      );

      return {
        ...DEFAULT_STUDENT_PROFILE,
        ...parsed,
        isConfigured:
          parsed.isConfigured !== undefined
            ? parsed.isConfigured
            : (hasLegacyData ? true : false),
      };
    }
  } catch (e) {
    console.error("Error reading profile from localStorage", e);
  }

  // If no profile object was saved in localStorage, but lessons or tests exist in localStorage:
  try {
    const lData = localStorage.getItem(STORAGE_KEY_LESSONS);
    const tData = localStorage.getItem(STORAGE_KEY_TESTS);
    const hasLessons = lData && JSON.parse(lData).length > 0;
    const hasTests = tData && JSON.parse(tData).length > 0;
    if (hasLessons || hasTests) {
      return {
        ...DEFAULT_STUDENT_PROFILE,
        isConfigured: true,
      };
    }
  } catch (_) {}

  return DEFAULT_STUDENT_PROFILE;
}

export function saveStoredProfile(profile: StudentProfile) {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Error saving profile to localStorage", e);
  }
}

export function getStoredNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error reading notifications", e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function clearAllStoredData() {
  try {
    localStorage.removeItem(STORAGE_KEY_LESSONS);
    localStorage.removeItem(STORAGE_KEY_TESTS);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
  } catch (e) {
    console.error("Error clearing localStorage", e);
  }
}

export function saveStoredNotifications(notifs: NotificationItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
  } catch (e) {
    console.error("Error saving notifications", e);
  }
}
