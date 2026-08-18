import { useState, useEffect } from 'react';
import { School } from '../lib/types';
import { getSchools, addSchool, updateSchool, deleteSchool } from '../lib/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { ArrowLeft, Plus, X, Building2, Pencil, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';
import { useSchoolName } from '../lib/useSchoolName';

interface SchoolsConfigProps {
  onBack: () => void;
}

export function SchoolsConfig({ onBack }: SchoolsConfigProps) {
  const { schoolName, badgeLetter } = useSchoolName();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSchools = () => {
    getSchools().then(result => {
      setSchools(result);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const openAdd = () => {
    setName('');
    setShowAddDialog(true);
  };

  const openEdit = (s: School) => {
    setEditingSchool(s);
    setName(s.name);
  };

  const closeDialogs = () => {
    setShowAddDialog(false);
    setEditingSchool(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addSchool(name.trim());
      toast.success('School added.');
      closeDialogs();
      loadSchools();
    } catch {
      toast.error('Could not add the school. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingSchool || !name.trim()) return;
    setSaving(true);
    try {
      await updateSchool(editingSchool.id, name.trim());
      toast.success('School updated.');
      closeDialogs();
      loadSchools();
    } catch {
      toast.error('Could not update the school. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const removeSchool = async (id: string) => {
    if (!confirm('Remove this school? Classes and students already assigned to it keep working, but stop being grouped under it.')) return;
    try {
      await deleteSchool(id);
      toast.success('School removed.');
      loadSchools();
    } catch {
      toast.error('Could not remove the school. Please try again.');
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
        <h2 className="text-xl font-semibold text-foreground">Schools</h2>
        <p className="text-sm text-muted-foreground">If you teach at more than one school, add them here to keep classes and student lists separate per school</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Your Schools</span>
              <Button
                size="sm"
                className="gap-2 bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white"
                onClick={openAdd}
              >
                <Plus className="w-4 h-4" />
                Add School
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#6B5FE4]" />
              </div>
            ) : schools.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                You only need this if you teach at more than one school. Add each school to assign classes and students to the right one.
              </p>
            ) : (
              schools.map((school) => (
                <Card key={school.id} className="border-l-4 border-l-[#6B5FE4]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#6B5FE4]" />
                        <p className="font-semibold text-foreground">{school.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(school)}>
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-700 hover:border-red-300"
                          onClick={() => removeSchool(school.id)}
                          aria-label={`Remove ${school.name}`}
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

        {schools.length > 0 && (
          <Card className="bg-accent/40 border-accent">
            <CardContent className="p-4">
              <p className="text-sm text-foreground">
                <strong>Tip:</strong> Assign a school to each class in Classes &amp; Subjects, and to each student, to keep their class lists separate.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add School Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add School</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>School Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Riverside Elementary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button
              className="bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white gap-2"
              onClick={handleAdd}
              disabled={saving || !name.trim()}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Add School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit School Dialog */}
      <Dialog open={!!editingSchool} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>School Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Riverside Elementary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button
              className="bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white gap-2"
              onClick={handleEdit}
              disabled={saving || !name.trim()}
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
