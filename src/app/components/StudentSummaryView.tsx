import { useState } from 'react';
import { Student } from '../lib/types';
import { formatStudentName } from '../lib/utils';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Calculator, Beaker, BookText, TrendingUp, TrendingDown, Award, Target, Eye, FileText } from 'lucide-react';
import { CadentLogo } from './CadentLogo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface StudentSummaryViewProps {
  student: Student;
  onBack: () => void;
  onGenerateReport: () => void;
  onViewObservations: () => void;
}

export function StudentSummaryView({ student, onBack, onGenerateReport, onViewObservations }: StudentSummaryViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjects = [
    {
      name: 'Mathematics',
      icon: Calculator,
      score: 78,
      trend: 5,
      observations: 12,
      strengths: ['Problem Solving', 'Algebraic Thinking'],
      growth: ['Multi-step word problems']
    },
    {
      name: 'Science',
      icon: Beaker,
      score: 85,
      trend: 8,
      observations: 8,
      strengths: ['Scientific Inquiry', 'Critical Thinking'],
      growth: ['Hypothesis formation']
    },
    {
      name: 'Language Arts',
      icon: BookText,
      score: 72,
      trend: -2,
      observations: 15,
      strengths: ['Reading Comprehension', 'Creative Writing'],
      growth: ['Grammar & Mechanics', 'Presentations']
    },
  ];

  const selectedSubjectData = subjects.find(s => s.name === selectedSubject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5FC] to-[#EBE8F5] flex flex-col">
      <div className="bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button  size="sm" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CadentLogo height="sm" inverted={true} showProductName />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <div className="text-xs text-white/80">Riverside Elem.</div>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">{formatStudentName(student.name).charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{formatStudentName(student.name)}</h1>
            <p className="text-white/90">Grade {student.grade}</p>
          </div>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold">35</div>
            <div className="text-xs text-white/80">Observations</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold">78%</div>
            <div className="text-xs text-white/80">Avg Score</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <TrendingUp className="w-5 h-5" />
              +4%
            </div>
            <div className="text-xs text-white/80">This Month</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 pb-20">
        <Button
          onClick={onGenerateReport}
          className="w-full h-12 bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] hover:from-[#1A1A40]/90 hover:to-[#6B5FE4]/90 text-white font-semibold mb-4"
        >
          Generate Report Card Commentary
        </Button>

        <h2 className="text-sm font-semibold text-gray-600 uppercase">Subject Performance</h2>

        <div className="grid grid-cols-3 gap-2">
          {subjects.map((subject) => {
            const SubjectIcon = subject.icon;
            return (
              <button
                key={subject.name}
                onClick={() => setSelectedSubject(subject.name)}
                className="bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-all active:scale-95 text-center border-2 border-transparent hover:border-[#6B5FE4]"
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center mb-1">
                    <SubjectIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-semibold mb-1 text-gray-900">{subject.name}</p>
                  <div className="text-xl font-bold text-[#6B5FE4]">{subject.score}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className="bg-gradient-to-r from-[#6B5FE4] to-[#1A1A40] h-1 rounded-full transition-all"
                      style={{ width: `${subject.score}%` }}
                   />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-sm">Top Strengths</h3>
              </div>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Collaboration</li>
                <li>• Problem-solving</li>
                <li>• Participation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-sm">Focus Areas</h3>
              </div>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Time management</li>
                <li>• Presentations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <Button
          onClick={onViewObservations}
          
          className="w-full h-12 border-2 border-[#6B5FE4] hover:bg-[#EBE8F5] font-semibold gap-2"
        >
          <FileText className="w-5 h-5" />
          View All Observations
        </Button>
      </div>

      {/* Subject Detail Dialog */}
      {selectedSubjectData && (
        <Dialog open={!!selectedSubject} onOpenChange={() => setSelectedSubject(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center">
                  <selectedSubjectData.icon className="w-6 h-6 text-white" />
                </div>
                <DialogTitle>{selectedSubjectData.name}</DialogTitle>
              </div>
              <DialogDescription>
                Detailed performance breakdown and growth areas
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-[#6B5FE4]/10 to-[#7D9D77]/10 rounded-lg">
                <div className="text-4xl font-bold text-[#6B5FE4] mb-1">{selectedSubjectData.score}%</div>
                <div className="text-sm text-gray-600">{selectedSubjectData.observations} observations recorded</div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <h3 className="font-semibold text-sm">Strengths</h3>
                </div>
                <ul className="text-sm space-y-1 text-gray-700">
                  {selectedSubjectData.strengths.map(s => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-sm">Growth Areas</h3>
                </div>
                <ul className="text-sm space-y-1 text-gray-700">
                  {selectedSubjectData.growth.map(g => (
                    <li key={g}>• {g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
