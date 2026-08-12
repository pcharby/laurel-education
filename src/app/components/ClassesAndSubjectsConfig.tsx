import { useState, useEffect } from 'react';
import { SchoolClass } from '../lib/types';
import { getClasses, saveClass, updateClass, deleteClass } from '../lib/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { ArrowLeft, Plus, X, BookOpen, Pencil, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';
import { useSchoolName } from '../lib/useSchoolName';

interface ClassesAndSubjectsConfigProps {
  onBack: () => void;
}

const emptyForm = { subject: '', grade: '', name: '', schedule: '' };

export function ClassesAndSubjectsConfig({ onBack }: ClassesAndSubjectsConfigProps) {
  const { schoolName, badgeLetter } = useSchoolName();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit class dialog - null means closed, {} means "adding new"
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadClasses = () => {
    getClasses().then(result => {
      setClasses(result);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setShowAddDialog(true);
  };

  const openEdit = (c: SchoolClass) => {
    setEditingClass(c);
    setForm({ subject: c.subject, grade: c.grade, name: c.name ?? '', schedule: c.schedule ?? '' });
  };

  const closeDialogs = () => {
    setShowAddDialog(false);
    setEditingClass(null);
  };

  const handleAdd = async () => {
    if (!form.subject.trim() || !form.grade.trim()) return;
    setSaving(true);
    try {
      await saveClass({
        subject: form.subject.trim(),
        grade: form.grade.trim(),
        name: form.name.trim() || undefined,
        schedule: form.schedule.trim() || undefined,
        createdAt: new Date().toISOString(),
      });
      toast.success('Class added.');
      closeDialogs();
      loadClasses();
    } catch {
      toast.error('Could not add the class. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingClass || !form.subject.trim() || !form.grade.trim()) return;
    setSaving(true);
    try {
      await updateClass(editingClass.id, {
        subject: form.subject.trim(),
        grade: form.grade.trim(),
        name: form.name.trim() || undefined,
        schedule: form.schedule.trim() || undefined,
      });
      toast.success('Class updated.');
      closeDialogs();
      loadClasses();
    } catch {
      toast.error('Could not update the class. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const removeClass = async (id: string) => {
    if (!confirm('Remove this class? Students and their observations are not affected.')) return;
    try {
      await deleteClass(id);
      toast.success('Class removed.');
      loadClasses();
    } catch {
      toast.error('Could not remove the class. Please try again.');
    }
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
              {badgeLetter}
            </div>
            <div className="text-xs text-gray-700">{schoolName}</div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Classes & Subjects</h2>
        <p className="text-sm text-muted-foreground">Manage the classes that appear in your class selection menu</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Your Classes</span>
              <Button size="sm" className="gap-2 bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white" onClick={openAdd}>
                <Plus className="w-4 h-4" />
                Add Class
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#6B5FE4]" />
              </div>
            ) : classes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No classes yet. Add one to have it appear in your class selection menu.
              </p>
            ) : (
              classes.map((classInfo) => (
                <Card key={classInfo.id} className="border-l-4 border-l-[#6B5FE4]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-4 h-4 text-[#6B5FE4]" />
                          <p className="font-semibold text-foreground">{classInfo.subject}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Grade {classInfo.grade}{classInfo.name ? ` — ${classInfo.name}` : ''}
                        </p>
                        {classInfo.schedule && (
                          <p className="text-xs text-muted-foreground mt-1">{classInfo.schedule}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(classInfo)}>
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-700 hover:border-red-300"
                          onClick={() => removeClass(classInfo.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-accent/40 border-accent">
          <CardContent className="p-4">
            <p className="text-sm text-foreground">
              <strong>Tip:</strong> Students are added from Student Summaries, not here — a class here is a subject/grade grouping, and any student in that grade will show up when you record an observation for it.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Class Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
            <DialogDescription>This will appear in your class selection menu.</DialogDescription>
          </DialogHeader>
          <ClassForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button
              className="bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white gap-2"
              onClick={handleAdd}
              disabled={saving || !form.subject.trim() || !form.grade.trim()}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Add Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={!!editingClass} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <ClassForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button
              className="bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white gap-2"
              onClick={handleEdit}
              disabled={saving || !form.subject.trim() || !form.grade.trim()}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClassForm({
  form,
  setForm,
}: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <Label>Subject</Label>
        <Input
          value={form.subject}
          onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
          placeholder="e.g. Mathematics"
        />
      </div>
      <div className="space-y-1">
        <Label>Grade</Label>
        <Input
          value={form.grade}
          onChange={(e) => setForm(f => ({ ...f, grade: e.target.value }))}
          placeholder="e.g. 5, 10, K"
        />
      </div>
      <div className="space-y-1">
        <Label>Section / Group <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input
          value={form.name}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. A, or Advanced Group"
        />
      </div>
      <div className="space-y-1">
        <Label>Schedule <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input
          value={form.schedule}
          onChange={(e) => setForm(f => ({ ...f, schedule: e.target.value }))}
          placeholder="e.g. Mon, Wed, Fri 9:00-10:30"
        />
      </div>
    </div>
  );
}
