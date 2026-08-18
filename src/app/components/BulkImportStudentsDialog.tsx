import { useState, useEffect } from 'react';
import { School } from '../lib/types';
import { saveStudent, getSchools } from '../lib/storage';
import { parseNameListText, resolveBulkImportNames } from '../lib/bulkImportNames';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { NameListUploadField } from './NameListUploadField';

interface BulkImportStudentsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultGrade?: string;
  defaultSchoolId?: string;
}

export function BulkImportStudentsDialog({ open, onClose, onSuccess, defaultGrade, defaultSchoolId }: BulkImportStudentsDialogProps) {
  const [rawText, setRawText] = useState('');
  const [grade, setGrade] = useState(defaultGrade ?? '');
  const [schoolId, setSchoolId] = useState(defaultSchoolId ?? '');
  const [schools, setSchools] = useState<School[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSchools().then(setSchools);
  }, []);

  const names = parseNameListText(rawText);
  const resolvedNames = resolveBulkImportNames(names);

  const handleImport = async () => {
    if (names.length === 0) {
      setError('Paste or upload at least one student name.');
      return;
    }
    if (!grade.trim()) {
      setError('Please enter grade');
      return;
    }
    setError('');
    setImporting(true);
    try {
      await Promise.all(
        resolvedNames.map(name =>
          saveStudent({
            id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            grade: grade.trim(),
            ...(schoolId && { schoolId }),
            createdAt: new Date().toISOString(),
          })
        )
      );
      toast.success(`Imported ${resolvedNames.length} student${resolvedNames.length === 1 ? '' : 's'}.`);
      setRawText('');
      onSuccess();
      onClose();
    } catch {
      toast.error('Could not import the roster. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Class Roster</DialogTitle>
          <DialogDescription>
            Paste or upload a full class list. Only each student's first name and last initial are imported - never their full last name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="bulk-grade">Grade</Label>
            <Input
              id="bulk-grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g., 5, 10, K"
            />
          </div>

          {schools.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="bulk-school">School</Label>
              <select
                id="bulk-school"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm"
              >
                <option value="">No specific school</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <NameListUploadField
            id="bulk-names"
            label="Student Names (one per line)"
            rawText={rawText}
            onRawTextChange={setRawText}
            disabled={importing}
          />

          {names.length > 0 && (
            <div className="space-y-1">
              <Label>Preview - {names.length} student{names.length === 1 ? '' : 's'} will be imported as:</Label>
              <div className="max-h-40 overflow-y-auto border-2 rounded-lg p-3 bg-gray-50 text-sm space-y-1">
                {resolvedNames.map((name, i) => (
                  <div key={i} className="text-gray-700">{name}</div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} disabled={importing}>Cancel</Button>
          <Button onClick={handleImport} disabled={importing || names.length === 0} className="gap-2">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Import {names.length > 0 ? `${names.length} ` : ''}Student{names.length === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
