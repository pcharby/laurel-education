import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { StudentListDialog } from './StudentListDialog';
import { ArrowLeft, Users, Award, Tag, Clock, Loader2 } from 'lucide-react';
import { LaurelLogo } from './LaurelLogo';
import { formatStudentName } from '../lib/utils';
import { SchoolClass, Student, Observation } from '../lib/types';
import { getStudents, getObservations } from '../lib/storage';
import { auth } from '../../firebase';
import { useSchoolName } from '../lib/useSchoolName';
import { format, isSameMonth } from 'date-fns';

interface ClassInsightsDashboardProps {
  onBack: () => void;
  classInfo: SchoolClass;
}

// Demo/anonymous accounts see a fixed sample snapshot, same pattern used
// throughout the app (ClassSelector's DEMO_CLASSES, StudentSummaryView's
// DEMO_SUBJECTS) - there's no real data behind a demo session to compute
// from.
const DEMO_STATS = {
  totalObservations: 35,
  thisMonth: 12,
  documented: 8,
  totalStudents: 10,
  leastDocumented: [
    { name: 'Noah Patel', count: 1 },
    { name: 'Mason Davis', count: 2 },
    { name: 'James Wilson', count: 2 },
  ],
  topTags: [
    ['participation', 4], ['problem-solving', 3], ['collaboration', 3], ['reading-comprehension', 2],
  ] as [string, number][],
  recent: { subject: 'Mathematics', content: 'Solved multi-step fraction problems independently.', timestamp: new Date().toISOString() },
};

export function ClassInsightsDashboard({ onBack, classInfo }: ClassInsightsDashboardProps) {
  const { schoolName, badgeLetter } = useSchoolName();
  const isDemo = auth.currentUser?.isAnonymous ?? false;

  const [students, setStudents] = useState<Student[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(!isDemo);
  const [showLeastDocumented, setShowLeastDocumented] = useState(false);

  useEffect(() => {
    if (isDemo) return;
    Promise.all([getStudents(), getObservations()]).then(([allStudents, allObservations]) => {
      setStudents(allStudents.filter(s => s.grade === classInfo.grade));
      setObservations(allObservations);
      setLoading(false);
    });
  }, [isDemo, classInfo.grade]);

  const classStudents = isDemo ? [] : students;
  const classObservations = isDemo
    ? []
    : observations.filter(o => o.subject === classInfo.subject && classStudents.some(s => s.id === o.studentId));

  const totalObservations = isDemo ? DEMO_STATS.totalObservations : classObservations.length;
  const thisMonth = isDemo ? DEMO_STATS.thisMonth : classObservations.filter(o => isSameMonth(new Date(o.timestamp), new Date())).length;

  const countsByStudent = new Map<string, number>();
  for (const s of classStudents) countsByStudent.set(s.id, 0);
  for (const o of classObservations) countsByStudent.set(o.studentId, (countsByStudent.get(o.studentId) ?? 0) + 1);
  const documented = Array.from(countsByStudent.values()).filter(c => c > 0).length;

  const leastDocumented = isDemo
    ? DEMO_STATS.leastDocumented
    : classStudents
        .map(s => ({ name: s.name, count: countsByStudent.get(s.id) ?? 0 }))
        .sort((a, b) => a.count - b.count)
        .slice(0, 5);

  const topTags = isDemo
    ? DEMO_STATS.topTags
    : (() => {
        const counts = new Map<string, number>();
        for (const o of classObservations) for (const tag of o.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
        return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
      })();

  const sortedObservations = isDemo ? [] : [...classObservations].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const mostRecent = isDemo ? DEMO_STATS.recent : sortedObservations[0];

  return (
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
              {badgeLetter}
            </div>
            <div className="text-xs text-white/80">{schoolName}</div>
          </div>
        </div>
        <h1 className="text-xl font-semibold mb-1">Class Insights</h1>
        <p className="text-white/90">{classInfo.subject} - Grade {classInfo.grade}{classInfo.name ? ` (${classInfo.name})` : ''}</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#6B5FE4]" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Key stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-l-4 border-l-[#6B5FE4]">
              <CardContent className="p-3">
                <div className="text-xl font-bold text-[#6B5FE4]">{totalObservations}</div>
                <div className="text-xs text-gray-600">Observations</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#7D9D77]">
              <CardContent className="p-3">
                <div className="text-xl font-bold text-[#7D9D77]">{thisMonth}</div>
                <div className="text-xs text-gray-600">This Month</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#4B5E7A]">
              <CardContent className="p-3">
                <div className="text-xl font-bold text-[#4B5E7A]">
                  {isDemo ? DEMO_STATS.documented : documented}/{isDemo ? DEMO_STATS.totalStudents : classStudents.length}
                </div>
                <div className="text-xs text-gray-600">Documented</div>
              </CardContent>
            </Card>
          </div>

          {/* Least documented */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-[#6B5FE4]" />
                Least Documented Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leastDocumented.length === 0 ? (
                <p className="text-sm text-gray-500">No students in this grade yet.</p>
              ) : (
                <button
                  onClick={() => setShowLeastDocumented(true)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-left"
                >
                  <span className="text-sm text-gray-700">
                    {leastDocumented.slice(0, 3).map(s => formatStudentName(s.name)).join(', ')}
                    {leastDocumented.length > 3 ? `, +${leastDocumented.length - 3} more` : ''}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">View all</span>
                </button>
              )}
            </CardContent>
          </Card>

          {/* Most common tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-[#6B5FE4]" />
                Most Common Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topTags.length === 0 ? (
                <p className="text-sm text-gray-500">No tags recorded yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topTags.map(([tag, count]) => (
                    <span key={tag} className="flex items-center gap-1 text-xs bg-[#EBE8F5] text-[#1A1A40] border border-[#D4D0EE] rounded-full px-3 py-1">
                      <Tag className="w-3 h-3" />
                      {tag} ({count})
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#6B5FE4]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!mostRecent ? (
                <p className="text-sm text-gray-500">No activity yet.</p>
              ) : (
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="text-xs text-gray-500">{format(new Date(mostRecent.timestamp), 'MMM d, yyyy')}</p>
                  <p>{mostRecent.subject || 'General'}: {mostRecent.content}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <StudentListDialog
        open={showLeastDocumented}
        onClose={() => setShowLeastDocumented(false)}
        title="Least Documented Students"
        description="Students with the fewest observations recorded for this subject this term."
        students={leastDocumented}
        countLabel="observations"
      />
    </div>
  );
}
