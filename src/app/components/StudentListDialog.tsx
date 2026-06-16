import { Student } from '../lib/types';
import { formatStudentName } from '../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { UserCircle, AlertCircle } from 'lucide-react';

interface StudentListDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  students: { name: string; score: number }[];
  type: 'at-risk' | 'excelling';
}

export function StudentListDialog({ open, onClose, title, students, type }: StudentListDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'at-risk' ? (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            ) : (
              <UserCircle className="w-5 h-5 text-green-600" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>
            {type === 'at-risk'
              ? 'Students who may need additional support or intervention'
              : 'Students performing above grade level expectations'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {students.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No students in this category</p>
          ) : (
            students.map((student, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 ${
                  type === 'at-risk'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle className={`w-5 h-5 ${type === 'at-risk' ? 'text-yellow-600' : 'text-green-600'}`} />
                    <span className="font-medium text-gray-900">{formatStudentName(student.name)}</span>
                  </div>
                  <Badge >
                    {student.score}%
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
