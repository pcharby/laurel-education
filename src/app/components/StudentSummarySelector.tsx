import { useState, useEffect } from 'react';
import { Student } from '../lib/types';
import { getStudents, getArchivedStudents } from '../lib/storage';
import { auth } from '../../firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Search, UserCircle, UserPlus, Lock, Archive, ChevronDown, ChevronUp } from 'lucide-react';
import { LaurelLogo } from './LaurelLogo';
import { formatStudentName } from '../lib/utils';
import { AddStudentDialog } from './AddStudentDialog';
import { useSchoolYearLock } from '../lib/useSchoolYearLock';

interface StudentSummarySelectorProps {
  onSelectStudent: (student: Student) => void;
  onBack: () => void;
}

export function StudentSummarySelector({ onSelectStudent, onBack }: StudentSummarySelectorProps) {
  const lockInfo = useSchoolYearLock();
  const locked = lockInfo.status === 'locked';
  const [students, setStudents] = useState<Student[]>([]);
  const [archivedStudents, setArchivedStudents] = useState<Student[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const loadArchivedStudents = () => {
    if (auth.currentUser?.isAnonymous) return;
    getArchivedStudents().then(setArchivedStudents);
  };

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
        ];
        setStudents(mockStudents);
      } else {
        setStudents(stored);
      }
    });
  };

  useEffect(() => {
    loadStudents();
    loadArchivedStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col" style={{ backgroundColor: 'rgba(91, 155, 213, 0.08)' }}>
      <div className="bg-white/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button  size="sm" onClick={onBack} className="hover:bg-white/40">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <LaurelLogo height="md" showProductName />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="gap-2"
              disabled={locked}
              title={locked ? 'Your school year is locked - update the end date in Settings to add students.' : undefined}
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </Button>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Student Summaries</h2>
        {locked && (
          <Alert className="bg-amber-50 border-amber-200 mb-3">
            <Lock className="w-4 h-4" />
            <AlertDescription>
              Your school year is locked — new students can't be added until you set a new end date in Settings &gt; School Profile.
            </AlertDescription>
          </Alert>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white"
         />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserCircle className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">
              {students.length === 0
                ? 'No students yet. Add your first student to get started.'
                : 'No students match your search.'}
            </p>
            {students.length === 0 && (
              <Button onClick={() => setShowAddDialog(true)} className="gap-2" disabled={locked}>
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

                className="w-full h-auto p-4 bg-white/95 hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all justify-start border-2 border-white/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center shrink-0">
                    <UserCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-base text-gray-900">{formatStudentName(student.name)}</p>
                    <p className="text-sm text-gray-600">Grade {student.grade}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}

        {archivedStudents.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => setShowArchived(v => !v)}
              >
                <CardTitle className="text-base flex items-center gap-2">
                  <Archive className="w-4 h-4 text-muted-foreground" />
                  Archived Students ({archivedStudents.length})
                </CardTitle>
                {showArchived ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </CardHeader>
            {showArchived && (
              <CardContent className="space-y-2">
                {archivedStudents.map(student => (
                  <Button
                    key={student.id}
                    onClick={() => onSelectStudent(student)}
                    className="w-full h-auto p-4 bg-muted/30 hover:bg-muted/50 transition-all justify-start"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                        <UserCircle className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm text-muted-foreground">{formatStudentName(student.name)}</p>
                        <p className="text-xs text-muted-foreground">Grade {student.grade}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            )}
          </Card>
        )}
      </div>

      <AddStudentDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={loadStudents}
      />
    </div>
  );
}
