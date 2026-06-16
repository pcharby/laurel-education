import { useState } from 'react';
import { Student } from '../lib/types';
import { saveStudent, getStudents } from '../lib/storage';
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
}

export function AddStudentDialog({ open, onClose, onSuccess }: AddStudentDialogProps) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Please enter student name');
      return;
    }
    if (!grade.trim()) {
      setError('Please enter grade');
      return;
    }

    const existingStudents = getStudents();
    const duplicate = existingStudents.find(
      s => s.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (duplicate) {
      setError(`A student named "${name}" already exists. Please use a different name or add a distinguishing detail.`);
      return;
    }

    const newStudent: Student = {
      id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      grade: grade.trim(),
      createdAt: new Date().toISOString(),
    };

    saveStudent(newStudent);
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
