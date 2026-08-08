import { useState, useEffect } from 'react';
import { Student } from '../lib/types';
import { getStudents } from '../lib/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Search, UserCircle } from 'lucide-react';
import { CadentLogo } from './CadentLogo';
import { formatStudentName } from '../lib/utils';

interface StudentSummarySelectorProps {
  onSelectStudent: (student: Student) => void;
  onBack: () => void;
}

export function StudentSummarySelector({ onSelectStudent, onBack }: StudentSummarySelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getStudents().then(stored => {
      if (stored.length === 0) {
        const mockStudents: Student[] = [
          { id: '1', name: 'Emma Thompson', grade: '5', createdAt: new Date().toISOString() },
          { id: '2', name: 'Liam Chen', grade: '5', createdAt: new Date().toISOString() },
          { id: '3', name: 'Sophia Martinez', grade: '5', createdAt: new Date().toISOString() },
          { id: '4', name: 'Noah Patel', grade: '5', createdAt: new Date().toISOString() },
          { id: '5', name: 'Olivia Johnson', grade: '5', createdAt: new Date().toISOString() },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col" style={{ backgroundColor: 'rgba(91, 155, 213, 0.08)' }}>
      <div className="bg-white/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button  size="sm" onClick={onBack} className="hover:bg-white/40">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CadentLogo height="md" showProductName />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <div className="text-xs text-gray-700">Riverside Elem.</div>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Student Summaries</h2>
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
      </div>
    </div>
  );
}
