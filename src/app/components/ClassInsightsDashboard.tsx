import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { StudentListDialog } from './StudentListDialog';
import { ArrowLeft, TrendingUp, TrendingDown, Users, Target, Award, AlertCircle } from 'lucide-react';
import { LaurelLogo } from './LaurelLogo';
import { formatStudentName } from '../lib/utils';

interface ClassInsightsDashboardProps {
  onBack: () => void;
  classInfo: { name: string; subject: string };
}

export function ClassInsightsDashboard({ onBack, classInfo }: ClassInsightsDashboardProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed'>('overview');
  const [studentListDialog, setStudentListDialog] = useState<{
    open: boolean;
    title: string;
    students: { name: string; score: number }[];
    type: 'at-risk' | 'excelling';
  }>({
    open: false,
    title: '',
    students: [],
    type: 'at-risk',
  });

  const classMetrics = {
    'Mathematics': {
      classAverage: 76,
      curriculumAlignment: 82,
      provincialAverage: 74,
      trend: 5,
      totalObservations: 156,
      studentsAtRisk: 3,
      studentsExcelling: 8,
      atRiskStudents: [
        { name: 'Noah Patel', score: 62 },
        { name: 'Mason Davis', score: 58 },
        { name: 'James Wilson', score: 65 },
      ],
      excellingStudents: [
        { name: 'Emma Thompson', score: 92 },
        { name: 'Liam Chen', score: 89 },
        { name: 'Sophia Martinez', score: 91 },
        { name: 'Olivia Johnson', score: 88 },
        { name: 'Ethan Williams', score: 90 },
        { name: 'Ava Brown', score: 87 },
        { name: 'Isabella Garcia', score: 93 },
        { name: 'Charlotte Lee', score: 86 },
      ],
      learningObjectives: [
        {
          name: 'Problem Solving',
          mastery: 78,
          atRisk: 2,
          atRiskStudents: [
            { name: 'Noah Patel', score: 60 },
            { name: 'Mason Davis', score: 55 },
          ]
        },
        {
          name: 'Number Sense',
          mastery: 82,
          atRisk: 1,
          atRiskStudents: [
            { name: 'James Wilson', score: 63 },
          ]
        },
        {
          name: 'Algebraic Thinking',
          mastery: 71,
          atRisk: 4,
          atRiskStudents: [
            { name: 'Noah Patel', score: 58 },
            { name: 'Mason Davis', score: 62 },
            { name: 'James Wilson', score: 65 },
            { name: 'Ava Brown', score: 68 },
          ]
        },
        {
          name: 'Data Management',
          mastery: 85,
          atRisk: 0,
          atRiskStudents: []
        },
      ]
    },
    'Science': {
      classAverage: 81,
      curriculumAlignment: 88,
      provincialAverage: 78,
      trend: 7,
      totalObservations: 98,
      studentsAtRisk: 2,
      studentsExcelling: 12,
      atRiskStudents: [
        { name: 'Mason Davis', score: 68 },
        { name: 'James Wilson', score: 66 },
      ],
      excellingStudents: [
        { name: 'Emma Thompson', score: 95 },
        { name: 'Liam Chen', score: 92 },
        { name: 'Sophia Martinez', score: 94 },
        { name: 'Olivia Johnson', score: 89 },
        { name: 'Ethan Williams', score: 91 },
        { name: 'Ava Brown', score: 88 },
        { name: 'Isabella Garcia', score: 96 },
        { name: 'Charlotte Lee', score: 87 },
        { name: 'Noah Patel', score: 90 },
        { name: 'Mia Rodriguez', score: 89 },
        { name: 'Lucas Kim', score: 93 },
        { name: 'Amelia Singh', score: 88 },
      ],
      learningObjectives: [
        {
          name: 'Scientific Inquiry',
          mastery: 85,
          atRisk: 1,
          atRiskStudents: [{ name: 'Mason Davis', score: 67 }]
        },
        {
          name: 'Critical Thinking',
          mastery: 80,
          atRisk: 2,
          atRiskStudents: [
            { name: 'Mason Davis', score: 68 },
            { name: 'James Wilson', score: 65 },
          ]
        },
        {
          name: 'Observation Skills',
          mastery: 83,
          atRisk: 1,
          atRiskStudents: [{ name: 'James Wilson', score: 66 }]
        },
      ]
    },
    'Language Arts': {
      classAverage: 73,
      curriculumAlignment: 79,
      provincialAverage: 75,
      trend: -2,
      totalObservations: 203,
      studentsAtRisk: 5,
      studentsExcelling: 6,
      atRiskStudents: [
        { name: 'Noah Patel', score: 65 },
        { name: 'Mason Davis', score: 62 },
        { name: 'James Wilson', score: 67 },
        { name: 'Lucas Kim', score: 64 },
        { name: 'Mia Rodriguez', score: 66 },
      ],
      excellingStudents: [
        { name: 'Emma Thompson', score: 89 },
        { name: 'Sophia Martinez', score: 91 },
        { name: 'Isabella Garcia', score: 92 },
        { name: 'Olivia Johnson', score: 88 },
        { name: 'Ava Brown', score: 87 },
        { name: 'Charlotte Lee', score: 86 },
      ],
      learningObjectives: [
        {
          name: 'Reading Comprehension',
          mastery: 77,
          atRisk: 3,
          atRiskStudents: [
            { name: 'Noah Patel', score: 64 },
            { name: 'Mason Davis', score: 61 },
            { name: 'Lucas Kim', score: 63 },
          ]
        },
        {
          name: 'Written Expression',
          mastery: 72,
          atRisk: 5,
          atRiskStudents: [
            { name: 'Noah Patel', score: 65 },
            { name: 'Mason Davis', score: 62 },
            { name: 'James Wilson', score: 67 },
            { name: 'Lucas Kim', score: 64 },
            { name: 'Mia Rodriguez', score: 66 },
          ]
        },
        {
          name: 'Oral Communication',
          mastery: 70,
          atRisk: 4,
          atRiskStudents: [
            { name: 'Noah Patel', score: 66 },
            { name: 'Mason Davis', score: 63 },
            { name: 'James Wilson', score: 68 },
            { name: 'Mia Rodriguez', score: 67 },
          ]
        },
      ]
    },
  };

  const metrics = classMetrics[classInfo.subject as keyof typeof classMetrics];

  const showStudentList = (title: string, students: { name: string; score: number }[], type: 'at-risk' | 'excelling') => {
    setStudentListDialog({ open: true, title, students, type });
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5FC] to-[#EBE8F5] flex flex-col">
      <div className="bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button  size="sm" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <LaurelLogo height="sm" inverted={true} showProductName />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <div className="text-xs text-white/80">Riverside Elem.</div>
          </div>
        </div>
        <h1 className="text-xl font-semibold mb-1">Class Insights</h1>
        <p className="text-white/90">{classInfo.subject} - {classInfo.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-l-4 border-l-[#6B5FE4]">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#6B5FE4]">{metrics.classAverage}%</div>
              <div className="text-xs text-gray-600 mb-2">Class Average</div>
              <div className={`text-xs flex items-center gap-1 ${metrics.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {metrics.trend > 0 ? '+' : ''}{metrics.trend}% this term
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#7D9D77]">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#7D9D77]">{metrics.curriculumAlignment}%</div>
              <div className="text-xs text-gray-600 mb-2">Curriculum Alignment</div>
              <div className="text-xs text-gray-500">{metrics.totalObservations} observations</div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-[#6B5FE4]" />
              Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Your Class</span>
                <span className="font-semibold">{metrics.classAverage}%</span>
              </div>
              <Progress value={metrics.classAverage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Provincial Average</span>
                <span className="font-semibold">{metrics.provincialAverage}%</span>
              </div>
              <Progress value={metrics.provincialAverage} className="h-2 [&>div]:bg-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Student Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-[#6B5FE4]" />
              Student Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => showStudentList('Students Excelling', metrics.excellingStudents, 'excelling')}
              className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Excelling</span>
              </div>
              <Badge  className="bg-green-100 text-green-700">
                {metrics.studentsExcelling} students
              </Badge>
            </button>
            <button
              onClick={() => showStudentList('Students Needing Support', metrics.atRiskStudents, 'at-risk')}
              className="w-full flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Need Support</span>
              </div>
              <Badge  className="bg-yellow-100 text-yellow-700">
                {metrics.studentsAtRisk} students
              </Badge>
            </button>
          </CardContent>
        </Card>

        {/* Learning Objectives */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Learning Objectives Mastery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.learningObjectives.map(obj => (
              <button
                key={obj.name}
                onClick={() => obj.atRisk > 0 && showStudentList(`${obj.name} - Students Needing Support`, obj.atRiskStudents, 'at-risk')}
                className={`w-full text-left ${obj.atRisk > 0 ? 'hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors cursor-pointer' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{obj.name}</p>
                    {obj.atRisk > 0 && (
                      <p className="text-xs text-yellow-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {obj.atRisk} student{obj.atRisk > 1 ? 's' : ''} need support - tap to view
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold">{obj.mastery}%</span>
                </div>
                <Progress value={obj.mastery} className="h-2" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Insights Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Key Insights
            </h3>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>• Class performing above provincial average by {metrics.classAverage - metrics.provincialAverage} percentage points</li>
              <li>• {metrics.studentsExcelling} students ready for enrichment activities</li>
              <li>• Focus area: {metrics.learningObjectives.reduce((prev, curr) => prev.mastery < curr.mastery ? prev : curr).name}</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <StudentListDialog
        open={studentListDialog.open}
        onClose={() => setStudentListDialog({ ...studentListDialog, open: false })}
        title={studentListDialog.title}
        students={studentListDialog.students}
        type={studentListDialog.type}
     />
    </div>
    </>
  );
}
