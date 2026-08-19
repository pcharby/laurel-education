import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Bug, Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';
import { submitBugReport } from '../lib/storage';
import { BugReport } from '../lib/types';

interface ReportProblemProps {
  onBack: () => void;
  /** Human-readable trail of the last few screens visited, e.g. "Add Observation -> Select Class -> Settings". */
  screenTrail: string;
}

const CATEGORY_LABELS: Record<BugReport['category'], string> = {
  bug: 'Something is broken',
  'feature-request': 'Feature request',
  other: 'Something else',
};

export function ReportProblem({ onBack, screenTrail }: ReportProblemProps) {
  const [category, setCategory] = useState<BugReport['category']>('bug');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (description.trim().length < 10) {
      setError('Please describe the problem in a bit more detail.');
      return;
    }

    setSubmitting(true);
    try {
      await submitBugReport({ category, description: description.trim(), screenTrail });
      setSubmitted(true);
    } catch {
      toast.error('Could not send your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: 'rgba(91, 155, 213, 0.08)' }}>
        <CheckCircle className="w-14 h-14 text-green-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Thanks - your report was sent</h2>
        <p className="text-sm text-gray-600 mb-6 max-w-sm">
          We've received your report and will look into it.
        </p>
        <Button onClick={onBack} className="bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] text-white font-semibold">
          Back to Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col" style={{ backgroundColor: 'rgba(91, 155, 213, 0.08)' }}>
      <div className="bg-white/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <LaurelLogo height="md" showProductName />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Report a Problem</h2>
        <p className="text-sm text-gray-600">Let us know about a bug or send us feedback</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="border-l-4 border-l-[#6B5FE4]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-[#6B5FE4]" />
              <CardTitle className="text-base">What's going on?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="text-base font-semibold">Category</Label>
              <RadioGroup value={category} onValueChange={(v) => setCategory(v as BugReport['category'])}>
                <div className="space-y-2">
                  {(Object.keys(CATEGORY_LABELS) as BugReport['category'][]).map((key) => (
                    <div
                      key={key}
                      className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:border-[#6B5FE4]/40 has-[:checked]:border-[#6B5FE4] has-[:checked]:bg-[#6B5FE4]/5"
                    >
                      <RadioGroupItem value={key} id={key} />
                      <Label htmlFor={key} className="cursor-pointer flex-1">
                        {CATEGORY_LABELS[key]}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What happened? What were you trying to do, and what did you expect instead?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-500 px-1">
          Your account email, name, and school, plus some basic technical details (browser, screen size, and the screens you were on) are included automatically to help us investigate.
        </p>
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-sm border-t">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-12 bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] hover:from-[#1A1A40]/90 hover:to-[#6B5FE4]/90 font-semibold gap-2"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Send Report
        </Button>
      </div>
    </div>
  );
}
