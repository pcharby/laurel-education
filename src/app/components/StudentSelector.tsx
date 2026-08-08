import { useState, useEffect } from 'react';
import { Student } from '../lib/types';
import { getStudents } from '../lib/storage';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Search, UserCircle } from 'lucide-react';
import { CadentLogo } from './CadentLogo';
import { formatStudentName } from '../lib/utils';

interface StudentSelectorProps {
  onSelectStudent: (student: Student) => void;
  onBack: () => void;
  observationType: 'text' | 'audio' | 'image';
}

export function StudentSelector({ onSelectStudent, onBack, observationType }: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getStudents().then(stored => {
      if (stored.length === 0) {
        // Load mock students for demo
        const mockStudents: Student[] = [
          { id: '1', name: 'Emma Thompson', grade: '5', createdAt: new Date().toISOString() },
          { id: '2', name: 'Liam Chen', grade: '5', createdAt: new Date().toISOString() },
          { id: '3', name: 'Sophia Martinez', grade: '5', createdAt: new Date().toISOString() },
          { id: '4', name: 'Noah Patel', grade: '5', createdAt: new Date().toISOString() },
          { id: '5', name: 'Olivia Johnson', grade: '5', createdAt: new Date().toISOString() },
          { id: '6', name: 'Ethan Williams', grade: '5', createdAt: new Date().toISOString() },
          { id: '7', name: 'Ava Brown', grade: '5', createdAt: new Date().toISOString() },
          { id: '8', name: 'Mason Davis', grade: '5', createdAt: new Date().toISOString() },
        ];
        setStudents(mockStudents);
      } else {
        setStudents(stored);
      }
    });
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeLabel = () => {
    switch (observationType) {
      case 'text': return 'Text Note';
      case 'audio': return 'Voice Memo';
      case 'image': return 'Photo';
    }
  };

  const getTypeColor = () => {
    switch (observationType) {
      case 'text': return '#7D9D77';
      case 'audio': return '#6B5FE4';
      case 'image': return '#767F93';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button  onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <CadentLogo height="md" showProductName />
          <div className="flex-1">
            <h1 className="text-3xl mb-1">Select Student</h1>
            <p className="text-gray-600">Recording {getTypeLabel()} observation</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search students by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
           />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserCircle className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {searchQuery ? 'No students found matching your search' : 'No students available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map(student => (
              <Card
                key={student.id}
                className="cursor-pointer hover:shadow-lg transition-all"
                style={{ borderColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = getTypeColor()}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                onClick={() => onSelectStudent(student)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${getTypeColor()}20` }}
                  >
                    <UserCircle className="w-7 h-7" style={{ color: getTypeColor() }} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formatStudentName(student.name)}</p>
                    <p className="text-sm text-gray-600">Grade {student.grade}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
