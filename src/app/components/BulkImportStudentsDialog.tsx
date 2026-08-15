import { useState, useEffect, useRef } from 'react';
import { School } from '../lib/types';
import { saveStudent, getSchools } from '../lib/storage';
import { resolveBulkImportNames } from '../lib/bulkImportNames';
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
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BulkImportStudentsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultGrade?: string;
  defaultSchoolId?: string;
}

// A CSV export's name column may be quoted/comma-separated with other
// fields - take the first column as the name and strip any surrounding
// quotes. A plain one-name-per-line paste has no commas, so this is a
// no-op for that common case.
const firstColumn = (line: string): string => line.split(',')[0].trim().replace(/^"|"$/g, '');

export function BulkImportStudentsDialog({ open, onClose, onSuccess, defaultGrade, defaultSchoolId }: BulkImportStudentsDialogProps) {
  const [rawText, setRawText] = useState('');
  const [grade, setGrade] = useState(defaultGrade ?? '');
  const [schoolId, setSchoolId] = useState(defaultSchoolId ?? '');
  const [schools, setSchools] = useState<School[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSchools().then(setSchools);
  }, []);

  const names = rawText
    .split('\n')
    .map(firstColumn)
    .filter(Boolean);
  const resolvedNames = resolveBulkImportNames(names);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRawText(text);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bulk-names">Student Names (one per line)</Label>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="w-3.5 h-3.5" />
                Upload File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <Textarea
              id="bulk-names"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={'Emma Thompson\nLiam Chen\nSophia Martinez'}
              rows={6}
              disabled={importing}
            />
          </div>

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
