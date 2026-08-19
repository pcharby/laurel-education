import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { Student, SchoolClass } from './lib/types';
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
import { ReportProblem } from './components/ReportProblem';
import { SchoolProfile } from './components/SchoolProfile';
import { SchoolsConfig } from './components/SchoolsConfig';
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
  | 'password-management'
  | 'report-problem'
  | 'school-profile'
  | 'schools';

const VIEW_LABELS: Record<View, string> = {
  login: 'Login',
  'class-selection': 'Select Class',
  'type-selection': 'Choose Observation Type',
  'student-selection': 'Select Student',
  'observation-entry': 'Add Observation',
  'summary-student-selection': 'Select Student (Summary)',
  'student-summary': 'Student Summary',
  'report-generation': 'Generate Report',
  'observation-history': 'Observation History',
  'data-export': 'Export Student Data',
  'class-insights': 'Class Insights',
  'custom-rubrics': 'Custom Rubrics',
  settings: 'Settings',
  'classes-and-subjects': 'Classes & Subjects',
  curriculum: 'Curriculum',
  'password-management': 'Password Management',
  'report-problem': 'Report a Problem',
  'school-profile': 'School Profile',
  schools: 'Schools',
};

// Report Problem is only reachable via Settings, which is itself only
// reachable from Select Class - so "the screen right before this one" is
// always the same and tells you nothing about where the teacher actually
// hit a problem. This keeps a short trail of every screen visited instead,
// so a bug report can show the real path (e.g. "Add Observation -> Select
// Class -> Settings") rather than just the last hop.
const MAX_TRAIL_LENGTH = 6;

export default function App() {
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);
  const [view, setView] = useState<View>('login');
  const [viewTrail, setViewTrail] = useState<View[]>(['login']);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [selectedType, setSelectedType] = useState<'text' | 'audio' | 'image' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const goTo = (next: View) => {
    setView(next);
    setViewTrail((prev) => [...prev, next].slice(-MAX_TRAIL_LENGTH));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      const next = user ? 'class-selection' : 'login';
      setView(next);
      setViewTrail([next]);
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

  const handleSelectClass = (classInfo: SchoolClass) => {
    setSelectedClass(classInfo);
    goTo('type-selection');
  };

  const handleViewStudentSummary = () => {
    goTo('summary-student-selection');
  };

  const handleSelectType = (type: 'text' | 'audio' | 'image') => {
    setSelectedType(type);
    goTo('student-selection');
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    goTo('observation-entry');
  };

  const handleSelectStudentForSummary = (student: Student) => {
    setSelectedStudent(student);
    goTo('student-summary');
  };

  const handleBackToClassSelection = () => {
    goTo('class-selection');
    setSelectedClass(null);
    setSelectedType(null);
  };

  const handleBackToTypeSelection = () => {
    goTo('type-selection');
    setSelectedType(null);
  };

  const handleBackToSummarySelection = () => {
    goTo('summary-student-selection');
    setSelectedStudent(null);
  };

  const handleCloseObservation = () => {
    goTo('type-selection');
    setSelectedType(null);
    setSelectedStudent(null);
  };

  const handleObservationSuccess = () => {
    toast.success('Observation saved successfully!');
    goTo('type-selection');
    setSelectedType(null);
    setSelectedStudent(null);
  };

  const handleGenerateReport = () => {
    goTo('report-generation');
  };

  const handleBackFromReport = () => {
    goTo('student-summary');
  };

  const handleViewObservations = () => {
    goTo('observation-history');
  };

  const handleBackFromObservations = () => {
    goTo('student-summary');
  };

  const handleExportData = () => {
    goTo('data-export');
  };

  const handleBackFromExport = () => {
    goTo('student-summary');
  };

  const handleClassInsights = () => {
    goTo('class-insights');
  };

  const handleBackFromClassInsights = () => {
    goTo('type-selection');
  };

  const handleCustomRubrics = () => {
    goTo('custom-rubrics');
  };

  const handleBackFromCustomRubrics = () => {
    goTo('curriculum');
  };

  const handleClassesAndSubjects = () => {
    goTo('classes-and-subjects');
  };

  const handleBackFromClassesAndSubjects = () => {
    goTo('settings');
  };

  const handleCurriculum = () => {
    goTo('curriculum');
  };

  const handleBackFromCurriculum = () => {
    goTo('settings');
  };

  const handlePasswordManagement = () => {
    goTo('password-management');
  };

  const handleBackFromPasswordManagement = () => {
    goTo('settings');
  };

  const handleReportProblem = () => {
    goTo('report-problem');
  };

  const handleBackFromReportProblem = () => {
    goTo('settings');
  };

  const handleSchoolProfile = () => {
    goTo('school-profile');
  };

  const handleBackFromSchoolProfile = () => {
    goTo('settings');
  };

  const handleSchools = () => {
    goTo('schools');
  };

  const handleBackFromSchools = () => {
    goTo('settings');
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out successfully');
  };

  const handleSettings = () => {
    goTo('settings');
  };

  const handleBackFromSettings = () => {
    goTo('class-selection');
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
          onManageClasses={handleClassesAndSubjects}
          onSchools={handleSchools}
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
          onReportProblem={handleReportProblem}
          onSchoolProfile={handleSchoolProfile}
          onSchools={handleSchools}
        />
      )}

      {view === 'school-profile' && (
        <SchoolProfile onBack={handleBackFromSchoolProfile} />
      )}

      {view === 'schools' && (
        <SchoolsConfig onBack={handleBackFromSchools} />
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

      {view === 'report-problem' && (
        <ReportProblem
          onBack={handleBackFromReportProblem}
          screenTrail={viewTrail
            .filter((v) => v !== 'report-problem')
            .map((v) => VIEW_LABELS[v])
            .join(' -> ')}
        />
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
          grade={selectedClass.grade}
          schoolId={selectedClass.schoolId}
        />
      )}

      <Toaster />
    </>
  );
}