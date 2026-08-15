import { useState, useEffect } from 'react';
import { Rubric, Strand, SchoolClass } from '../lib/types';
import { getClasses, getRubrics, addRubric, deleteRubric, getStrands, addStrand, deleteStrand } from '../lib/storage';
import { auth } from '../../firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';
import { useSchoolName } from '../lib/useSchoolName';

interface CustomRubricsConfigProps {
  onBack: () => void;
}

// Demo/anonymous accounts see a fixed sample set, same pattern as elsewhere
// in the app (ClassSelector's DEMO_CLASSES, StudentSummaryView's
// DEMO_SUBJECTS) - there's no real teacher data behind a demo session.
const DEMO_SUBJECTS = ['Mathematics', 'Science', 'Language Arts'];
const DEMO_RUBRICS: Record<string, string[]> = {
  Mathematics: ['Problem Solving', 'Number Sense', 'Algebraic Thinking', 'Data Management'],
  Science: ['Scientific Inquiry', 'Critical Thinking', 'Observation Skills'],
  'Language Arts': ['Reading Comprehension', 'Written Expression', 'Oral Communication'],
};
const DEMO_STRANDS: Record<string, string[]> = {
  Mathematics: ['Number', 'Algebra', 'Data', 'Spatial Sense'],
  Science: ['Life Systems', 'Structures and Mechanisms', 'Matter and Energy'],
  'Language Arts': ['Reading', 'Writing', 'Oral Communication'],
};

interface LabeledItem {
  id: string;
  label: string;
}

// Shared UI for both Rubrics and Strands below - same shape ({id, label}),
// same add/remove flow, only the copy and backing collection differ.
interface EditableLabelCardProps {
  title: string;
  addLabel: string;
  placeholder: string;
  countLabel: string;
  items: (LabeledItem | string)[];
  loading: boolean;
  newValue: string;
  onNewValueChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (item: LabeledItem | string) => void;
  adding: boolean;
}

function EditableLabelCard({
  title,
  addLabel,
  placeholder,
  countLabel,
  items,
  loading,
  newValue,
  onNewValueChange,
  onAdd,
  onRemove,
  adding,
}: EditableLabelCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{addLabel}</Label>
          <div className="flex gap-2">
            <Input
              value={newValue}
              onChange={(e) => onNewValueChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAdd()}
              placeholder={placeholder}
              className="flex-1"
              disabled={adding}
            />
            <Button onClick={onAdd} disabled={adding || !newValue.trim()} className="gap-2" style={{ backgroundColor: '#6B5FE4' }}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{countLabel} ({items.length})</Label>
          <div className="flex flex-wrap gap-2 min-h-[100px] border-2 rounded-lg p-3 bg-gray-50">
            {loading ? (
              <div className="w-full flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#6B5FE4]" />
              </div>
            ) : (
              items.map(item => {
                const label = typeof item === 'string' ? item : item.label;
                const key = typeof item === 'string' ? item : item.id;
                return (
                  <Badge key={key} className="gap-2 py-2 px-3 text-sm">
                    {label}
                    <button onClick={() => onRemove(item)} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomRubricsConfig({ onBack }: CustomRubricsConfigProps) {
  const { schoolName, badgeLetter } = useSchoolName();
  const isDemo = auth.currentUser?.isAnonymous ?? false;

  const [subjects, setSubjects] = useState<string[]>(isDemo ? DEMO_SUBJECTS : []);
  const [subjectsLoading, setSubjectsLoading] = useState(!isDemo);
  const [selectedSubject, setSelectedSubject] = useState<string>(isDemo ? DEMO_SUBJECTS[0] : '');

  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [rubricsLoading, setRubricsLoading] = useState(false);
  const [newRubric, setNewRubric] = useState('');
  const [addingRubric, setAddingRubric] = useState(false);

  const [strands, setStrands] = useState<Strand[]>([]);
  const [strandsLoading, setStrandsLoading] = useState(false);
  const [newStrand, setNewStrand] = useState('');
  const [addingStrand, setAddingStrand] = useState(false);

  useEffect(() => {
    if (isDemo) return;
    getClasses().then((classes: SchoolClass[]) => {
      const distinct = Array.from(new Set(classes.filter(c => !c.archived).map(c => c.subject)));
      setSubjects(distinct);
      if (distinct.length > 0) setSelectedSubject(distinct[0]);
      setSubjectsLoading(false);
    });
  }, [isDemo]);

  const loadRubrics = () => {
    if (isDemo || !selectedSubject) return;
    setRubricsLoading(true);
    getRubrics(selectedSubject).then(result => {
      setRubrics(result);
      setRubricsLoading(false);
    });
  };

  const loadStrands = () => {
    if (isDemo || !selectedSubject) return;
    setStrandsLoading(true);
    getStrands(selectedSubject).then(result => {
      setStrands(result);
      setStrandsLoading(false);
    });
  };

  useEffect(() => {
    loadRubrics();
    loadStrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, isDemo]);

  const handleAddRubric = async () => {
    const label = newRubric.trim();
    if (!label || !selectedSubject) return;

    if (isDemo) {
      DEMO_RUBRICS[selectedSubject] = [...(DEMO_RUBRICS[selectedSubject] ?? []), label];
      setNewRubric('');
      return;
    }

    setAddingRubric(true);
    try {
      await addRubric(selectedSubject, label);
      setNewRubric('');
      loadRubrics();
    } catch {
      toast.error('Could not add this rubric. Please try again.');
    } finally {
      setAddingRubric(false);
    }
  };

  const handleRemoveRubric = async (rubric: LabeledItem | string) => {
    if (isDemo && typeof rubric === 'string') {
      DEMO_RUBRICS[selectedSubject] = (DEMO_RUBRICS[selectedSubject] ?? []).filter(r => r !== rubric);
      setSubjects([...subjects]); // force re-render
      return;
    }
    if (typeof rubric === 'string') return;
    try {
      await deleteRubric(rubric.id);
      loadRubrics();
    } catch {
      toast.error('Could not remove this rubric. Please try again.');
    }
  };

  const handleAddStrand = async () => {
    const label = newStrand.trim();
    if (!label || !selectedSubject) return;

    if (isDemo) {
      DEMO_STRANDS[selectedSubject] = [...(DEMO_STRANDS[selectedSubject] ?? []), label];
      setNewStrand('');
      return;
    }

    setAddingStrand(true);
    try {
      await addStrand(selectedSubject, label);
      setNewStrand('');
      loadStrands();
    } catch {
      toast.error('Could not add this strand. Please try again.');
    } finally {
      setAddingStrand(false);
    }
  };

  const handleRemoveStrand = async (strand: LabeledItem | string) => {
    if (isDemo && typeof strand === 'string') {
      DEMO_STRANDS[selectedSubject] = (DEMO_STRANDS[selectedSubject] ?? []).filter(s => s !== strand);
      setSubjects([...subjects]); // force re-render
      return;
    }
    if (typeof strand === 'string') return;
    try {
      await deleteStrand(strand.id);
      loadStrands();
    } catch {
      toast.error('Could not remove this strand. Please try again.');
    }
  };

  const displayRubrics: (Rubric | string)[] = isDemo
    ? (DEMO_RUBRICS[selectedSubject] ?? [])
    : rubrics;
  const displayStrands: (Strand | string)[] = isDemo
    ? (DEMO_STRANDS[selectedSubject] ?? [])
    : strands;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col" style={{ backgroundColor: 'rgba(91, 155, 213, 0.08)' }}>
      <div className="bg-white/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button  size="sm" onClick={onBack} className="hover:bg-white/40">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <LaurelLogo height="md" showProductName />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center text-white font-bold text-xs">
              {badgeLetter}
            </div>
            <div className="text-xs text-gray-700">{schoolName}</div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Custom Rubrics &amp; Strands</h2>
        <p className="text-sm text-gray-600">Manage assessment criteria and curriculum strands for each subject you teach</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {subjectsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#6B5FE4]" />
          </div>
        ) : subjects.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Add a class in Classes & Subjects first - rubrics and strands are organized by the subjects you teach.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {subjects.map(subject => (
                <Button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={selectedSubject === subject ? 'bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4]' : ''}
                >
                  {subject}
                </Button>
              ))}
            </div>

            <EditableLabelCard
              title={`${selectedSubject} Curriculum Strands`}
              addLabel="Add New Strand"
              placeholder="e.g., Number Sense"
              countLabel="Current Strands"
              items={displayStrands}
              loading={strandsLoading}
              newValue={newStrand}
              onNewValueChange={setNewStrand}
              onAdd={handleAddStrand}
              onRemove={handleRemoveStrand}
              adding={addingStrand}
            />

            <EditableLabelCard
              title={`${selectedSubject} Rubrics`}
              addLabel="Add New Rubric"
              placeholder="e.g., Creative Problem Solving"
              countLabel="Current Rubrics"
              items={displayRubrics}
              loading={rubricsLoading}
              newValue={newRubric}
              onNewValueChange={setNewRubric}
              onAdd={handleAddRubric}
              onRemove={handleRemoveRubric}
              adding={addingRubric}
            />
          </>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> Align your curriculum strands and rubrics with your curriculum expectations and lesson plans. These will be available when recording observations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
