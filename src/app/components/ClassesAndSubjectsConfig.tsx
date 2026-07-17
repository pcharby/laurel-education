import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { ArrowLeft, Plus, X, Save, BookOpen, Users, Pencil, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';
import { CadentLogo } from './CadentLogo';
import { formatStudentName } from '../lib/utils';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  schedule: string;
}

interface Student {
  id: string;
  name: string;
}

interface ClassesAndSubjectsConfigProps {
  onBack: () => void;
}

export function ClassesAndSubjectsConfig({ onBack }: ClassesAndSubjectsConfigProps) {
  const [classes, setClasses] = useState<ClassItem[]>([
    { id: 'math-5a', name: 'Grade 5A', subject: 'Mathematics', schedule: 'Mon, Wed, Fri 9:00-10:30' },
    { id: 'math-5b', name: 'Grade 5B', subject: 'Mathematics', schedule: 'Tue, Thu 9:00-10:30' },
    { id: 'science-5a', name: 'Grade 5A', subject: 'Science', schedule: 'Mon, Wed 1:00-2:30' },
    { id: 'lang-5a', name: 'Grade 5A', subject: 'Language Arts', schedule: 'Daily 10:45-12:00' },
  ]);

  const [students, setStudents] = useState<Student[]>([
    { id: 's1', name: 'Emma Thompson' },
    { id: 's2', name: 'Liam Patel' },
    { id: 's3', name: 'Sofia Hernandez' },
    { id: 's4', name: 'Noah Williams' },
  ]);

  // Edit class dialog
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [editForm, setEditForm] = useState({ name: '', subject: '', schedule: '' });

  // Student management dialog
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  // Upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Edit class ---
  const openEdit = (c: ClassItem) => {
    setEditingClass(c);
    setEditForm({ name: c.name, subject: c.subject, schedule: c.schedule });
  };

  const saveEdit = () => {
    if (!editingClass) return;
    setClasses(prev =>
      prev.map(c =>
        c.id === editingClass.id ? { ...c, ...editForm } : c
      )
    );
    setEditingClass(null);
    toast.success('Class updated.');
  };

  const removeClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    toast.success('Class removed.');
  };

  // --- Upload class list ---
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      // Skip header row if it looks like a header
      const dataLines = lines[0]?.toLowerCase().includes('name') ? lines.slice(1) : lines;
      const parsed: Student[] = dataLines
        .map((line, i) => {
          // Support "Last, First" or "First Last" CSV columns
          const cols = line.split(',');
          const name = cols.length >= 2
            ? `${cols[1]?.trim()} ${cols[0]?.trim()}`
            : cols[0]?.trim();
          return name ? { id: `csv-${Date.now()}-${i}`, name } : null;
        })
        .filter(Boolean) as Student[];

      if (parsed.length === 0) {
        toast.error('No student names found in file.');
        return;
      }
      setStudents(prev => {
        const existing = new Set(prev.map(s => s.name.toLowerCase()));
        const fresh = parsed.filter(s => !existing.has(s.name.toLowerCase()));
        return [...prev, ...fresh];
      });
      toast.success(`Imported ${parsed.length} student${parsed.length !== 1 ? 's' : ''} from ${file.name}.`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- Add student manually ---
  const addStudent = () => {
    const name = newStudentName.trim();
    if (!name) return;
    setStudents(prev => [...prev, { id: `m-${Date.now()}`, name }]);
    setNewStudentName('');
    toast.success(`${name} added.`);
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = () => {
    toast.success('Classes saved successfully!');
    onBack();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-white/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CadentLogo height="md" showProductName />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <div className="text-xs text-gray-700">Riverside Elem.</div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Classes & Subjects</h2>
        <p className="text-sm text-muted-foreground">Manage your teaching schedule and subjects</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Student List Management */}
        <Card className="border-l-4 border-l-[#7D9D77]">
          <CardHeader>
            <CardTitle className="text-base">Student List Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              type="button"
              onClick={handleUploadClick}
              className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#7D9D77] transition-colors cursor-pointer"
            >
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Upload Class List (CSV)</p>
              <p className="text-xs text-muted-foreground">Click to browse — one student name per row</p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".csv,.txt"
              onChange={handleFileChange}
            />
            <Button variant="outline" className="w-full">
              Connect to Student Information System
            </Button>
            <Button
              className="w-full bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white"
              onClick={() => setShowStudentDialog(true)}
            >
              <Users className="w-4 h-4 mr-2" />
              Manually Add/Remove Students
            </Button>
          </CardContent>
        </Card>

        {/* Your Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Your Classes</span>
              <Button size="sm" className="gap-2 bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white">
                <Plus className="w-4 h-4" />
                Add Class
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {classes.map((classInfo) => (
              <Card key={classInfo.id} className="border-l-4 border-l-[#6B5FE4]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-[#6B5FE4]" />
                        <p className="font-semibold text-foreground">{classInfo.subject}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{classInfo.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{classInfo.schedule}</p>
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
            ))}
          </CardContent>
        </Card>

        <Card className="bg-accent/40 border-accent">
          <CardContent className="p-4">
            <p className="text-sm text-foreground">
              <strong>Tip:</strong> Classes you add here will appear in your class selection menu. You can also configure custom rubrics and learning objectives for each subject.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-sm border-t">
        <Button
          onClick={handleSave}
          className="w-full h-12 bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] hover:from-[#1A1A40]/90 hover:to-[#6B5FE4]/90 font-semibold gap-2"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </Button>
      </div>

      {/* Edit Class Dialog */}
      <Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Subject</Label>
              <Input
                value={editForm.subject}
                onChange={(e) => setEditForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="e.g. Mathematics"
              />
            </div>
            <div className="space-y-1">
              <Label>Class Name / Group</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Grade 5A"
              />
            </div>
            <div className="space-y-1">
              <Label>Schedule</Label>
              <Input
                value={editForm.schedule}
                onChange={(e) => setEditForm(f => ({ ...f, schedule: e.target.value }))}
                placeholder="e.g. Mon, Wed, Fri 9:00-10:30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingClass(null)}>Cancel</Button>
            <Button className="bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white gap-2" onClick={saveEdit}>
              <Check className="w-4 h-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manually Add/Remove Students Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Manage Students</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <Input
                placeholder="Full name (e.g. Emma Thompson)"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addStudent()}
              />
              <Button
                className="bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white shrink-0"
                onClick={addStudent}
                disabled={!newStudentName.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
              {students.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No students added yet.</p>
              )}
              {students.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent/50">
                  <span className="text-sm">{formatStudentName(s.name)}</span>
                  <button
                    type="button"
                    onClick={() => removeStudent(s.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                    aria-label={`Remove ${s.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{students.length} student{students.length !== 1 ? 's' : ''} in list</p>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white"
              onClick={() => {
                setShowStudentDialog(false);
                toast.success('Student list saved.');
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
