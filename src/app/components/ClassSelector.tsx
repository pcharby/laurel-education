import { useState, useEffect } from 'react';
import { SchoolClass, School } from '../lib/types';
import { getClasses, getSchools } from '../lib/storage';
import { auth } from '../../firebase';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { BookOpen, Users, Calculator, Beaker, BookText, Palette, LogOut, Settings, Plus, Loader2, Lock } from 'lucide-react';
import { LaurelLogo } from './LaurelLogo';
import { useSchoolName, badgeLetterFor } from '../lib/useSchoolName';
import { useSchoolYearLock } from '../lib/useSchoolYearLock';
import { useTeacherDisplayName } from '../lib/useTeacherDisplayName';

interface ClassSelectorProps {
  onSelectClass: (classInfo: SchoolClass) => void;
  onViewStudentSummary: () => void;
  onLogout: () => void;
  onSettings: () => void;
  onManageClasses: () => void;
  onSchools: () => void;
}

const DEMO_CLASSES: SchoolClass[] = [
  { id: 'demo-math-5a', teacherId: 'demo', subject: 'Mathematics', grade: '5', name: 'A', createdAt: '' },
  { id: 'demo-math-5b', teacherId: 'demo', subject: 'Mathematics', grade: '5', name: 'B', createdAt: '' },
  { id: 'demo-science-5a', teacherId: 'demo', subject: 'Science', grade: '5', name: 'A', createdAt: '' },
  { id: 'demo-lang-5a', teacherId: 'demo', subject: 'Language Arts', grade: '5', name: 'A', createdAt: '' },
];

const getSubjectIcon = (subject: string) => {
  switch (subject) {
    case 'Mathematics':
      return Calculator;
    case 'Science':
      return Beaker;
    case 'Language Arts':
      return BookText;
    case 'Visual Arts':
      return Palette;
    default:
      return BookOpen;
  }
};

const getSubjectColor = (subject: string) => {
  switch (subject) {
    case 'Mathematics':
      return '#6B5FE4'; // Soft violet
    case 'Science':
      return '#7D9D77'; // Muted sage
    case 'Language Arts':
      return '#4B5E7A'; // Warm slate
    default:
      return '#1A1A40'; // Deep indigo
  }
};

export function ClassSelector({ onSelectClass, onViewStudentSummary, onLogout, onSettings, onManageClasses, onSchools }: ClassSelectorProps) {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');
  const isDemo = auth.currentUser?.isAnonymous ?? false;
  const { schoolName, badgeLetter } = useSchoolName();
  const lockInfo = useSchoolYearLock();
  const displayName = useTeacherDisplayName();

  useEffect(() => {
    if (isDemo) {
      setClasses(DEMO_CLASSES);
      setLoading(false);
      return;
    }
    getClasses().then(result => {
      setClasses(result.filter(c => !c.archived));
      setLoading(false);
    });
    getSchools().then(setSchools);
  }, [isDemo]);

  // Only shown to teachers who've set up more than one school - otherwise
  // this filter would just be a no-op control cluttering the common case.
  const visibleClasses = schools.length > 1 && selectedSchoolId !== 'all'
    ? classes.filter(c => c.schoolId === selectedSchoolId)
    : classes;

  // Once a specific school is selected, the header should say which one -
  // otherwise it's stuck on the teacher-profile name no matter which
  // school's classes are actually on screen. Falls back to the profile name
  // for "All Schools" or the common single-school case.
  const selectedSchool = schools.length > 1 ? schools.find(s => s.id === selectedSchoolId) : undefined;
  const headerName = selectedSchool?.name ?? schoolName;
  const headerBadge = selectedSchool ? badgeLetterFor(selectedSchool.name) : badgeLetter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5FC] to-[#EBE8F5] flex flex-col p-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button

          size="sm"
          onClick={onSettings}
          className="hover:bg-white/40 gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
        <Button

          size="sm"
          onClick={onLogout}
          className="hover:bg-white/40 gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      <div className="text-center pt-2 pb-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center text-white font-bold text-lg">
            {headerBadge}
          </div>
          <div className="text-left">
            <div className="text-xs text-gray-700">{headerName}</div>
            <LaurelLogo height="md" showProductName />
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">Welcome{displayName ? `, ${displayName}` : ''}!</h1>
        <p className="text-gray-600 mb-4">Select Your Class</p>

        <Button
          onClick={onViewStudentSummary}
          className="w-full max-w-md mx-auto h-14 bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] hover:from-[#1A1A40]/90 hover:to-[#6B5FE4]/90 shadow-lg text-white font-semibold text-base"
        >
          <Users className="w-5 h-5 mr-2" />
          View Student Summary
        </Button>

        {lockInfo.status === 'locked' && (
          <Alert className="bg-amber-50 border-amber-200 mt-4 max-w-md mx-auto text-left">
            <Lock className="w-4 h-4" />
            <AlertDescription>
              Your school year is locked. Set a new end date in Settings &gt; School Profile to unlock and start adding classes again.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {schools.length > 1 && classes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 max-w-md mx-auto w-full">
          <Button
            size="sm"
            onClick={() => setSelectedSchoolId('all')}
            className={selectedSchoolId === 'all' ? 'bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4]' : ''}
          >
            All Schools
          </Button>
          {schools.map(school => (
            <Button
              key={school.id}
              size="sm"
              onClick={() => setSelectedSchoolId(school.id)}
              className={selectedSchoolId === school.id ? 'bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4]' : ''}
            >
              {school.name}
            </Button>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-3 pb-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#6B5FE4]" />
          </div>
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center max-w-sm mx-auto">
            <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">
              You haven't added any classes yet. Add your first class to start recording observations.
            </p>
            <Button
              onClick={onManageClasses}
              className="gap-2 bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] text-white font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Your First Class
            </Button>
            {schools.length === 0 && (
              <p className="text-sm text-gray-500 mt-4">
                Teaching at more than one school this year?{' '}
                <button onClick={onSchools} className="text-[#6B5FE4] font-medium underline underline-offset-2 hover:text-[#1A1A40]">
                  Set up your schools
                </button>{' '}
                first so classes and curriculum can be scoped per school.
              </p>
            )}
          </div>
        ) : visibleClasses.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No classes for this school yet.</p>
        ) : (
          visibleClasses.map((classInfo) => {
            const SubjectIcon = getSubjectIcon(classInfo.subject);
            const subjectColor = getSubjectColor(classInfo.subject);
            return (
              <Button
                key={classInfo.id}
                onClick={() => onSelectClass(classInfo)}

                className="w-full h-auto p-4 bg-white/95 hover:bg-white hover:scale-[1.02] border-2 border-white/40 hover:border-white transition-all shadow-lg"
              >
                <div className="flex items-center gap-3 w-full">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: subjectColor }}
                  >
                    <SubjectIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-base text-gray-900">{classInfo.subject}</p>
                    <p className="text-sm text-gray-600">
                      Grade {classInfo.grade}{classInfo.name ? ` — ${classInfo.name}` : ''}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })
        )}
      </div>
    </div>
  );
}
