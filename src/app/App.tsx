import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { Student } from './lib/types';
import { LoginScreen } from './components/LoginScreen';
import { ClassSelector } from './components/ClassSelector';
import { MobileObservationTypeSelector } from './components/MobileObservationTypeSelector';
import { MobileStudentSelector } from './components/MobileStudentSelector';
import { StudentSummarySelector } from './components/StudentSummarySelector';
import { StudentSummaryView } from './components/StudentSummaryView';
import { ReportGenerationView } from './components/ReportGenerationView';
import { StudentObservationHistory } from './components/StudentObservationHistory';
import { StudentDataExport } from './components/StudentDataExport';
import { ClassInsightsDashboard } from './components/ClassInsightsDashboard';
import { CustomRubricsConfig } from './components/CustomRubricsConfig';
import { SettingsMenu } from './components/SettingsMenu';
import { ClassesAndSubjectsConfig } from './components/ClassesAndSubjectsConfig';
import { CurriculumConfig } from './components/CurriculumConfig';
import { PasswordManagement } from './components/PasswordManagement';
import { AddObservationDialog } from './components/AddObservationDialog';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

type View =
  | 'login'
  | 'class-selection'
  | 'type-selection'
  | 'student-selection'
  | 'observation-entry'
  | 'summary-student-selection'
  | 'student-summary'
  | 'report-generation'
  | 'observation-history'
  | 'data-export'
  | 'class-insights'
  | 'custom-rubrics'
  | 'settings'
  | 'classes-and-subjects'
  | 'curriculum'
  | 'password-management';

export default function App() {
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);
  const [view, setView] = useState<View>('login');
  const [selectedClass, setSelectedClass] = useState<{ id: string; name: string; subject: string } | null>(null);
  const [selectedType, setSelectedType] = useState<'text' | 'audio' | 'image' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setView(user ? 'class-selection' : 'login');
    });
    return unsubscribe;
  }, []);

  const handleLogin = () => {
    // Navigation happens via onAuthStateChanged once Firebase confirms the session.
  };

  const handleDemo = async () => {
    try {
      await signInAnonymously(auth);
      toast.success('Welcome to the Laurel Education Demo!');
    } catch {
      toast.error('Could not start the demo. Please try again.');
    }
  };

  const handleSelectClass = (classInfo: { id: string; name: string; subject: string }) => {
    setSelectedClass(classInfo);
    setView('type-selection');
  };

  const handleViewStudentSummary = () => {
    setView('summary-student-selection');
  };

  const handleSelectType = (type: 'text' | 'audio' | 'image') => {
    setSelectedType(type);
    setView('student-selection');
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setView('observation-entry');
  };

  const handleSelectStudentForSummary = (student: Student) => {
    setSelectedStudent(student);
    setView('student-summary');
  };

  const handleBackToClassSelection = () => {
    setView('class-selection');
    setSelectedClass(null);
    setSelectedType(null);
  };

  const handleBackToTypeSelection = () => {
    setView('type-selection');
    setSelectedType(null);
  };

  const handleBackToSummarySelection = () => {
    setView('summary-student-selection');
    setSelectedStudent(null);
  };

  const handleCloseObservation = () => {
    setView('type-selection');
    setSelectedType(null);
    setSelectedStudent(null);
  };

  const handleObservationSuccess = () => {
    toast.success('Observation saved successfully!');
    setView('type-selection');
    setSelectedType(null);
    setSelectedStudent(null);
  };

  const handleGenerateReport = () => {
    setView('report-generation');
  };

  const handleBackFromReport = () => {
    setView('student-summary');
  };

  const handleViewObservations = () => {
    setView('observation-history');
  };

  const handleBackFromObservations = () => {
    setView('student-summary');
  };

  const handleExportData = () => {
    setView('data-export');
  };

  const handleBackFromExport = () => {
    setView('student-summary');
  };

  const handleClassInsights = () => {
    setView('class-insights');
  };

  const handleBackFromClassInsights = () => {
    setView('type-selection');
  };

  const handleCustomRubrics = () => {
    setView('custom-rubrics');
  };

  const handleBackFromCustomRubrics = () => {
    setView('curriculum');
  };

  const handleClassesAndSubjects = () => {
    setView('classes-and-subjects');
  };

  const handleBackFromClassesAndSubjects = () => {
    setView('settings');
  };

  const handleCurriculum = () => {
    setView('curriculum');
  };

  const handleBackFromCurriculum = () => {
    setView('settings');
  };

  const handlePasswordManagement = () => {
    setView('password-management');
  };

  const handleBackFromPasswordManagement = () => {
    setView('settings');
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out successfully');
  };

  const handleSettings = () => {
    setView('settings');
  };

  const handleBackFromSettings = () => {
    setView('class-selection');
  };

  if (authUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A40] via-[#2E2B6E] to-[#6B5FE4]">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {view === 'login' && (
        <LoginScreen onLogin={handleLogin} onDemo={handleDemo} />
      )}

      {view === 'class-selection' && (
        <ClassSelector
          onSelectClass={handleSelectClass}
          onViewStudentSummary={handleViewStudentSummary}
          onLogout={handleLogout}
          onSettings={handleSettings}
        />
      )}

      {view === 'type-selection' && selectedClass && (
        <MobileObservationTypeSelector
          onSelectType={handleSelectType}
          onBack={handleBackToClassSelection}
          onClassInsights={handleClassInsights}
          classInfo={selectedClass}
        />
      )}

      {view === 'student-selection' && selectedType && selectedClass && (
        <MobileStudentSelector
          onSelectStudent={handleSelectStudent}
          onBack={handleBackToTypeSelection}
          observationType={selectedType}
          classInfo={selectedClass}
        />
      )}

      {view === 'summary-student-selection' && (
        <StudentSummarySelector
          onSelectStudent={handleSelectStudentForSummary}
          onBack={handleBackToClassSelection}
        />
      )}

      {view === 'student-summary' && selectedStudent && (
        <StudentSummaryView
          student={selectedStudent}
          onBack={handleBackToSummarySelection}
          onGenerateReport={handleGenerateReport}
          onViewObservations={handleViewObservations}
          onExportData={handleExportData}
        />
      )}

      {view === 'observation-history' && selectedStudent && (
        <StudentObservationHistory
          student={selectedStudent}
          onBack={handleBackFromObservations}
        />
      )}

      {view === 'data-export' && selectedStudent && (
        <StudentDataExport
          student={selectedStudent}
          onBack={handleBackFromExport}
        />
      )}

      {view === 'class-insights' && selectedClass && (
        <ClassInsightsDashboard
          onBack={handleBackFromClassInsights}
          classInfo={selectedClass}
        />
      )}

      {view === 'custom-rubrics' && (
        <CustomRubricsConfig onBack={handleBackFromCustomRubrics} />
      )}

      {view === 'settings' && (
        <SettingsMenu
          onBack={handleBackFromSettings}
          onClassesAndSubjects={handleClassesAndSubjects}
          onCurriculum={handleCurriculum}
          onPasswordManagement={handlePasswordManagement}
        />
      )}

      {view === 'classes-and-subjects' && (
        <ClassesAndSubjectsConfig
          onBack={handleBackFromClassesAndSubjects}
        />
      )}

      {view === 'curriculum' && (
        <CurriculumConfig onBack={handleBackFromCurriculum} onCustomRubrics={handleCustomRubrics} />
      )}

      {view === 'password-management' && (
        <PasswordManagement onBack={handleBackFromPasswordManagement} />
      )}

      {view === 'report-generation' && selectedStudent && (
        <ReportGenerationView
          student={selectedStudent}
          onBack={handleBackFromReport}
        />
      )}

      {view === 'observation-entry' && selectedStudent && selectedType && selectedClass && (
        <AddObservationDialog
          open={true}
          onClose={handleCloseObservation}
          onSuccess={handleObservationSuccess}
          studentId={selectedStudent.id}
          initialType={selectedType}
          subject={selectedClass.subject}
        />
      )}

      <Toaster />
    </>
  );
}