import { useState, useEffect } from 'react';
import { Student, Evaluation } from '../lib/types';
import { formatStudentName } from '../lib/utils';
import { getObservationsByStudent } from '../lib/storage';
import { generateMockEvaluation } from '../lib/mock-ai';
import { saveEvaluation } from '../lib/storage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Sparkles, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EvaluationDialogProps {
  open: boolean;
  onClose: () => void;
  student: Student;
}

export function EvaluationDialog({ open, onClose, student }: EvaluationDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      generateEvaluation();
    }
  }, [open, student.id]);

  const generateEvaluation = async () => {
    setIsGenerating(true);
    setEvaluation(null);

    const observations = getObservationsByStudent(student.id);
    const result = await generateMockEvaluation(observations, student.name);

    setEvaluation(result);
    setIsGenerating(false);

    // Save to storage
    const newEvaluation: Evaluation = {
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId: student.id,
      generatedText: result.summary,
      strengths: result.strengths,
      areasForImprovement: result.areasForImprovement,
      date: new Date().toISOString(),
    };
    saveEvaluation(newEvaluation);
  };

  const handleCopy = () => {
    if (!evaluation) return;

    const text = `
STUDENT EVALUATION: ${formatStudentName(student.name)} (Grade ${student.grade})
Generated: ${new Date().toLocaleDateString()}

SUMMARY
${evaluation.summary}

STRENGTHS
${evaluation.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

AREAS FOR IMPROVEMENT
${evaluation.areasForImprovement.map((a, i) => `${i + 1}. ${a}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Evaluation copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI-Generated Evaluation
          </DialogTitle>
          <DialogDescription>
            Evaluation for {formatStudentName(student.name)} (Grade {student.grade})
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600">Analyzing observations and generating evaluation...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
          </div>
        ) : evaluation ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed">{evaluation.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {evaluation.strengths.map((strength, index) => (
                    <li key={index} className="flex gap-2">
                      <Badge  className="shrink-0">
                        {index + 1}
                      </Badge>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {evaluation.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex gap-2">
                      <Badge  className="shrink-0">
                        {index + 1}
                      </Badge>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is an AI-generated evaluation based on recorded
                observations. Please review and adjust as needed to ensure accuracy and
                alignment with curriculum standards.
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2">
          <Button  onClick={onClose}>
            Close
          </Button>
          {evaluation && (
            <>
              <Button  onClick={generateEvaluation}>
                Regenerate
              </Button>
              <Button onClick={handleCopy} className="gap-2">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
