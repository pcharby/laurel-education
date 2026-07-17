import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CadentLogo } from './CadentLogo';
import { generateWorksheet, GeneratedWorksheet, WorksheetQuestion } from '../lib/mock-worksheet';
import { formatStudentName } from '../lib/utils';
import {
  ArrowLeft,
  Sparkles,
  Printer,
  Mail,
  BookOpen,
  AlertCircle,
  Loader2,
  CheckCircle,
  Share2,
  ExternalLink,
  ChevronRight,
  FileText,
  Clock,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LearningObjective {
  name: string;
  mastery: number;
  atRisk: number;
  atRiskStudents: { name: string; score: number }[];
}

interface WorksheetGeneratorViewProps {
  onBack: () => void;
  classInfo: { name: string; subject: string };
  learningObjectives: LearningObjective[];
  grade: string;
}

type SubView = 'list' | 'preview';

// ─── Answer lines ────────────────────────────────────────────────────────────
function AnswerLines({ count }: { count: number }) {
  return (
    <div className="mt-3 space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-full border-b-2 border-gray-300" style={{ height: 36 }} />
      ))}
    </div>
  );
}

// ─── On-screen question block ─────────────────────────────────────────────────
function QuestionBlock({ q, index }: { q: WorksheetQuestion; index: number }) {
  return (
    <div className="mb-7 pb-4 border-b border-gray-100 last:border-0">
      <p className="text-sm leading-relaxed text-gray-800 mb-3 whitespace-pre-line">
        <span className="font-bold text-gray-900">{index + 1}.&nbsp;</span>
        {q.prompt}
      </p>

      {q.type === 'multiple-choice' && q.options && (
        <div className="space-y-2 ml-5 mb-2">
          {q.options.map((opt) => (
            <div key={opt} className="flex items-start gap-3 text-sm text-gray-700">
              <div className="w-5 h-5 rounded-full border-2 border-gray-400 shrink-0 mt-0.5" />
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}

      {q.lines && q.type !== 'multiple-choice' && <AnswerLines count={q.lines} />}
      {q.type === 'multiple-choice' && (
        <div className="ml-5 mt-2">
          <div className="text-xs text-gray-400 italic">Circle your answer above</div>
        </div>
      )}
    </div>
  );
}

// ─── On-screen worksheet preview ─────────────────────────────────────────────
function WorksheetPreview({
  worksheet,
  classInfo,
}: {
  worksheet: GeneratedWorksheet;
  classInfo: { name: string; subject: string };
}) {
  const today = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white p-8 max-w-[760px] mx-auto text-gray-900">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{worksheet.title}</h1>
          <p className="text-sm text-gray-600">
            {worksheet.subject} &nbsp;·&nbsp; Grade {worksheet.grade} &nbsp;·&nbsp; {classInfo.name}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500 shrink-0 ml-6 mt-1">
          <div className="flex items-center gap-1 justify-end mb-1.5">
            <Clock className="w-3 h-3" />
            <span>{worksheet.estimatedTime}</span>
          </div>
          <p>Riverside Elementary</p>
        </div>
      </div>

      {/* Student info */}
      <div className="grid grid-cols-2 gap-6 mb-5 text-sm">
        <div>
          <span className="font-semibold">Name:&nbsp;</span>
          <span className="inline-block border-b-2 border-gray-400 w-56" />
        </div>
        <div>
          <span className="font-semibold">Date:&nbsp;</span>
          <span className="inline-block border-b-2 border-gray-400 w-36" />
        </div>
      </div>

      {/* Learning Goal */}
      <div className="bg-[#F0EEF8] border-l-4 border-[#6B5FE4] rounded-r-lg px-4 py-3 mb-6">
        <p className="text-xs font-bold text-[#6B5FE4] uppercase tracking-widest mb-1">Learning Goal</p>
        <p className="text-sm text-gray-800 leading-relaxed">{worksheet.learningGoal}</p>
      </div>

      {/* Sections */}
      {worksheet.sections.map((section) => (
        <div key={section.title} className="mb-8">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-sm mb-4">
            <h2 className="text-sm font-bold tracking-wide">{section.title}</h2>
            <p className="text-xs text-gray-300 mt-0.5">{section.instructions}</p>
          </div>
          {section.questions.map((q, i) => (
            <QuestionBlock key={i} q={q} index={i} />
          ))}
        </div>
      ))}

      {/* Challenge */}
      <div className="border-2 border-dashed border-[#7D9D77] rounded-xl p-5 mb-6">
        <p className="text-xs font-bold text-[#7D9D77] uppercase tracking-widest mb-2">
          ✦ Bonus Challenge
        </p>
        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed mb-1">
          {worksheet.challenge.prompt}
        </p>
        {worksheet.challenge.lines && <AnswerLines count={worksheet.challenge.lines} />}
      </div>

      {/* Reflection */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Reflection</p>
        <p className="text-sm text-gray-700 leading-relaxed">{worksheet.reflection}</p>
        <AnswerLines count={2} />
      </div>

      {/* Footer */}
      <div className="mt-8 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
        <span>Generated by Laurel Education · {today}</span>
        <span>Objective: {worksheet.objective}</span>
      </div>
    </div>
  );
}

// ─── Print HTML builder (self-contained, no Tailwind dependency) ──────────────
function buildPrintHTML(worksheet: GeneratedWorksheet, classInfo: { name: string; subject: string }): string {
  const today = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const answerLines = (count: number) =>
    Array.from({ length: count })
      .map(() => `<div class="answer-line"></div>`)
      .join('');

  const renderQuestion = (q: WorksheetQuestion, idx: number) => {
    const optionsHTML =
      q.type === 'multiple-choice' && q.options
        ? `<div class="options">
            ${q.options
              .map(
                (opt) => `
              <div class="option">
                <span class="option-circle"></span>
                <span>${opt}</span>
              </div>`
              )
              .join('')}
            <p class="circle-note">Circle your answer above.</p>
          </div>`
        : '';

    const linesHTML = q.lines && q.type !== 'multiple-choice'
      ? `<div class="answer-area">${answerLines(q.lines)}</div>`
      : '';

    const prompt = q.prompt.replace(/\n/g, '<br>');

    return `
      <div class="question">
        <p class="question-text"><strong>${idx + 1}.</strong> ${prompt}</p>
        ${optionsHTML}
        ${linesHTML}
      </div>`;
  };

  const sectionsHTML = worksheet.sections
    .map(
      (section) => `
    <div class="section">
      <div class="section-header">
        <span class="section-title">${section.title}</span>
        <span class="section-instructions">${section.instructions}</span>
      </div>
      ${section.questions.map((q, i) => renderQuestion(q, i)).join('')}
    </div>`
    )
    .join('');

  const challengeHTML = `
    <div class="challenge">
      <p class="challenge-label">✦ Bonus Challenge</p>
      <p class="question-text" style="white-space:pre-line">${worksheet.challenge.prompt}</p>
      ${worksheet.challenge.lines ? `<div class="answer-area">${answerLines(worksheet.challenge.lines)}</div>` : ''}
    </div>`;

  const reflectionHTML = `
    <div class="reflection">
      <p class="reflection-label">Reflection</p>
      <p class="question-text">${worksheet.reflection}</p>
      <div class="answer-area">${answerLines(2)}</div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${worksheet.title}</title>
  <style>
    /* ── Page setup ── */
    @page {
      size: letter;
      margin: 1in;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 13pt;
      color: #111;
      line-height: 1.5;
    }

    /* ── Header ── */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #111;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .doc-title {
      font-size: 17pt;
      font-weight: 700;
      margin-bottom: 3px;
    }
    .doc-meta {
      font-size: 10pt;
      color: #444;
    }
    .doc-school {
      text-align: right;
      font-size: 9.5pt;
      color: #555;
      flex-shrink: 0;
      margin-left: 20px;
    }

    /* ── Student info ── */
    .student-info {
      display: flex;
      gap: 32px;
      margin-bottom: 14px;
      font-size: 12pt;
    }
    .student-info .field {
      display: flex;
      align-items: flex-end;
      gap: 6px;
    }
    .field-line {
      display: inline-block;
      border-bottom: 1.5px solid #555;
      flex: 1;
      min-width: 160px;
    }
    .field-line-short {
      min-width: 110px;
    }

    /* ── Learning goal ── */
    .learning-goal {
      background: #f3f0fb;
      border-left: 4px solid #6b5fe4;
      padding: 10px 14px;
      margin-bottom: 18px;
      border-radius: 0 4px 4px 0;
    }
    .learning-goal .label {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b5fe4;
      margin-bottom: 4px;
    }
    .learning-goal p {
      font-size: 11.5pt;
      color: #222;
    }

    /* ── Sections ── */
    .section {
      margin-bottom: 22px;
    }
    .section-header {
      background: #222;
      color: #fff;
      padding: 7px 12px;
      margin-bottom: 14px;
      border-radius: 2px;
    }
    .section-title {
      font-size: 11pt;
      font-weight: 700;
      letter-spacing: 0.03em;
      display: block;
    }
    .section-instructions {
      font-size: 9.5pt;
      color: #ccc;
      display: block;
      margin-top: 2px;
    }

    /* ── Questions ── */
    .question {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e5e5;
      page-break-inside: avoid;
    }
    .question:last-child {
      border-bottom: none;
    }
    .question-text {
      font-size: 12pt;
      line-height: 1.6;
      margin-bottom: 10px;
      white-space: pre-line;
    }

    /* ── Multiple choice ── */
    .options {
      margin-left: 18px;
      margin-bottom: 6px;
    }
    .option {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 9px;
      font-size: 11.5pt;
    }
    .option-circle {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #666;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .circle-note {
      font-size: 9pt;
      color: #888;
      font-style: italic;
      margin-top: 2px;
    }

    /* ── Answer lines ── */
    .answer-area {
      margin-top: 8px;
      margin-left: 0;
    }
    .answer-line {
      width: 100%;
      height: 40px;
      border-bottom: 1.5px solid #aaa;
      margin-bottom: 6px;
    }

    /* ── Challenge ── */
    .challenge {
      border: 2px dashed #7d9d77;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .challenge-label {
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #7d9d77;
      margin-bottom: 8px;
    }

    /* ── Reflection ── */
    .reflection {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 14px;
      page-break-inside: avoid;
    }
    .reflection-label {
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #1d4ed8;
      margin-bottom: 6px;
    }

    /* ── Footer ── */
    .doc-footer {
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      color: #999;
    }
  </style>
</head>
<body>

  <div class="doc-header">
    <div>
      <div class="doc-title">${worksheet.title}</div>
      <div class="doc-meta">${worksheet.subject} &nbsp;·&nbsp; Grade ${worksheet.grade} &nbsp;·&nbsp; ${classInfo.name}</div>
    </div>
    <div class="doc-school">
      <div>Est. time: ${worksheet.estimatedTime}</div>
      <div>Riverside Elementary</div>
    </div>
  </div>

  <div class="student-info">
    <div class="field">
      <strong>Name:</strong>
      <span class="field-line"></span>
    </div>
    <div class="field">
      <strong>Date:</strong>
      <span class="field-line field-line-short"></span>
    </div>
  </div>

  <div class="learning-goal">
    <div class="label">Learning Goal</div>
    <p>${worksheet.learningGoal}</p>
  </div>

  ${sectionsHTML}

  ${challengeHTML}

  ${reflectionHTML}

  <div class="doc-footer">
    <span>Generated by Laurel Education &nbsp;·&nbsp; ${today}</span>
    <span>Objective: ${worksheet.objective}</span>
  </div>

</body>
</html>`;
}

// ─── Main component ───────────────────────────────────────────────────────────
export function WorksheetGeneratorView({
  onBack,
  classInfo,
  learningObjectives,
  grade,
}: WorksheetGeneratorViewProps) {
  const [subView, setSubView] = useState<SubView>('list');
  const [generating, setGenerating] = useState<string | null>(null);
  const [worksheets, setWorksheets] = useState<Record<string, GeneratedWorksheet>>({});
  const [activeWorksheet, setActiveWorksheet] = useState<GeneratedWorksheet | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  const atRiskObjectives = learningObjectives.filter((o) => o.atRisk > 0);

  const handleGenerate = async (obj: LearningObjective) => {
    if (worksheets[obj.name]) {
      setActiveWorksheet(worksheets[obj.name]);
      setSubView('preview');
      return;
    }
    setGenerating(obj.name);
    try {
      const ws = await generateWorksheet(classInfo.subject, obj.name, grade, obj.atRisk);
      setWorksheets((prev) => ({ ...prev, [obj.name]: ws }));
      setActiveWorksheet(ws);
      setSubView('preview');
    } finally {
      setGenerating(null);
    }
  };

  const handlePrint = () => {
    if (!activeWorksheet) return;
    const html = buildPrintHTML(activeWorksheet, classInfo);
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  const handleShare = () => {
    if (!shareEmail.trim()) { toast.error('Please enter an email address.'); return; }
    toast.success(`Worksheet sent to ${shareEmail}`);
    setShareDialogOpen(false);
    setShareEmail('');
  };

  const handleGoogleClassroom = () => {
    toast.info('Google Classroom integration coming soon! The worksheet will be uploaded and assigned automatically.', { duration: 4000 });
  };

  /* ── PREVIEW ── */
  if (subView === 'preview' && activeWorksheet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7F5FC] to-[#EBE8F5] flex flex-col">
        <div className="bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] text-white p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={() => setSubView('list')} className="text-white hover:bg-white/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <CadentLogo height="sm" inverted={true} showProductName />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xs">R</div>
              <div className="text-xs text-white/80">Riverside Elem.</div>
            </div>
          </div>
          <h1 className="text-lg font-semibold">Worksheet Preview</h1>
          <p className="text-white/80 text-sm">{activeWorksheet.objective} · {classInfo.subject}</p>
        </div>

        {/* Action bar */}
        <div className="bg-white border-b px-4 py-3 flex gap-2 overflow-x-auto shrink-0 shadow-sm">
          <Button onClick={handlePrint} className="gap-2 bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white shrink-0">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button onClick={() => setShareDialogOpen(true)} className="gap-2 border-2 border-[#6B5FE4] text-[#6B5FE4] hover:bg-[#EBE8F5] shrink-0 bg-white">
            <Mail className="w-4 h-4" /> Email / Share
          </Button>
          <Button onClick={handleGoogleClassroom} className="gap-2 border-2 border-[#7D9D77] text-[#7D9D77] hover:bg-[#7D9D77]/10 shrink-0 bg-white">
            <ExternalLink className="w-4 h-4" /> Google Classroom
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="shadow-xl rounded-lg overflow-hidden border border-gray-200">
            <WorksheetPreview worksheet={activeWorksheet} classInfo={classInfo} />
          </div>

          <Card className="mt-4 border-l-4 border-l-yellow-400">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Students Who Need This ({activeWorksheet.atRiskCount})
              </p>
              <p className="text-xs text-gray-600">
                This worksheet supports students struggling with <strong>{activeWorksheet.objective}</strong>.
                Assign as homework or use for targeted small-group work.
              </p>
            </CardContent>
          </Card>
        </div>

        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#6B5FE4]" /> Email / Share Worksheet
              </DialogTitle>
              <DialogDescription>
                Send this worksheet to a student, parent, or co-teacher.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="share-email">Email address</Label>
                <Input id="share-email" type="email" placeholder="student@school.edu" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} />
              </div>
              <div className="bg-[#F0EEF8] rounded-lg p-3 text-xs text-gray-600">
                <p className="font-semibold mb-1">Worksheet: {activeWorksheet.title}</p>
                <p>{classInfo.subject} · Grade {activeWorksheet.grade} · {activeWorksheet.objective}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShareDialogOpen(false)} className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Button>
                <Button onClick={handleShare} className="flex-1 bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] text-white gap-2">
                  <Mail className="w-4 h-4" /> Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  /* ── LIST ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5FC] to-[#EBE8F5] flex flex-col">
      <div className="bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CadentLogo height="sm" inverted={true} showProductName />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xs">R</div>
            <div className="text-xs text-white/80">Riverside Elem.</div>
          </div>
        </div>
        <h1 className="text-xl font-semibold mb-0.5">AI Support Worksheets</h1>
        <p className="text-white/80 text-sm">{classInfo.subject} · {classInfo.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="bg-gradient-to-br from-[#EBE8F5] to-[#F0EEF8] border-[#D4D0EE]">
          <CardContent className="p-4 flex gap-3">
            <Sparkles className="w-8 h-8 text-[#6B5FE4] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#1A1A40] mb-1">Curriculum-Aligned Worksheets</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Laurel Education generates a targeted 1-page assignment for each learning objective where students need support,
                aligned to Grade {grade} {classInfo.subject} curriculum expectations.
              </p>
            </div>
          </CardContent>
        </Card>

        {atRiskObjectives.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Target className="w-4 h-4 text-[#6B5FE4]" />
              Objectives Needing Support ({atRiskObjectives.length})
            </h2>

            {atRiskObjectives.map((obj) => {
              const isGenerating = generating === obj.name;
              const isDone = !!worksheets[obj.name];
              return (
                <Card key={obj.name} className="border-l-4 border-l-yellow-400 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-[#6B5FE4]" />
                      <h3 className="font-semibold text-gray-900 text-sm">{obj.name}</h3>
                      {isDone && (
                        <Badge className="bg-green-100 text-green-700 text-xs gap-1">
                          <CheckCircle className="w-3 h-3" /> Ready
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1 text-yellow-600">
                        <AlertCircle className="w-3 h-3" />
                        {obj.atRisk} student{obj.atRisk > 1 ? 's' : ''} need support
                      </span>
                      <span>Class mastery: {obj.mastery}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {obj.atRiskStudents.map((s) => (
                        <span key={s.name} className="text-xs bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-full px-2 py-0.5">
                          {formatStudentName(s.name)} · {s.score}%
                        </span>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleGenerate(obj)}
                      disabled={isGenerating}
                      className={`w-full gap-2 ${isDone
                        ? 'bg-[#7D9D77] hover:bg-[#7D9D77]/90 text-white'
                        : 'bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] hover:from-[#1A1A40]/90 hover:to-[#6B5FE4]/90 text-white'
                      }`}
                    >
                      {isGenerating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating worksheet…</>
                      ) : isDone ? (
                        <><BookOpen className="w-4 h-4" /> View Worksheet <ChevronRight className="w-4 h-4 ml-auto" /></>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Generate Worksheet <ChevronRight className="w-4 h-4 ml-auto" /></>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-green-800 mb-1">All objectives on track!</h3>
              <p className="text-sm text-green-700">No students are currently flagged as needing support for this subject.</p>
            </CardContent>
          </Card>
        )}

        {learningObjectives.filter((o) => o.atRisk === 0).length > 0 && (
          <Card className="bg-white/60">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">On Track</p>
              <div className="flex flex-wrap gap-2">
                {learningObjectives.filter((o) => o.atRisk === 0).map((o) => (
                  <Badge key={o.name} className="bg-green-100 text-green-700 gap-1">
                    <CheckCircle className="w-3 h-3" /> {o.name} · {o.mastery}%
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
