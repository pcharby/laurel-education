import { useState, useEffect } from 'react';
import { Student, SchoolClass } from '../lib/types';
import { getStudents } from '../lib/storage';
import { auth } from '../../firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Search, UserCircle, UserPlus } from 'lucide-react';
import { LaurelLogo } from './LaurelLogo';
import { formatStudentName } from '../lib/utils';
import { compareStudentsByFirstName } from '../lib/sortStudents';
import { AddStudentDialog } from './AddStudentDialog';

interface MobileStudentSelectorProps {
  onSelectStudent: (student: Student) => void;
  onBack: () => void;
  observationType: 'text' | 'audio' | 'image';
  classInfo: SchoolClass;
}

export function MobileStudentSelector({
  onSelectStudent,
  onBack,
  observationType,
  classInfo
}: MobileStudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [hasAnyStudents, setHasAnyStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // A class with an explicit roster (see "Manage Roster" in Classes &
  // Subjects) shows exactly those students, full stop - this is what lets
  // two different pull-out groups at the same grade stay separate instead
  // of both showing every student at that grade. Without one, falls back to
  // the original implicit match: same grade, and same school if the class
  // has one (keeps two schools' same-grade rosters from bleeding together
  // for an itinerant teacher). A class with no school and no explicit
  // roster keeps the very first grade-only behavior, unaffected.
  const matchesClass = (s: Student) =>
    classInfo.studentIds && classInfo.studentIds.length > 0
      ? classInfo.studentIds.includes(s.id)
      : s.grade === classInfo.grade && (!classInfo.schoolId || s.schoolId === classInfo.schoolId);

  const loadStudents = () => {
    getStudents().then(stored => {
      if (stored.length === 0 && auth.currentUser?.isAnonymous) {
        const demoTeacherId = auth.currentUser.uid;
        const mockStudents: Student[] = [
          { id: '1', teacherId: demoTeacherId, name: 'Emma Thompson', grade: '5', createdAt: new Date().toISOString() },
          { id: '2', teacherId: demoTeacherId, name: 'Liam Chen', grade: '5', createdAt: new Date().toISOString() },
          { id: '3', teacherId: demoTeacherId, name: 'Sophia Martinez', grade: '5', createdAt: new Date().toISOString() },
          { id: '4', teacherId: demoTeacherId, name: 'Noah Patel', grade: '5', createdAt: new Date().toISOString() },
          { id: '5', teacherId: demoTeacherId, name: 'Olivia Johnson', grade: '5', createdAt: new Date().toISOString() },
          { id: '6', teacherId: demoTeacherId, name: 'Ethan Williams', grade: '5', createdAt: new Date().toISOString() },
          { id: '7', teacherId: demoTeacherId, name: 'Ava Brown', grade: '5', createdAt: new Date().toISOString() },
          { id: '8', teacherId: demoTeacherId, name: 'Mason Davis', grade: '5', createdAt: new Date().toISOString() },
          { id: '9', teacherId: demoTeacherId, name: 'Isabella Garcia', grade: '5', createdAt: new Date().toISOString() },
          { id: '10', teacherId: demoTeacherId, name: 'James Wilson', grade: '5', createdAt: new Date().toISOString() },
        ];
        setHasAnyStudents(mockStudents.length > 0);
        setStudents(mockStudents.filter(matchesClass));
      } else {
        setHasAnyStudents(stored.length > 0);
        setStudents(stored.filter(matchesClass));
      }
    });
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classInfo.grade, classInfo.schoolId, classInfo.studentIds]);

  const filteredStudents = students
    .filter(student => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort(compareStudentsByFirstName);

  const getTypeColor = () => {
    switch (observationType) {
      case 'text': return '#7D9D77';
      case 'audio': return '#6B5FE4';
      case 'image': return '#767F93';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b sticky top-0 z-10 p-4" style={{ backgroundColor: `${getTypeColor()}10` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button  size="sm" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <LaurelLogo height="md" showProductName />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowAddDialog(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Student
            </Button>
          </div>
        </div>
        <h2 className="font-semibold mb-1 text-gray-900">{classInfo.subject}</h2>
        <p className="text-sm text-gray-600 mb-3">{classInfo.name}</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search students..."
            aria-label="Search students"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
         />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: 'rgba(91, 155, 213, 0.08)' }}>
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserCircle className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">
              {students.length === 0
                ? hasAnyStudents
                  ? `No students in Grade ${classInfo.grade} yet. Add one to get started with this class.`
                  : 'No students yet. Add your first student to get started.'
                : 'No students match your search.'}
            </p>
            {students.length === 0 && (
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Student
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredStudents.map(student => (
              <Button
                key={student.id}
                onClick={() => onSelectStudent(student)}

                className="w-full h-auto p-3 bg-white/95 hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all justify-start border-2"
                style={{
                  borderLeft: `4px solid ${getTypeColor()}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${getTypeColor()}20` }}
                  >
                    <UserCircle className="w-6 h-6" style={{ color: getTypeColor() }} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-base text-gray-900">{formatStudentName(student.name)}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      <AddStudentDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={loadStudents}
        defaultGrade={classInfo.grade}
        defaultSchoolId={classInfo.schoolId}
      />
    </div>
  );
}
