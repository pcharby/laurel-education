import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, School, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';
import { getTeacherProfile, saveTeacherProfile } from '../lib/storage';

interface SchoolProfileProps {
  onBack: () => void;
}

export function SchoolProfile({ onBack }: SchoolProfileProps) {
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTeacherProfile().then(profile => {
      setSchoolName(profile?.schoolName ?? '');
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTeacherProfile({ schoolName: schoolName.trim() });
      toast.success('School profile saved.');
    } catch {
      toast.error('Could not save your school profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col" style={{ backgroundColor: 'rgba(91, 155, 213, 0.08)' }}>
      <div className="bg-white/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center gap-3 mb-3">
          <Button size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <LaurelLogo height="md" showProductName />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">School Profile</h2>
        <p className="text-sm text-gray-600">Shown in the header throughout the app</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="border-l-4 border-l-[#6B5FE4]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-[#6B5FE4]" />
              <CardTitle className="text-base">School Name</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#6B5FE4]" />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="schoolName">School or organization name</Label>
                <Input
                  id="schoolName"
                  placeholder="e.g. Riverside Elementary"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  disabled={saving}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-sm border-t">
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full h-12 bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] hover:from-[#1A1A40]/90 hover:to-[#6B5FE4]/90 font-semibold gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save
        </Button>
      </div>
    </div>
  );
}
