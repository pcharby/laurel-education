import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { ArrowLeft, Save, BookOpen, Calendar, Plus, Upload, FileText, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';

interface Expectation {
  id: string;
  text: string;
}

interface LessonPlan {
  id: string;
  title: string;
  description: string;
}

interface SubjectData {
  name: string;
  grade: string;
  expectations: Expectation[];
  lessonPlans: LessonPlan[];
}

interface CurriculumConfigProps {
  onBack: () => void;
  onCustomRubrics: () => void;
}

export function CurriculumConfig({ onBack, onCustomRubrics }: CurriculumConfigProps) {
  const [subjects, setSubjects] = useState<SubjectData[]>([
    {
      name: 'Mathematics', grade: '5',
      expectations: [
        { id: 'e1', text: 'Unit 3: Fractions & Decimals' },
        { id: 'e2', text: 'Unit 4: Data Management' },
      ],
      lessonPlans: [
        { id: 'lp1', title: 'Intro to Fractions', description: 'Hands-on fraction tiles activity' },
        { id: 'lp2', title: 'Decimal Place Value', description: 'Number line exploration' },
      ],
    },
    {
      name: 'Science', grade: '5',
      expectations: [
        { id: 'e3', text: 'Matter and Materials' },
        { id: 'e4', text: 'Energy and Control' },
      ],
      lessonPlans: [
        { id: 'lp3', title: 'States of Matter', description: 'Lab: observing phase changes' },
      ],
    },
    {
      name: 'Language Arts', grade: '5',
      expectations: [
        { id: 'e5', text: 'Reading Comprehension Strategies' },
        { id: 'e6', text: 'Narrative Writing' },
      ],
      lessonPlans: [
        { id: 'lp4', title: 'Story Structure', description: 'Analyzing plot arcs in short stories' },
      ],
    },
  ]);

  // Uploaded curriculum files
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Expectation dialog
  const [expectationDialog, setExpectationDialog] = useState<{ open: boolean; subjectName: string } | null>(null);
  const [newExpectation, setNewExpectation] = useState('');

  // Add Lesson Plan dialog
  const [lessonDialog, setLessonDialog] = useState<{ open: boolean; subjectName: string } | null>(null);
  const [newLesson, setNewLesson] = useState({ title: '', description: '' });

  // --- Upload Curriculum ---
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const names = files.map(f => f.name);
    setUploadedFiles(prev => [...prev, ...names]);
    toast.success(`${names.length} file${names.length !== 1 ? 's' : ''} uploaded: ${names.join(', ')}`);
    e.target.value = '';
  };

  const removeFile = (name: string) => setUploadedFiles(prev => prev.filter(f => f !== name));

  // --- Add Expectation ---
  const openExpectationDialog = (subjectName: string) => {
    setNewExpectation('');
    setExpectationDialog({ open: true, subjectName });
  };

  const saveExpectation = () => {
    const text = newExpectation.trim();
    if (!text || !expectationDialog) return;
    setSubjects(prev =>
      prev.map(s =>
        s.name === expectationDialog.subjectName
          ? { ...s, expectations: [...s.expectations, { id: `e-${Date.now()}`, text }] }
          : s
      )
    );
    setExpectationDialog(null);
    toast.success('Expectation added.');
  };

  const removeExpectation = (subjectName: string, id: string) => {
    setSubjects(prev =>
      prev.map(s =>
        s.name === subjectName
          ? { ...s, expectations: s.expectations.filter(e => e.id !== id) }
          : s
      )
    );
  };

  // --- Add Lesson Plan ---
  const openLessonDialog = (subjectName: string) => {
    setNewLesson({ title: '', description: '' });
    setLessonDialog({ open: true, subjectName });
  };

  const saveLesson = () => {
    const title = newLesson.title.trim();
    if (!title || !lessonDialog) return;
    setSubjects(prev =>
      prev.map(s =>
        s.name === lessonDialog.subjectName
          ? { ...s, lessonPlans: [...s.lessonPlans, { id: `lp-${Date.now()}`, title, description: newLesson.description.trim() }] }
          : s
      )
    );
    setLessonDialog(null);
    toast.success('Lesson plan added.');
  };

  const removeLessonPlan = (subjectName: string, id: string) => {
    setSubjects(prev =>
      prev.map(s =>
        s.name === subjectName
          ? { ...s, lessonPlans: s.lessonPlans.filter(lp => lp.id !== id) }
          : s
      )
    );
  };

  const handleSave = () => {
    toast.success('Curriculum updates saved successfully!');
    onBack();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-white/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <LaurelLogo height="md" showProductName />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <div className="text-xs text-gray-700">Riverside Elem.</div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Curriculum & Lesson Plans</h2>
        <p className="text-sm text-muted-foreground">Update curriculum expectations and lesson plans</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Upload Curriculum */}
        <Card className="border-l-4 border-l-[#6B5FE4]">
          <CardHeader>
            <CardTitle className="text-base">Upload Curriculum Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              type="button"
              onClick={handleUploadClick}
              className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-[#6B5FE4] transition-colors cursor-pointer"
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Upload Curriculum</p>
              <p className="text-xs text-muted-foreground">Click to browse — PDF, Word, or text files</p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              multiple
              onChange={handleFileChange}
            />

            {uploadedFiles.length > 0 && (
              <div className="space-y-1">
                {uploadedFiles.map(name => (
                  <div key={name} className="flex items-center justify-between rounded-md bg-accent/40 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#6B5FE4]" />
                      <span className="text-sm truncate max-w-[220px]">{name}</span>
                    </div>
                    <button type="button" onClick={() => removeFile(name)} className="text-muted-foreground hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={onCustomRubrics}
              variant="outline"
              className="w-full border-2 border-[#7D9D77] hover:bg-[#7D9D77]/10"
            >
              Configure Rubrics & Objectives
            </Button>
          </CardContent>
        </Card>

        {/* Per-subject cards */}
        {subjects.map((subject) => (
          <Card key={subject.name} className="border-l-4 border-l-[#7D9D77]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#7D9D77]" />
                <CardTitle className="text-base text-foreground">{subject.name} — Grade {subject.grade}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-accent/50 rounded-lg p-3 border border-border">
                  <div className="text-2xl font-bold text-[#6B5FE4]">{subject.expectations.length}</div>
                  <div className="text-xs text-muted-foreground">Curriculum Expectations</div>
                </div>
                <div className="bg-accent/50 rounded-lg p-3 border border-border">
                  <div className="text-2xl font-bold text-[#7D9D77]">{subject.lessonPlans.length}</div>
                  <div className="text-xs text-muted-foreground">Lesson Plans</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-2 bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white"
                  onClick={() => openExpectationDialog(subject.name)}
                >
                  <Plus className="w-4 h-4" />
                  Add Expectation
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-2 bg-[#6B5FE4] hover:bg-[#6B5FE4]/90 text-white"
                  onClick={() => openLessonDialog(subject.name)}
                >
                  <Calendar className="w-4 h-4" />
                  Add Lesson Plan
                </Button>
              </div>

              {/* Expectations list */}
              {subject.expectations.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Expectations</p>
                  <div className="flex flex-wrap gap-2">
                    {subject.expectations.map(exp => (
                      <div key={exp.id} className="flex items-center gap-1 bg-accent rounded-full px-3 py-1">
                        <span className="text-xs">{exp.text}</span>
                        <button
                          type="button"
                          onClick={() => removeExpectation(subject.name, exp.id)}
                          className="text-muted-foreground hover:text-red-500 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson plans list */}
              {subject.lessonPlans.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lesson Plans</p>
                  <div className="space-y-1">
                    {subject.lessonPlans.map(lp => (
                      <div key={lp.id} className="flex items-start justify-between rounded-md bg-accent/40 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">{lp.title}</p>
                          {lp.description && <p className="text-xs text-muted-foreground">{lp.description}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLessonPlan(subject.name, lp.id)}
                          className="text-muted-foreground hover:text-red-500 ml-2 mt-0.5 shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Card className="bg-accent/40 border-accent">
          <CardContent className="p-4">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> Curriculum expectations and lesson plans help Laurel Education align observations with your teaching goals. AI-generated evaluations will reference these when creating report card commentary.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-sm border-t">
        <Button
          onClick={handleSave}
          className="w-full h-12 bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] hover:from-[#1A1A40]/90 hover:to-[#6B5FE4]/90 font-semibold gap-2"
        >
          <Save className="w-5 h-5" />
          Save Curriculum Updates
        </Button>
      </div>

      {/* Add Expectation Dialog */}
      <Dialog
        open={!!expectationDialog?.open}
        onOpenChange={(open) => !open && setExpectationDialog(null)}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add Expectation — {expectationDialog?.subjectName}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label>Curriculum Expectation</Label>
            <Input
              placeholder="e.g. Unit 5: Geometry and Spatial Sense"
              value={newExpectation}
              onChange={(e) => setNewExpectation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveExpectation()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpectationDialog(null)}>Cancel</Button>
            <Button
              className="bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white gap-2"
              onClick={saveExpectation}
              disabled={!newExpectation.trim()}
            >
              <Check className="w-4 h-4" />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Plan Dialog */}
      <Dialog
        open={!!lessonDialog?.open}
        onOpenChange={(open) => !open && setLessonDialog(null)}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add Lesson Plan — {lessonDialog?.subjectName}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Introduction to Angles"
                value={newLesson.title}
                onChange={(e) => setNewLesson(l => ({ ...l, title: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                placeholder="Brief description of activities or objectives…"
                value={newLesson.description}
                onChange={(e) => setNewLesson(l => ({ ...l, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog(null)}>Cancel</Button>
            <Button
              className="bg-[#6B5FE4] hover:bg-[#6B5FE4]/90 text-white gap-2"
              onClick={saveLesson}
              disabled={!newLesson.title.trim()}
            >
              <Check className="w-4 h-4" />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
