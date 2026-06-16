import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { BookOpen, Users, Calculator, Beaker, BookText, Palette, LogOut, Settings } from 'lucide-react';
import { CadentLogo } from './CadentLogo';

interface ClassSelectorProps {
  onSelectClass: (classInfo: { id: string; name: string; subject: string }) => void;
  onViewStudentSummary: () => void;
  onLogout: () => void;
  onSettings: () => void;
}

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

export function ClassSelector({ onSelectClass, onViewStudentSummary, onLogout, onSettings }: ClassSelectorProps) {
  const classes = [
    { id: 'math-5a', name: 'Grade 5A', subject: 'Mathematics' },
    { id: 'math-5b', name: 'Grade 5B', subject: 'Mathematics' },
    { id: 'science-5a', name: 'Grade 5A', subject: 'Science' },
    { id: 'lang-5a', name: 'Grade 5A', subject: 'Language Arts' },
  ];

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
            R
          </div>
          <div className="text-left">
            <div className="text-xs text-gray-700">Riverside Elementary</div>
            <CadentLogo height="md" showProductName />
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">Welcome, Ms. Smith!</h1>
        <p className="text-gray-600 mb-4">Select Your Class</p>

        <Button
          onClick={onViewStudentSummary}
          className="w-full max-w-md mx-auto h-14 bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] hover:from-[#1A1A40]/90 hover:to-[#6B5FE4]/90 shadow-lg text-white font-semibold text-base"
        >
          <Users className="w-5 h-5 mr-2" />
          View Student Summary
        </Button>
      </div>

      <div className="flex-1 space-y-3 pb-4 pt-4">
        {classes.map((classInfo) => {
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
                  <p className="text-sm text-gray-600">{classInfo.name}</p>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
