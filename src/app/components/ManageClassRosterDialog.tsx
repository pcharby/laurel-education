import { useState, useEffect } from 'react';
import { SchoolClass, Student } from '../lib/types';
import { getStudents, saveStudent, updateClass, clearClassRoster } from '../lib/storage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { formatStudentName } from '../lib/utils';
import { compareStudentsByFirstName } from '../lib/sortStudents';
import { parseNameListText, resolveBulkImportNames } from '../lib/bulkImportNames';
import { NameListUploadField } from './NameListUploadField';

interface ManageClassRosterDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classInfo: SchoolClass;
}

// Candidates are every non-archived student at this class's grade (and
// school, if the class has one) - the same pool that would show up here
// automatically today. Explicit rosters are meant to narrow that pool down
// to a specific subset (e.g. one pull-out group), not reach outside it.
const isCandidate = (s: Student, classInfo: SchoolClass): boolean =>
  s.grade === classInfo.grade && (!classInfo.schoolId || s.schoolId === classInfo.schoolId);

export function ManageClassRosterDialog({ open, onClose, onSuccess, classInfo }: ManageClassRosterDialogProps) {
  const [candidates, setCandidates] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploading, setUploading] = useState(false);

  const uploadNames = parseNameListText(uploadText);
  const resolvedUploadNames = resolveBulkImportNames(uploadNames);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getStudents().then(students => {
      const pool = students.filter(s => isCandidate(s, classInfo)).sort(compareStudentsByFirstName);
      setCandidates(pool);
      // No explicit roster yet: default every candidate to checked, so
      // opening this for the first time mirrors exactly who shows up here
      // today rather than looking like an empty roster to rebuild from
      // scratch.
      const initial = classInfo.studentIds && classInfo.studentIds.length > 0
        ? classInfo.studentIds
        : pool.map(s => s.id);
      setSelected(new Set(initial));
      setLoading(false);
    });
  }, [open, classInfo]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Creates each pasted/uploaded name as a new Student scoped to this
  // class's grade and school, then checks it straight into the roster -
  // the class's grade/school are already known here, so there's no reason
  // to ask again the way the standalone Student Summaries import does.
  // Membership isn't persisted to the class until "Save Roster" is
  // clicked, same as toggling an existing student's checkbox.
  const handleUpload = async () => {
    if (resolvedUploadNames.length === 0) return;
    setUploading(true);
    try {
      const newIds = await Promise.all(
        resolvedUploadNames.map(name =>
          saveStudent({
            id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            grade: classInfo.grade,
            ...(classInfo.schoolId && { schoolId: classInfo.schoolId }),
            createdAt: new Date().toISOString(),
          })
        )
      );
      const students = await getStudents();
      setCandidates(students.filter(s => isCandidate(s, classInfo)).sort(compareStudentsByFirstName));
      setSelected(prev => new Set([...prev, ...newIds]));
      setUploadText('');
      toast.success(`Added ${newIds.length} student${newIds.length === 1 ? '' : 's'} - click Save Roster to keep them on this class.`);
    } catch {
      toast.error('Could not add those students. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateClass(classInfo.id, { studentIds: Array.from(selected) });
      toast.success('Roster saved.');
      onSuccess();
      onClose();
    } catch {
      toast.error('Could not save the roster. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUseAutomatic = async () => {
    setSaving(true);
    try {
      await clearClassRoster(classInfo.id);
      toast.success('Back to automatic grade matching.');
      onSuccess();
      onClose();
    } catch {
      toast.error('Could not reset the roster. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasExplicitRoster = !!classInfo.studentIds && classInfo.studentIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Roster - {classInfo.subject} (Grade {classInfo.grade})</DialogTitle>
          <DialogDescription>
            Pick exactly which students belong to this class. Useful when two classes share a grade but not the same students - like separate pull-out groups.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#6B5FE4]" />
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No Grade {classInfo.grade} students yet. Add some below, or from Student Summaries.
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto border-2 rounded-lg p-3 bg-gray-50 space-y-1">
              {candidates.map(student => (
                <label key={student.id} className="flex items-center gap-3 py-1.5 cursor-pointer select-none">
                  <Checkbox
                    checked={selected.has(student.id)}
                    onCheckedChange={() => toggle(student.id)}
                    className="h-5 w-5"
                  />
                  <span className="text-sm">{formatStudentName(student.name)}</span>
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {selected.size} of {candidates.length} selected.
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <Label className="text-sm font-medium">Add new students to this class</Label>
          <p className="text-xs text-muted-foreground">
            Paste or upload a list. New students are added at Grade {classInfo.grade}{classInfo.schoolId ? ' for this school' : ''} and checked in above automatically - only their first name and last initial are imported, never their full last name.
          </p>
          <NameListUploadField
            id="roster-upload"
            label="New Student Names (one per line)"
            rawText={uploadText}
            onRawTextChange={setUploadText}
            disabled={uploading}
          />
          {uploadNames.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Preview - will be added as:</Label>
              <div className="max-h-28 overflow-y-auto border-2 rounded-lg p-2 bg-gray-50 text-sm space-y-1">
                {resolvedUploadNames.map((name, i) => (
                  <div key={i} className="text-gray-700">{name}</div>
                ))}
              </div>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleUpload}
            disabled={uploading || uploadNames.length === 0}
            className="gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            Add {uploadNames.length > 0 ? `${uploadNames.length} ` : ''}Student{uploadNames.length === 1 ? '' : 's'}
          </Button>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          {hasExplicitRoster ? (
            <Button variant="outline" onClick={handleUseAutomatic} disabled={saving} className="text-muted-foreground">
              Use automatic grade matching instead
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Roster
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
