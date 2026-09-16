import React, { useState, useEffect } from 'react';
import {
  Lesson,
  DrivingTest,
  NavigationTab,
  StudentProfile,
  TestResultStatus,
  PaymentStatus,
  RegistrationFeePayment,
} from './types';
import {
  getStoredLessons,
  saveStoredLessons,
  getStoredTests,
  saveStoredTests,
  getStoredProfile,
  saveStoredProfile,
  DEFAULT_STUDENT_PROFILE,
  clearAllStoredData,
} from './data/initialData';

import { Header } from './components/Header';
import { calculateCompletedLessonUnits, recalculateLessonNumbers } from './utils/lessonHelpers';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { LessonsListView } from './components/LessonsListView';
import { TestsListView } from './components/TestsListView';
import { AddUnifiedView } from './components/AddUnifiedView';
import { LessonDetailsView } from './components/LessonDetailsView';
import { ProfileView } from './components/ProfileView';
import { TestGoalModal } from './components/TestGoalModal';
import { CreateTypeModal, CreateActionType } from './components/CreateTypeModal';
import { OnboardingView } from './components/OnboardingView';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile>(() => getStoredProfile());
  const [lessons, setLessons] = useState<Lesson[]>(() => recalculateLessonNumbers(getStoredLessons()));
  const [tests, setTests] = useState<DrivingTest[]>(() => getStoredTests());

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isTestGoalModalOpen, setIsTestGoalModalOpen] = useState(false);
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<CreateActionType>('lesson');

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    saveStoredLessons(lessons);
  }, [lessons]);

  useEffect(() => {
    saveStoredTests(tests);
  }, [tests]);

  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  // If user has existing lessons or tests or isConfigured is true, they bypass onboarding
  const isExistingUser = profile.isConfigured || lessons.length > 0 || tests.length > 0;

  // Auto-mark profile as configured if user already has lessons or tests
  useEffect(() => {
    if (!profile.isConfigured && (lessons.length > 0 || tests.length > 0)) {
      setProfile((prev) => ({ ...prev, isConfigured: true }));
    }
  }, [lessons.length, tests.length, profile.isConfigured]);

  // If user hasn't completed initial onboarding AND has no existing data, show Onboarding form
  if (!isExistingUser) {
    return (
      <OnboardingView
        initialProfile={profile}
        onSaveProfile={(configuredProfile) => {
          setProfile(configuredProfile);
          saveStoredProfile(configuredProfile);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  // Tab switching handler
  const handleTabChange = (tab: NavigationTab) => {
    setSelectedLesson(null);
    setActiveTab(tab);
  };

  const handleOpenAddWithMode = (mode: CreateActionType) => {
    setSelectedLesson(null);
    setAddMode(mode);
    setActiveTab('add');
  };

  // Add lesson handler
  const handleSaveNewLesson = (newLessonData: Omit<Lesson, 'id'>) => {
    const newId = `lesson-${Date.now()}`;
    const newLesson: Lesson = {
      ...newLessonData,
      id: newId,
    };

    const updated = [newLesson, ...lessons];
    const recalculated = recalculateLessonNumbers(updated);
    setLessons(recalculated);
    const refreshed = recalculated.find((l) => l.id === newId) || newLesson;
    setSelectedLesson(refreshed);
    setActiveTab('lessons');
  };

  // Add test handler
  const handleSaveNewTest = (newTestData: Omit<DrivingTest, 'id'>) => {
    const newId = `test-${Date.now()}`;
    const newTest: DrivingTest = {
      ...newTestData,
      id: newId,
    };

    const updated = [newTest, ...tests];
    setTests(updated);
    if (newTest.type === 'חיצוני' && newTest.result === 'passed') {
      setActiveTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab('tests');
    }
  };

  // Save Registration Fee payment handler
  const handleSaveRegistrationFee = (payment: RegistrationFeePayment) => {
    const updatedProfile: StudentProfile = {
      ...profile,
      registrationFeePayment: payment,
    };
    setProfile(updatedProfile);
    saveStoredProfile(updatedProfile);
    setActiveTab('dashboard');
  };

  // Delete Registration Fee payment handler
  const handleDeleteRegistrationFee = () => {
    const updatedProfile: StudentProfile = {
      ...profile,
      registrationFeePayment: undefined,
    };
    setProfile(updatedProfile);
    saveStoredProfile(updatedProfile);
  };

  // Update test status handler
  const handleUpdateTestStatus = (
    testId: string,
    result: TestResultStatus,
    paymentStatus?: PaymentStatus
  ) => {
    let targetType: string | undefined;
    const updated = tests.map((t) => {
      if (t.id === testId) {
        targetType = t.type;
        return {
          ...t,
          result,
          paymentStatus: paymentStatus !== undefined ? paymentStatus : t.paymentStatus,
        };
      }
      return t;
    });
    setTests(updated);
    if (targetType === 'חיצוני' && result === 'passed') {
      setActiveTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Delete test handler
  const handleDeleteTest = (testId: string) => {
    const updated = tests.filter((t) => t.id !== testId);
    setTests(updated);
  };

  // Update test handler
  const handleUpdateTest = (updatedTest: DrivingTest) => {
    const updated = tests.map((t) => (t.id === updatedTest.id ? updatedTest : t));
    setTests(updated);
    if (updatedTest.type === 'חיצוני' && updatedTest.result === 'passed') {
      setActiveTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Update lesson handler
  const handleUpdateLesson = (updatedLesson: Lesson) => {
    const safeLesson: Lesson =
      updatedLesson.status === 'cancelled'
        ? { ...updatedLesson, paymentStatus: 'pending' }
        : updatedLesson;
    const updated = lessons.map((l) => (l.id === safeLesson.id ? safeLesson : l));
    const recalculated = recalculateLessonNumbers(updated);
    setLessons(recalculated);
    if (selectedLesson && selectedLesson.id === safeLesson.id) {
      const refreshed = recalculated.find((l) => l.id === safeLesson.id) || safeLesson;
      setSelectedLesson(refreshed);
    }
  };

  // Quick lesson status update
  const handleQuickUpdateLessonStatus = (
    lessonId: string,
    status: 'completed' | 'cancelled',
    paymentStatus: 'paid' | 'pending'
  ) => {
    const effectivePayment = status === 'cancelled' ? 'pending' : paymentStatus;
    const updated = lessons.map((l) =>
      l.id === lessonId
        ? {
            ...l,
            status,
            paymentStatus: effectivePayment,
          }
        : l
    );
    const recalculated = recalculateLessonNumbers(updated);
    setLessons(recalculated);
    if (selectedLesson && selectedLesson.id === lessonId) {
      const refreshed = recalculated.find((l) => l.id === lessonId);
      if (refreshed) setSelectedLesson(refreshed);
    }
  };

  // Delete single lesson handler
  const handleDeleteLesson = (lessonId: string) => {
    const updated = lessons.filter((l) => l.id !== lessonId);
    setLessons(recalculateLessonNumbers(updated));
    setSelectedLesson(null);
  };

  // Delete multiple lessons handler
  const handleDeleteMultipleLessons = (lessonIds: string[]) => {
    const updated = lessons.filter((l) => !lessonIds.includes(l.id));
    setLessons(recalculateLessonNumbers(updated));
    if (selectedLesson && lessonIds.includes(selectedLesson.id)) {
      setSelectedLesson(null);
    }
  };

  // Update required lessons test threshold
  const handleUpdateRequiredLessons = (newTarget: number) => {
    const target = Math.max(28, newTarget);
    setProfile((prev) => ({
      ...prev,
      requiredLessons: target,
    }));
  };

  // Import full data from JSON backup
  const handleImportFullData = (importedLessons: Lesson[], importedProfile?: StudentProfile) => {
    setLessons(recalculateLessonNumbers(importedLessons));
    if (importedProfile) {
      setProfile({
        ...importedProfile,
        isConfigured: true,
      });
    }
    setSelectedLesson(null);
    setActiveTab('dashboard');
  };

  // Reset data helper -> returns user to initial onboarding flow
  const handleResetData = () => {
    clearAllStoredData();
    setLessons([]);
    setTests([]);
    setProfile({
      ...DEFAULT_STUDENT_PROFILE,
      isConfigured: false,
    });
    setSelectedLesson(null);
    setActiveTab('dashboard');
  };

  // Determine current page title
  const getHeaderTitle = () => {
    if (selectedLesson) return 'פרטי שיעור';
    switch (activeTab) {
      case 'dashboard':
        return 'דף הבית';
      case 'lessons':
        return 'רשימת שיעורים';
      case 'tests':
        return 'מבחנים מעשיים';
      case 'add':
        return 'הוספה';
      case 'profile':
        return 'פרופיל אישי';
      default:
        return 'DriveTrack';
    }
  };

  const completedLessonsCount = calculateCompletedLessonUnits(lessons);
  const isRegistrationPaid = Boolean(profile.registrationFeePayment?.isPaid);
  const hasPassedTest = tests.some((t) => t.type === 'חיצוני' && t.result === 'passed');

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141c2b] flex flex-col font-sans">
      {/* Top Header */}
      <Header
        title={getHeaderTitle()}
        showBack={selectedLesson !== null}
        onBack={() => setSelectedLesson(null)}
        profile={profile}
        onOpenProfile={() => {
          setSelectedLesson(null);
          setActiveTab('profile');
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full">
        {selectedLesson ? (
          <LessonDetailsView
            lesson={selectedLesson}
            profile={profile}
            completedCount={completedLessonsCount}
            onBack={() => setSelectedLesson(null)}
            onUpdateLesson={handleUpdateLesson}
            onDeleteLesson={handleDeleteLesson}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardView
            lessons={lessons}
            tests={tests}
            profile={profile}
            onSelectLesson={(lesson) => setSelectedLesson(lesson)}
            onNavigateTab={handleTabChange}
            onQuickAdd={() => setIsCreateTypeModalOpen(true)}
            onOpenTestGoalModal={() => setIsTestGoalModalOpen(true)}
            onOpenAddMode={handleOpenAddWithMode}
            onSaveRegistrationFee={handleSaveRegistrationFee}
            onDeleteRegistrationFee={handleDeleteRegistrationFee}
            onQuickUpdateLessonStatus={handleQuickUpdateLessonStatus}
          />
        ) : activeTab === 'lessons' ? (
          <LessonsListView
            lessons={lessons}
            profile={profile}
            hasPassedTest={hasPassedTest}
            onSelectLesson={(lesson) => setSelectedLesson(lesson)}
            onAddNewLesson={() => handleOpenAddWithMode('lesson')}
            onOpenTestGoalModal={() => setIsTestGoalModalOpen(true)}
            onQuickUpdateLessonStatus={handleQuickUpdateLessonStatus}
            onDeleteMultipleLessons={handleDeleteMultipleLessons}
          />
        ) : activeTab === 'tests' ? (
          <TestsListView
            tests={tests}
            profile={profile}
            hasPassedTest={hasPassedTest}
            onAddNewTest={() => handleOpenAddWithMode('test')}
            onUpdateTestStatus={handleUpdateTestStatus}
            onUpdateTest={handleUpdateTest}
            onDeleteTest={handleDeleteTest}
          />
        ) : activeTab === 'add' ? (
          <AddUnifiedView
            profile={profile}
            allLessons={lessons}
            existingTests={tests}
            initialMode={addMode}
            hasPassedTest={hasPassedTest}
            onSaveLesson={handleSaveNewLesson}
            onSaveTest={handleSaveNewTest}
            onSaveRegistrationFee={handleSaveRegistrationFee}
            onCancel={() => setActiveTab('dashboard')}
            totalCompletedCount={completedLessonsCount}
          />
        ) : (
          <ProfileView
            profile={profile}
            lessons={lessons}
            onUpdateProfile={(updated) => setProfile(updated)}
            onImportFullData={handleImportFullData}
            onResetAllData={handleResetData}
          />
        )}
      </div>

      {/* Test Target Goal Side Modal */}
      <TestGoalModal
        isOpen={isTestGoalModalOpen}
        onClose={() => setIsTestGoalModalOpen(false)}
        completedLessons={completedLessonsCount}
        requiredLessons={profile.requiredLessons || 28}
        onUpdateRequiredLessons={handleUpdateRequiredLessons}
      />

      {/* Choice Modal: Only for floating (+) button on Dashboard */}
      <CreateTypeModal
        isOpen={isCreateTypeModalOpen}
        onClose={() => setIsCreateTypeModalOpen(false)}
        isRegistrationPaid={isRegistrationPaid}
        hasPassedTest={hasPassedTest}
        onSelectType={(type) => {
          setSelectedLesson(null);
          setAddMode(type);
          setActiveTab('add');
        }}
      />

      {/* Fixed Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={selectedLesson ? 'lessons' : activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
