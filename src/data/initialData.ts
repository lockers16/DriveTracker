import { Lesson, StudentProfile, NotificationItem, DrivingTest } from '../types';

export const DEFAULT_INSTRUCTOR_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuDQeXLFAlA0RYwN4gLSL4CwZOYVFS1EKEBeY_bVthPef9XScYHYTXmy1wCA2nLzICPfF2fJ0UaOH6HHkVM90iNMBPDby-ui5L8fk-EWQBor4wfZz44WERMQR1_5QHP1tQBxBFPK9r-tkzP5LeE28ujVbS4_cPbFSRdQnr19VvhphrYdMBJhh83mOTi_H3p_ItjozRwmGopcujxr2mL8ZFMokGxOx43Na5ExLL5n5WAXJmIOJZfO60m-xg";

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  name: "עידו פרידמן",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA4VkXPkFbvO3o_9Ualav5JrgdB288o2cuMX_vI3q_Sq7Y547hoq6xoWDlmRc6cS6FuFHJ9i-fMANNzLOt2axzGkU2w8uQ6OpjNgeF0KhtwvEbWpE5hjnXP1wX3NT8xJRsK7C8RdngqREI0GO_YO7uM6_fjU3eVtDJtO1Ir3pQoq7cWf3XyVcNGpOA1XNrsz2ihk4us_uCkrihSn-Czy6dJTyzLb6nimeV76IgIMArSP8Okuvv84iIxw",
  instructorName: "דני כהן",
  instructorPhone: "050-1234567",
  carModel: "יונדאי i20 ידנית",
  gearType: "ידני",
  requiredLessons: 28,
  pricePerLesson: 150,
  targetTestDate: "2024-11-15",
  showSkillsChecklist: true,
  skillsList: [
    { id: '1', name: 'חניה במקביל למדרכה', isChecked: true },
    { id: '2', name: 'זינוק בעלייה ברכב ידני', isChecked: true },
    { id: '3', name: 'פנייה שמאלה בצומת מרומזר', isChecked: true },
    { id: '4', name: 'השתלבות בכביש מהיר', isChecked: false },
    { id: '5', name: 'נסיעה בכיכר דו-נתיבית', isChecked: true },
    { id: '6', name: 'נהיגה בתנאי חשיכה (לילה)', isChecked: false },
  ],
};

export const INITIAL_TESTS: DrivingTest[] = [
  {
    id: 'test-1',
    testNumber: 1,
    type: 'חיצוני',
    date: '2024-11-15',
    formattedDate: 'יום שישי, 15 בנובמבר, 2024',
    monthDayShort: { month: 'נוב׳', day: '15' },
    time: '09:30',
    location: 'משרד הרישוי, תל אביב (חולון)',
    notes: 'טסט מעשי ראשון - להתמקד בהסתכלות במראות ובחניות.',
    testFee: 165,
    carFee: 231,
    registrationFee: 200,
    totalPrice: 596,
    paymentStatus: 'pending',
    result: 'planned',
  },
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: "lesson-19",
    lessonNumber: 19,
    date: "2024-10-14",
    formattedDate: "יום שלישי, 14 באוקטובר",
    monthDayShort: { month: "אוק׳", day: "26" },
    time: "16:30 - 17:15",
    duration: 45,
    topic: "שיעור חניה ונהיגה עירונית",
    instructor: "דני כהן",
    location: "תל אביב, מרכז",
    price: 150,
    status: "planned",
    paymentStatus: "pending",
    notes: "להתמקד בחניה במקביל ובפניות שמאלה ברחובות חד-סטריים.",
    isNext: true,
  },
  {
    id: "lesson-18",
    lessonNumber: 18,
    date: "2024-08-24",
    formattedDate: "24 באוגוסט, 2024",
    monthDayShort: { month: "אפר׳", day: "24" },
    time: "14:30 - 15:15",
    duration: 45,
    topic: "שיעור נהיגה ידני - פניות וצמתים",
    instructor: "דני כהן",
    location: "תל אביב, מרכז",
    price: 180,
    status: "completed",
    paymentStatus: "paid",
    notes: "היום התמקדנו בפניות שמאלה בצמתים מרומזרים ושמירה על נתיב. התלמיד הפגין ביטחון רב יותר בבלימה הדרגתית. מומלץ להמשיך לתרגל השתלבות בתנועה מהירה בשיעור הבא.",
  },
  {
    id: "lesson-17",
    lessonNumber: 17,
    date: "2024-10-10",
    formattedDate: "10 באוקטובר, 2023",
    monthDayShort: { month: "אפר׳", day: "22" },
    time: "10:00 - 10:45",
    duration: 45,
    topic: "נהיגה בינעירונית",
    instructor: "דני כהן",
    location: "תל אביב, צפון",
    price: 150,
    status: "completed",
    paymentStatus: "pending",
    notes: "תרגול נהיגה בכביש מהיר ושמירת מרחק.",
  },
  {
    id: "lesson-16",
    lessonNumber: 16,
    date: "2024-10-07",
    formattedDate: "7 באוקטובר, 2023",
    monthDayShort: { month: "אפר׳", day: "20" },
    time: "14:15 - 15:00",
    duration: 45,
    topic: "נהיגת לילה",
    instructor: "דני כהן",
    location: "תל אביב, מרכז",
    price: 150,
    status: "cancelled",
    paymentStatus: "pending",
    notes: "השיעור בוטל עקב תנאי מזג אוויר סוערים.",
  },
  {
    id: "lesson-15",
    lessonNumber: 15,
    date: "2024-08-01",
    formattedDate: "1 באוגוסט, 2024",
    monthDayShort: { month: "אוג׳", day: "01" },
    time: "09:00 - 09:45",
    duration: 45,
    topic: "חניה ברוורס וזינוק בעלייה",
    instructor: "דני כהן",
    location: "רמת גן",
    price: 150,
    status: "completed",
    paymentStatus: "paid",
    notes: "ביצוע מצוין של זינוק בעלייה עם קלאץ'.",
  },
  // Previous lessons to sum up 18 completed and total paid ~ ₪2,800
  ...Array.from({ length: 14 }, (_, i) => {
    const num = 14 - i;
    const dateStr = `2024-0${Math.floor(i / 3) + 2}-${(i * 2 + 1).toString().padStart(2, '0')}`;
    return {
      id: `lesson-${num}`,
      lessonNumber: num,
      date: dateStr,
      formattedDate: `${num} ביוני, 2024`,
      monthDayShort: { month: "יוני", day: `${num}` },
      time: "11:00 - 11:45",
      duration: 45,
      topic: num <= 5 ? "יסודות השליטה ברכב" : num <= 10 ? "החלפת הילוכים והאטה" : "נהיגה בעיר והולכי רגל",
      instructor: "דני כהן",
      location: "תל אביב",
      routeDescription: "תל אביב - מרכז",
      price: 150,
      status: "completed" as const,
      paymentStatus: "paid" as const,
      notes: "שיעור בוצע בהצלחה.",
    };
  }),
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "תזכורת לשיעור הבא",
    message: "שיעור 19 נקבע ליום שלישי, 14 באוקטובר בשעה 16:30",
    time: "לפני שעה",
    read: false,
    type: "reminder",
  },
  {
    id: "notif-2",
    title: "בקשת תשלום",
    message: "שיעור 17 (₪150) ממתין לתשלום",
    time: "אתמול",
    read: false,
    type: "payment",
  },
  {
    id: "notif-3",
    title: "התקדמות לטסט",
    message: "כל הכבוד! השלמת 18 שיעורים - 65% מהדרך לטסט",
    time: "לפני 3 ימים",
    read: true,
    type: "info",
  },
];

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
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error reading profile from localStorage", e);
  }
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

export function saveStoredNotifications(notifs: NotificationItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
  } catch (e) {
    console.error("Error saving notifications", e);
  }
}
