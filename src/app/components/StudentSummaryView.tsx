import { useState, useEffect } from 'react';
import { Student, Observation } from '../lib/types';
import { formatStudentName } from '../lib/utils';
import { deleteStudent, getObservationsByStudent } from '../lib/storage';
import { auth } from '../../firebase';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Calculator, Beaker, BookText, BookOpen, TrendingUp, Award, Tag, Clock, FileText, Trash2, Loader2, Download } from 'lucide-react';
import { LaurelLogo } from './LaurelLogo';
import { toast } from 'sonner';
import { format, isSameMonth } from 'date-fns';
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
  onExportData: () => void;
}

// Demo/anonymous accounts show fixed sample numbers since there's no real
// data behind them. Real accounts compute everything below from the
// student's actual observations - see loadObservations/subjectGroups.
const DEMO_SUBJECTS = [
  {
    name: 'Mathematics',
    icon: Calculator,
    score: 78,
    strengths: ['Problem Solving', 'Algebraic Thinking'],
    growth: ['Multi-step word problems']
  },
  {
    name: 'Science',
    icon: Beaker,
    score: 85,
    strengths: ['Scientific Inquiry', 'Critical Thinking'],
    growth: ['Hypothesis formation']
  },
  {
    name: 'Language Arts',
    icon: BookText,
    score: 72,
    strengths: ['Reading Comprehension', 'Creative Writing'],
    growth: ['Grammar & Mechanics', 'Presentations']
  },
];

const SUBJECT_ICONS: Record<string, typeof Calculator> = {
  Mathematics: Calculator,
  Science: Beaker,
  'Language Arts': BookText,
};

export function StudentSummaryView({ student, onBack, onGenerateReport, onViewObservations, onExportData }: StudentSummaryViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([]);
  const isDemo = auth.currentUser?.isAnonymous ?? false;

  useEffect(() => {
    if (isDemo) return;
    getObservationsByStudent(student.id).then(setObservations);
  }, [student.id, isDemo]);

  const handleDeleteStudent = async () => {
    if (!confirm(`Permanently delete ${formatStudentName(student.name)} and all of their observations and evaluations? This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      await deleteStudent(student.id);
      toast.success(`${formatStudentName(student.name)} has been deleted.`);
      onBack();
    } catch {
      toast.error('Could not delete this student. Please try again.');
      setDeleting(false);
    }
  };

  // Real data derived from this student's actual observations.
  const sortedObservations = [...observations].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const subjectGroups = (() => {
    const map = new Map<string, Observation[]>();
    for (const obs of observations) {
      const key = obs.subject || 'General';
      map.set(key, [...(map.get(key) ?? []), obs]);
    }
    return Array.from(map.entries()).map(([subject, subjectObservations]) => ({
      subject,
      icon: SUBJECT_ICONS[subject] ?? BookOpen,
      observations: subjectObservations,
    }));
  })();
  const thisMonthCount = observations.filter(o => isSameMonth(new Date(o.timestamp), new Date())).length;
  const topTags = (() => {
    const counts = new Map<string, number>();
    for (const obs of observations) {
      for (const tag of obs.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();
  const mostRecent = sortedObservations[0];

  const selectedDemoSubject = DEMO_SUBJECTS.find(s => s.name === selectedSubject);
  const selectedRealGroup = subjectGroups.find(g => g.subject === selectedSubject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5FC] to-[#EBE8F5] flex flex-col">
      <div className="bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] text-white p-4 pb-6">
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
            <div className="text-2xl font-bold">{isDemo ? 35 : observations.length}</div>
            <div className="text-xs text-white/80">Observations</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold">{isDemo ? 3 : subjectGroups.length}</div>
            <div className="text-xs text-white/80">Subjects</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <TrendingUp className="w-5 h-5" />
              {isDemo ? 4 : thisMonthCount}
            </div>
            <div className="text-xs text-white/80">This Month</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 pb-44">
        <Button
          onClick={onGenerateReport}
          className="w-full h-12 bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] hover:from-[#1A1A40]/90 hover:to-[#6B5FE4]/90 text-white font-semibold mb-4"
        >
          Generate Report Card Commentary
        </Button>

        <h2 className="text-sm font-semibold text-gray-600 uppercase">Subject Performance</h2>

        {isDemo ? (
          <div className="grid grid-cols-3 gap-2">
            {DEMO_SUBJECTS.map((subject) => {
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
        ) : subjectGroups.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-gray-500">
              No observations recorded yet for {formatStudentName(student.name)}.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {subjectGroups.map((group) => {
              const SubjectIcon = group.icon;
              return (
                <button
                  key={group.subject}
                  onClick={() => setSelectedSubject(group.subject)}
                  className="bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-all active:scale-95 text-center border-2 border-transparent hover:border-[#6B5FE4]"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center mb-1">
                      <SubjectIcon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold mb-1 text-gray-900">{group.subject}</p>
                    <div className="text-xl font-bold text-[#6B5FE4]">{group.observations.length}</div>
                    <p className="text-[10px] text-gray-500">observation{group.observations.length === 1 ? '' : 's'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-sm">{isDemo ? 'Top Strengths' : 'Most Common Tags'}</h3>
              </div>
              {isDemo ? (
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• Collaboration</li>
                  <li>• Problem-solving</li>
                  <li>• Participation</li>
                </ul>
              ) : topTags.length === 0 ? (
                <p className="text-xs text-gray-500">No tags recorded yet.</p>
              ) : (
                <ul className="text-xs space-y-1 text-gray-700">
                  {topTags.map(([tag, count]) => (
                    <li key={tag} className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-gray-400 shrink-0" />
                      {tag} ({count})
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-sm">{isDemo ? 'Focus Areas' : 'Recent Activity'}</h3>
              </div>
              {isDemo ? (
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• Time management</li>
                  <li>• Presentations</li>
                </ul>
              ) : !mostRecent ? (
                <p className="text-xs text-gray-500">No activity yet.</p>
              ) : (
                <div className="text-xs text-gray-700 space-y-1">
                  <p className="text-gray-500">{format(new Date(mostRecent.timestamp), 'MMM d, yyyy')}</p>
                  <p>{mostRecent.subject || 'General'}: {mostRecent.content}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t space-y-2">
        <Button
          onClick={onViewObservations}

          className="w-full h-12 border-2 border-[#6B5FE4] hover:bg-[#EBE8F5] font-semibold gap-2"
        >
          <FileText className="w-5 h-5" />
          View All Observations
        </Button>
        {!isDemo && (
          <Button
            onClick={onExportData}
            className="w-full h-9 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Export Student Data
          </Button>
        )}
        <Button
          onClick={handleDeleteStudent}
          disabled={deleting}
          className="w-full h-9 text-red-600 hover:bg-red-50 font-medium gap-2 text-sm"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Student
        </Button>
      </div>

      {/* Subject Detail Dialog - demo */}
      {isDemo && selectedDemoSubject && (
        <Dialog open={!!selectedSubject} onOpenChange={() => setSelectedSubject(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center">
                  <selectedDemoSubject.icon className="w-6 h-6 text-white" />
                </div>
                <DialogTitle>{selectedDemoSubject.name}</DialogTitle>
              </div>
              <DialogDescription>
                Detailed performance breakdown and growth areas
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-[#6B5FE4]/10 to-[#7D9D77]/10 rounded-lg">
                <div className="text-4xl font-bold text-[#6B5FE4] mb-1">{selectedDemoSubject.score}%</div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <h3 className="font-semibold text-sm">Strengths</h3>
                </div>
                <ul className="text-sm space-y-1 text-gray-700">
                  {selectedDemoSubject.strengths.map(s => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-sm">Growth Areas</h3>
                </div>
                <ul className="text-sm space-y-1 text-gray-700">
                  {selectedDemoSubject.growth.map(g => (
                    <li key={g}>• {g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Subject Detail Dialog - real data */}
      {!isDemo && selectedRealGroup && (
        <Dialog open={!!selectedSubject} onOpenChange={() => setSelectedSubject(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center">
                  <selectedRealGroup.icon className="w-6 h-6 text-white" />
                </div>
                <DialogTitle>{selectedRealGroup.subject}</DialogTitle>
              </div>
              <DialogDescription>
                {selectedRealGroup.observations.length} observation{selectedRealGroup.observations.length === 1 ? '' : 's'} recorded
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...selectedRealGroup.observations]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 5)
                .map(obs => (
                  <div key={obs.id} className="bg-gray-50 border rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{format(new Date(obs.timestamp), 'MMM d, yyyy')}</p>
                    <p className="text-sm text-gray-800 mb-2">{obs.content}</p>
                    {obs.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {obs.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-white border rounded-full px-2 py-0.5 text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
