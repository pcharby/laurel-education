import { useState, useEffect } from 'react';
import { Student, School } from '../lib/types';
import { saveStudent, getStudents, getSchools } from '../lib/storage';
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

interface AddStudentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultGrade?: string;
  defaultSchoolId?: string;
}

export function AddStudentDialog({ open, onClose, onSuccess, defaultGrade, defaultSchoolId }: AddStudentDialogProps) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(defaultGrade ?? '');
  const [schoolId, setSchoolId] = useState(defaultSchoolId ?? '');
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getSchools().then(setSchools);
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter student name');
      return;
    }
    if (!grade.trim()) {
      setError('Please enter grade');
      return;
    }
    const existingStudents = await getStudents();
    const duplicate = existingStudents.find(
      s => s.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (duplicate) {
      setError(`A student named "${name}" already exists. Please use a different name or add a distinguishing detail.`);
      return;
    }

    const newStudent: Omit<Student, 'teacherId'> = {
      id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      grade: grade.trim(),
      ...(schoolId && { schoolId }),
      createdAt: new Date().toISOString(),
    };

    await saveStudent(newStudent);
    setName('');
    setGrade('');
    setError('');
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Create a student profile to begin tracking observations and evaluations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Student Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sarah Johnson"
           />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Input
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g., 5, 10, K"
           />
          </div>

          {schools.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <select
                id="school"
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

          {error && (
            <Alert >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button  onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
