export type LessonStatus = 'completed' | 'planned' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending';

export interface Lesson {
  id: string;
  lessonNumber: number;
  date: string; // ISO YYYY-MM-DD
  formattedDate: string; // e.g. "24 באוגוסט, 2024" or "24 אפר׳"
  monthDayShort: { month: string; day: string }; // e.g. { month: "אפר׳", day: "24" }
  time: string; // e.g. "16:30" or "14:30 - 15:15"
  duration: number; // minutes e.g. 45
  topic: string; // e.g. "נהיגה עירונית וחניה"
  instructor: string; // e.g. "דני כהן"
  location: string; // e.g. "תל אביב, מרכז"
  price: number; // e.g. 150 or 180
  status: LessonStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  isNext?: boolean;
}

export type TestResultStatus = 'passed' | 'failed' | 'pending_result' | 'planned';
export type TestType = 'חיצוני' | 'פנימי';

export interface DrivingTest {
  id: string;
  testNumber: number;
  type: TestType;
  date: string; // ISO YYYY-MM-DD
  formattedDate: string;
  monthDayShort: { month: string; day: string };
  time: string;
  location: string;
  notes?: string;
  
  testFee: number; // default 165
  carFee: number; // default 231
  registrationFee: number; // default 200
  totalPrice: number;
  paymentStatus: PaymentStatus;

  result: TestResultStatus;
}

export type NavigationTab = 'dashboard' | 'lessons' | 'tests' | 'add' | 'add-test' | 'profile';

export interface DrivingSkill {
  id: string;
  name: string;
  isChecked: boolean;
}

export interface RegistrationFeePayment {
  isPaid: boolean;
  date?: string;
  formattedDate?: string;
  amount: number;
  notes?: string;
}

export interface StudentProfile {
  isConfigured?: boolean;
  name: string;
  avatarUrl: string;
  instructorName: string;
  instructorPhone: string;
  instructorMessagingType?: 'whatsapp' | 'sms';
  carModel: string;
  gearType: 'ידני' | 'אוטומט';
  requiredLessons: number;
  pricePerLesson: number;
  defaultRegistrationFee: number;
  defaultInternalTestFee: number;
  defaultTestFee: number;
  defaultCarFee: number;
  registrationFeePayment?: RegistrationFeePayment;
  targetTestDate?: string;
  showSkillsChecklist?: boolean;
  skillsList?: DrivingSkill[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'reminder' | 'payment' | 'info';
}
