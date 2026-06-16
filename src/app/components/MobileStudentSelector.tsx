import { useState, useEffect } from 'react';
import { Student } from '../lib/types';
import { getStudents } from '../lib/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Search, UserCircle } from 'lucide-react';
import { CadentLogo } from './CadentLogo';
import { formatStudentName } from '../lib/utils';

interface MobileStudentSelectorProps {
  onSelectStudent: (student: Student) => void;
  onBack: () => void;
  observationType: 'text' | 'audio' | 'image';
  classInfo: { id: string; name: string; subject: string };
}

export function MobileStudentSelector({
  onSelectStudent,
  onBack,
  observationType,
  classInfo
}: MobileStudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = getStudents();
    if (stored.length === 0) {
      const mockStudents: Student[] = [
        { id: '1', name: 'Emma Thompson', grade: '5', createdAt: new Date().toISOString() },
        { id: '2', name: 'Liam Chen', grade: '5', createdAt: new Date().toISOString() },
        { id: '3', name: 'Sophia Martinez', grade: '5', createdAt: new Date().toISOString() },
        { id: '4', name: 'Noah Patel', grade: '5', createdAt: new Date().toISOString() },
        { id: '5', name: 'Olivia Johnson', grade: '5', createdAt: new Date().toISOString() },
        { id: '6', name: 'Ethan Williams', grade: '5', createdAt: new Date().toISOString() },
        { id: '7', name: 'Ava Brown', grade: '5', createdAt: new Date().toISOString() },
        { id: '8', name: 'Mason Davis', grade: '5', createdAt: new Date().toISOString() },
        { id: '9', name: 'Isabella Garcia', grade: '5', createdAt: new Date().toISOString() },
        { id: '10', name: 'James Wilson', grade: '5', createdAt: new Date().toISOString() },
      ];
      setStudents(mockStudents);
    } else {
      setStudents(stored);
    }
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <CadentLogo height="md" showProductName />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
          </div>
        </div>
        <h2 className="font-semibold mb-1 text-gray-900">{classInfo.subject}</h2>
        <p className="text-sm text-gray-600 mb-3">{classInfo.name}</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
         />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: 'rgba(91, 155, 213, 0.08)' }}>
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
      </div>
    </div>
  );
}
