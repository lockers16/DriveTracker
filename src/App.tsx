import React, { useState, useEffect } from 'react';
import { Lesson, DrivingTest, NavigationTab, StudentProfile, TestResultStatus, PaymentStatus } from './types';
import {
  getStoredLessons,
  saveStoredLessons,
  getStoredTests,
  saveStoredTests,
  getStoredProfile,
  saveStoredProfile,
  INITIAL_LESSONS,
  INITIAL_TESTS,
  DEFAULT_STUDENT_PROFILE,
} from './data/initialData';

import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { LessonsListView } from './components/LessonsListView';
import { TestsListView } from './components/TestsListView';
import { AddLessonView } from './components/AddLessonView';
import { AddTestView } from './components/AddTestView';
import { LessonDetailsView } from './components/LessonDetailsView';
import { ProfileView } from './components/ProfileView';
import { TestGoalModal } from './components/TestGoalModal';
import { CreateTypeModal } from './components/CreateTypeModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isTestGoalModalOpen, setIsTestGoalModalOpen] = useState(false);
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);

  const [lessons, setLessons] = useState<Lesson[]>(() => getStoredLessons());
  const [tests, setTests] = useState<DrivingTest[]>(() => getStoredTests());
  const [profile, setProfile] = useState<StudentProfile>(() => getStoredProfile());

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

  // Tab switching handler
  const handleTabChange = (tab: NavigationTab) => {
    setSelectedLesson(null);
    if (tab === 'add') {
      setIsCreateTypeModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  // Add lesson handler
  const handleSaveNewLesson = (newLessonData: Omit<Lesson, 'id'>) => {
    const newId = `lesson-${Date.now()}`;
    const newLesson: Lesson = {
      ...newLessonData,
      id: newId,
    };

    const updated = [newLesson, ...lessons];
    setLessons(updated);
    setSelectedLesson(newLesson);
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
    setActiveTab('tests');
  };

  // Update test status handler
  const handleUpdateTestStatus = (
    testId: string,
    result: TestResultStatus,
    paymentStatus?: PaymentStatus
  ) => {
    const updated = tests.map((t) =>
      t.id === testId
        ? {
            ...t,
            result,
            paymentStatus: paymentStatus !== undefined ? paymentStatus : t.paymentStatus,
          }
        : t
    );
    setTests(updated);
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
  };

  // Update lesson handler
  const handleUpdateLesson = (updatedLesson: Lesson) => {
    const updated = lessons.map((l) => (l.id === updatedLesson.id ? updatedLesson : l));
    setLessons(updated);
    if (selectedLesson && selectedLesson.id === updatedLesson.id) {
      setSelectedLesson(updatedLesson);
    }
  };

  // Quick lesson status update (from "התקיים?" action buttons)
  const handleQuickUpdateLessonStatus = (
    lessonId: string,
    status: 'completed' | 'cancelled',
    paymentStatus: 'paid' | 'pending'
  ) => {
    const updated = lessons.map((l) =>
      l.id === lessonId
        ? {
            ...l,
            status,
            paymentStatus,
          }
        : l
    );
    setLessons(updated);
  };

  // Delete single lesson handler
  const handleDeleteLesson = (lessonId: string) => {
    const updated = lessons.filter((l) => l.id !== lessonId);
    setLessons(updated);
    setSelectedLesson(null);
  };

  // Delete multiple lessons handler
  const handleDeleteMultipleLessons = (lessonIds: string[]) => {
    const updated = lessons.filter((l) => !lessonIds.includes(l.id));
    setLessons(updated);
    if (selectedLesson && lessonIds.includes(selectedLesson.id)) {
      setSelectedLesson(null);
    }
  };

  // Update required lessons test threshold
  const handleUpdateRequiredLessons = (newTarget: number) => {
    setProfile((prev) => ({
      ...prev,
      requiredLessons: newTarget,
    }));
  };

  // Import full data from JSON backup
  const handleImportFullData = (importedLessons: Lesson[], importedProfile: StudentProfile) => {
    setLessons(importedLessons);
    setProfile(importedProfile);
    setSelectedLesson(null);
    setActiveTab('dashboard');
  };

  // Reset data helper
  const handleResetData = () => {
    setLessons(INITIAL_LESSONS);
    setTests(INITIAL_TESTS);
    setProfile(DEFAULT_STUDENT_PROFILE);
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
        return 'הוספת שיעור';
      case 'add-test':
        return 'הוספת טסט';
      case 'profile':
        return 'פרופיל אישי';
      default:
        return 'DriveTrack';
    }
  };

  const completedLessonsCount = lessons.filter((l) => l.status === 'completed').length;

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
            onQuickUpdateLessonStatus={handleQuickUpdateLessonStatus}
          />
        ) : activeTab === 'lessons' ? (
          <LessonsListView
            lessons={lessons}
            profile={profile}
            onSelectLesson={(lesson) => setSelectedLesson(lesson)}
            onAddNewLesson={() => setActiveTab('add')}
            onOpenTestGoalModal={() => setIsTestGoalModalOpen(true)}
            onQuickUpdateLessonStatus={handleQuickUpdateLessonStatus}
            onDeleteMultipleLessons={handleDeleteMultipleLessons}
          />
        ) : activeTab === 'tests' ? (
          <TestsListView
            tests={tests}
            profile={profile}
            onAddNewTest={() => setActiveTab('add-test')}
            onUpdateTestStatus={handleUpdateTestStatus}
            onUpdateTest={handleUpdateTest}
            onDeleteTest={handleDeleteTest}
          />
        ) : activeTab === 'add' ? (
          <AddLessonView
            profile={profile}
            allLessons={lessons}
            onSaveLesson={handleSaveNewLesson}
            onCancel={() => setActiveTab('lessons')}
            totalCompletedCount={completedLessonsCount}
          />
        ) : activeTab === 'add-test' ? (
          <AddTestView
            profile={profile}
            existingTests={tests}
            onSaveTest={handleSaveNewTest}
            onCancel={() => setActiveTab('tests')}
          />
        ) : (
          <ProfileView
            profile={profile}
            lessons={lessons}
            tests={tests}
            onUpdateProfile={(updated) => setProfile(updated)}
            onImportFullData={handleImportFullData}
            onResetData={handleResetData}
          />
        )}
      </div>

      {/* Test Target Goal Side Modal */}
      <TestGoalModal
        isOpen={isTestGoalModalOpen}
        onClose={() => setIsTestGoalModalOpen(false)}
        completedLessons={completedLessonsCount}
        requiredLessons={profile.requiredLessons}
        onUpdateRequiredLessons={handleUpdateRequiredLessons}
      />

      {/* Choice Modal: New Lesson or New Test */}
      <CreateTypeModal
        isOpen={isCreateTypeModalOpen}
        onClose={() => setIsCreateTypeModalOpen(false)}
        onSelectType={(type) => {
          setSelectedLesson(null);
          if (type === 'lesson') {
            setActiveTab('add');
          } else {
            setActiveTab('add-test');
          }
        }}
      />

      {/* Fixed Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={selectedLesson ? 'lessons' : activeTab === 'add-test' ? 'tests' : activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
