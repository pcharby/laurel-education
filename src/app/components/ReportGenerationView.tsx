import { useState, useEffect } from 'react';
import { Student, Observation } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Copy, CheckCircle, Loader2, TrendingUp, BarChart, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';
import { formatStudentName } from '../lib/utils';
import { getObservationsByStudent, saveEvaluation } from '../lib/storage';
import { generateMockEvaluation } from '../lib/mock-ai';
import { generateEvaluation as generateAIEvaluation } from '../lib/ai';
import { auth } from '../../firebase';
import { useSchoolName } from '../lib/useSchoolName';

interface ReportGenerationViewProps {
  student: Student;
  onBack: () => void;
}

interface SubjectReport {
  subject: string;
  observationCount: number;
  commentary: string;
}

export function ReportGenerationView({ student, onBack }: ReportGenerationViewProps) {
  const { schoolName, badgeLetter } = useSchoolName();
  const [isGenerating, setIsGenerating] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [reports, setReports] = useState<SubjectReport[]>([]);
  const [totalObservations, setTotalObservations] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    generateReports();
  }, [student.id]);

  const generateReports = async () => {
    setIsGenerating(true);
    setError('');
    setReports([]);

    try {
      const observations = await getObservationsByStudent(student.id);
      setTotalObservations(observations.length);

      const bySubject = new Map<string, Observation[]>();
      for (const obs of observations) {
        const key = obs.subject || 'General';
        bySubject.set(key, [...(bySubject.get(key) ?? []), obs]);
      }

      const isDemo = auth.currentUser?.isAnonymous ?? false;
      const generate = isDemo ? generateMockEvaluation : generateAIEvaluation;

      const results = await Promise.all(
        Array.from(bySubject.entries()).map(async ([subject, subjectObservations]) => {
          const result = await generate(subjectObservations, student.name);

          // Demo accounts have no real data to attach this to; real accounts
          // get a persisted record so it shows up in the student's data
          // export (PIPEDA access-request history), not just on-screen.
          if (!isDemo) {
            await saveEvaluation({
              id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              studentId: student.id,
              generatedText: result.summary,
              strengths: result.strengths,
              areasForImprovement: result.areasForImprovement,
              date: new Date().toISOString(),
            });
          }

          return {
            subject,
            observationCount: subjectObservations.length,
            commentary: result.summary,
          };
        })
      );

      setReports(results);
    } catch {
      setError('Could not generate the report right now. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (subject: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(subject);
    toast.success(`${subject} commentary copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <LaurelLogo height="md"  className="mb-6" />
        <Loader2 className="w-12 h-12 animate-spin text-[#6B5FE4] mb-4" />
        <p className="text-lg text-gray-700">Generating Report Card Commentary...</p>
        <p className="text-sm text-gray-500 mt-2">Analyzing observations across all subjects</p>
      </div>
    );
  }

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
        <h1 className="text-xl font-semibold mb-1">Report Card Commentary</h1>
        <p className="text-white/90">{formatStudentName(student.name)} - Grade {student.grade}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <Button size="sm" onClick={generateReports} className="gap-2 shrink-0">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">
                No observations recorded yet for {formatStudentName(student.name)}. Add observations to generate report card commentary.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-l-4 border-l-[#6B5FE4]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart className="w-5 h-5 text-[#6B5FE4]" />
                  <h3 className="font-semibold">Overview</h3>
                </div>
                <div className="grid gap-3 text-center" style={{ gridTemplateColumns: `repeat(${reports.length}, minmax(0, 1fr))` }}>
                  {reports.map((r) => (
                    <div key={r.subject} className="space-y-1">
                      <p className="text-xs text-gray-600">{r.subject}</p>
                      <div className="text-2xl font-bold text-[#6B5FE4]">{r.observationCount}</div>
                      <p className="text-xs text-gray-500">observation{r.observationCount === 1 ? '' : 's'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {reports.map((report) => (
              <Card key={report.subject} className="border-l-4 border-l-[#7D9D77]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-2 text-gray-900">{report.subject}</CardTitle>
                      <Badge  className="text-xs">
                        {report.observationCount} observation{report.observationCount === 1 ? '' : 's'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">
                    {report.commentary}
                  </div>
                  <Button
                    onClick={() => handleCopy(report.subject, report.commentary)}

                    size="sm"
                    className="w-full gap-2"
                  >
                    {copied === report.subject ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Commentary
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-gradient-to-br from-[#6B5FE4]/10 to-[#7D9D77]/10 border-2 border-[#D4D0EE]">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-[#6B5FE4] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">Next Steps</h3>
                    <p className="text-sm text-gray-700">
                      This commentary is generated from {totalObservations} recorded observation{totalObservations === 1 ? '' : 's'}.
                      Review and customize before final submission to report card software.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
