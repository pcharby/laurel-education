import { useState, useEffect } from 'react';
import { SchoolClass, School } from '../lib/types';
import { getClasses, saveClass, updateClass, deleteClass, getSchools } from '../lib/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Plus, X, BookOpen, Pencil, Check, Loader2, Lock, Archive, ChevronDown, ChevronUp, Building2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';
import { useSchoolName } from '../lib/useSchoolName';
import { useSchoolYearLock } from '../lib/useSchoolYearLock';
import { ManageClassRosterDialog } from './ManageClassRosterDialog';

interface ClassesAndSubjectsConfigProps {
  onBack: () => void;
}

const emptyForm = { subject: '', grade: '', name: '', schedule: '', schoolId: '' };

export function ClassesAndSubjectsConfig({ onBack }: ClassesAndSubjectsConfigProps) {
  const { schoolName, badgeLetter } = useSchoolName();
  const lockInfo = useSchoolYearLock();
  const locked = lockInfo.status === 'locked';
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);

  // Add/Edit class dialog - null means closed, {} means "adding new"
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [rosterClass, setRosterClass] = useState<SchoolClass | null>(null);
  const [archivingClass, setArchivingClass] = useState<SchoolClass | null>(null);
  const [archiving, setArchiving] = useState(false);

  const loadClasses = () => {
    getClasses().then(result => {
      setClasses(result);
      setLoading(false);
    });
  };

  const activeClasses = classes.filter(c => !c.archived);
  const archivedClasses = classes.filter(c => c.archived);

  useEffect(() => {
    loadClasses();
    getSchools().then(setSchools);
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setShowAddDialog(true);
  };

  const openEdit = (c: SchoolClass) => {
    setEditingClass(c);
    setForm({ subject: c.subject, grade: c.grade, name: c.name ?? '', schedule: c.schedule ?? '', schoolId: c.schoolId ?? '' });
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
        schoolId: form.schoolId || undefined,
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
        schoolId: form.schoolId || undefined,
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

  const confirmArchive = async () => {
    if (!archivingClass) return;
    setArchiving(true);
    try {
      await updateClass(archivingClass.id, { archived: true });
      toast.success('Class archived.');
      setArchivingClass(null);
      loadClasses();
    } catch {
      toast.error('Could not archive the class. Please try again.');
    } finally {
      setArchiving(false);
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
        {locked && (
          <Alert className="bg-amber-50 border-amber-200">
            <Lock className="w-4 h-4" />
            <AlertDescription>
              Your school year is locked — classes can still be removed, but not added or edited until you set a new end date in Settings &gt; School Profile.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Your Classes</span>
              <Button
                size="sm"
                className="gap-2 bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white"
                onClick={openAdd}
                disabled={locked}
                title={locked ? 'Your school year is locked - update the end date in Settings to add classes.' : undefined}
              >
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
            ) : activeClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No classes yet. Add one to have it appear in your class selection menu.
              </p>
            ) : (
              activeClasses.map((classInfo) => (
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
                        {classInfo.schoolId && (
                          <p className="text-xs text-[#6B5FE4] mt-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {schools.find(s => s.id === classInfo.schoolId)?.name ?? 'Unknown school'}
                          </p>
                        )}
                        {classInfo.studentIds && classInfo.studentIds.length > 0 && (
                          <p className="text-xs text-[#7D9D77] mt-1 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Custom roster ({classInfo.studentIds.length})
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRosterClass(classInfo)}
                          disabled={locked}
                          title={locked ? 'Your school year is locked - update the end date in Settings to change rosters.' : 'Pick exactly which students belong to this class'}
                        >
                          <Users className="w-3.5 h-3.5 mr-1" />
                          Roster
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(classInfo)}
                          disabled={locked}
                          title={locked ? 'Your school year is locked - update the end date in Settings to edit classes.' : undefined}
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setArchivingClass(classInfo)}
                          disabled={locked}
                          title={locked ? 'Your school year is locked - update the end date in Settings to archive classes.' : "Archive this class now, without waiting for the school year to end"}
                        >
                          <Archive className="w-3.5 h-3.5 mr-1" />
                          Archive
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

        {archivedClasses.length > 0 && (
          <Card>
            <CardHeader>
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => setShowArchived(v => !v)}
              >
                <CardTitle className="text-lg flex items-center gap-2">
                  <Archive className="w-4 h-4 text-muted-foreground" />
                  Archived Classes ({archivedClasses.length})
                </CardTitle>
                {showArchived ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </CardHeader>
            {showArchived && (
              <CardContent className="space-y-3">
                {archivedClasses.map((classInfo) => (
                  <Card key={classInfo.id} className="border-l-4 border-l-muted bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold text-muted-foreground">{classInfo.subject}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Grade {classInfo.grade}{classInfo.name ? ` — ${classInfo.name}` : ''}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            )}
          </Card>
        )}

        <Card className="bg-accent/40 border-accent">
          <CardContent className="p-4">
            <p className="text-sm text-foreground">
              <strong>Tip:</strong> By default, any student in a class's grade shows up when you record an observation for it. Use <strong>Roster</strong> on a class to pick — or upload — a specific set of students instead, useful when two classes share a grade but not the same students.
            </p>
          </CardContent>
        </Card>
      </div>

      {rosterClass && (
        <ManageClassRosterDialog
          open={!!rosterClass}
          onClose={() => setRosterClass(null)}
          onSuccess={loadClasses}
          classInfo={rosterClass}
        />
      )}

      <AlertDialog open={!!archivingClass} onOpenChange={(open) => !open && !archiving && setArchivingClass(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Archive {archivingClass?.subject}{archivingClass ? ` — Grade ${archivingClass.grade}` : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              It will move to Archived Classes and won't appear in your class selection menu. There's no undo from here — you can flip it back by hand if it was archived by mistake.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmArchive(); }}
              disabled={archiving}
              className="bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white gap-2"
            >
              {archiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Class Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
            <DialogDescription>This will appear in your class selection menu.</DialogDescription>
          </DialogHeader>
          <ClassForm form={form} setForm={setForm} schools={schools} />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button
              className="bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white gap-2"
              onClick={handleAdd}
              disabled={saving || locked || !form.subject.trim() || !form.grade.trim()}
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
          <ClassForm form={form} setForm={setForm} schools={schools} />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button
              className="bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white gap-2"
              onClick={handleEdit}
              disabled={saving || locked || !form.subject.trim() || !form.grade.trim()}
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
  schools,
}: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  schools: School[];
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
      {schools.length > 0 && (
        <div className="space-y-1">
          <Label>School</Label>
          <select
            value={form.schoolId}
            onChange={(e) => setForm(f => ({ ...f, schoolId: e.target.value }))}
            className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          >
            <option value="">No specific school</option>
            {schools.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
