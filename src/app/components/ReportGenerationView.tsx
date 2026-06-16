import { useState, useEffect } from 'react';
import { Student } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Copy, CheckCircle, Loader2, TrendingUp, BarChart } from 'lucide-react';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { CadentLogo } from './CadentLogo';
import { formatStudentName } from '../lib/utils';

interface ReportGenerationViewProps {
  student: Student;
  onBack: () => void;
}

export function ReportGenerationView({ student, onBack }: ReportGenerationViewProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsGenerating(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const subjects = [
    {
      name: 'Mathematics',
      grade: 'B+',
      score: 78,
      commentary: `${formatStudentName(student.name)} demonstrates strong mathematical reasoning and problem-solving abilities. Shows consistent engagement with complex concepts and actively participates in class discussions. Excels in collaborative learning activities and demonstrates a solid understanding of grade-level curriculum expectations. Recommended area for growth: continue building confidence with multi-step word problems.`,
      curriculum: ['Number Sense', 'Algebraic Thinking', 'Problem Solving'],
    },
    {
      name: 'Science',
      grade: 'A-',
      score: 85,
      commentary: `${formatStudentName(student.name)} exhibits exceptional curiosity and scientific inquiry skills. Consistently asks thoughtful questions and demonstrates strong understanding of scientific concepts through hands-on experiments. Shows excellent ability to make connections between classroom learning and real-world applications. Continue encouraging independent investigation and hypothesis formation.`,
      curriculum: ['Scientific Inquiry', 'Life Systems', 'Critical Thinking'],
    },
    {
      name: 'Language Arts',
      grade: 'B',
      score: 72,
      commentary: `${formatStudentName(student.name)} shows steady progress in reading comprehension and written expression. Demonstrates creativity in written assignments and thoughtful analysis of texts. Active participant in literature discussions with peers. Growth opportunity: continue developing organizational strategies for longer writing assignments and building confidence in public presentations.`,
      curriculum: ['Reading Comprehension', 'Written Communication', 'Oral Communication'],
    },
  ];

  const handleCopy = (subject: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(subject);
    toast.success(`${subject} commentary copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <CadentLogo height="md"  className="mb-6" />
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
            <CadentLogo height="sm" inverted={true} showProductName />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <div className="text-xs text-white/80">Riverside Elem.</div>
          </div>
        </div>
        <h1 className="text-xl font-semibold mb-1">Report Card Commentary</h1>
        <p className="text-white/90">{formatStudentName(student.name)} - Grade {student.grade}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="border-l-4 border-l-[#6B5FE4]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart className="w-5 h-5 text-[#6B5FE4]" />
              <h3 className="font-semibold">Overall Performance Summary</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {subjects.map((s) => (
                <div key={s.name} className="space-y-1">
                  <p className="text-xs text-gray-600">{s.name}</p>
                  <div className="text-2xl font-bold text-[#6B5FE4]">{s.grade}</div>
                  <Progress value={s.score} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {subjects.map((subject) => (
          <Card key={subject.name} className="border-l-4 border-l-[#7D9D77]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base mb-2 text-gray-900">{subject.name}</CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {subject.curriculum.map((item) => (
                      <Badge key={item}  className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#7D9D77]">{subject.grade}</div>
                  <div className="text-xs text-gray-500">{subject.score}%</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">
                {subject.commentary}
              </div>
              <Button
                onClick={() => handleCopy(subject.name, subject.commentary)}
                
                size="sm"
                className="w-full gap-2"
              >
                {copied === subject.name ? (
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
                  These AI-generated commentaries align with curriculum expectations.
                  Review and customize before final submission to report card software.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
