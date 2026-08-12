import { formatStudentName } from '../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { UserCircle } from 'lucide-react';

interface StudentListDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  students: { name: string; count: number }[];
  countLabel: string;
}

export function StudentListDialog({ open, onClose, title, description, students, countLabel }: StudentListDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-[#6B5FE4]" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {students.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No students in this list.</p>
          ) : (
            students.map((student) => (
              <div key={student.name} className="p-3 rounded-lg border-2 bg-gray-50 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-900">{formatStudentName(student.name)}</span>
                  </div>
                  <Badge>{student.count} {countLabel}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
