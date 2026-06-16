import { useState, useEffect } from 'react';
import { Student } from '../lib/types';
import { getStudents } from '../lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { UserCircle, Plus } from 'lucide-react';
import { formatStudentName } from '../lib/utils';

interface StudentListProps {
  onSelectStudent: (student: Student) => void;
  onAddStudent: () => void;
}

export function StudentList({ onSelectStudent, onAddStudent }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    setStudents(getStudents());
  }, []);

  const refreshStudents = () => {
    setStudents(getStudents());
  };

  useEffect(() => {
    const interval = setInterval(refreshStudents, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl mb-2">Laurel Education</h1>
          <p className="text-gray-600">Student Assessment Platform</p>
        </div>
        <Button onClick={onAddStudent} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {students.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCircle className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">No students yet. Add your first student to get started.</p>
            </CardContent>
          </Card>
        ) : (
          students.map(student => (
            <Card
              key={student.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectStudent(student)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <UserCircle className="w-5 h-5" />
                  {formatStudentName(student.name)}
                </CardTitle>
                <CardDescription>Grade {student.grade}</CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
