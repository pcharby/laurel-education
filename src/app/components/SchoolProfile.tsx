import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, School, Save, Loader2, CalendarClock, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';
import { getTeacherProfile, saveTeacherProfile, clearSchoolYearEndDate } from '../lib/storage';
import { getSchoolYearLockStatus, SchoolYearLockInfo } from '../lib/schoolYearLock';

interface SchoolProfileProps {
  onBack: () => void;
}

// <input type="date"> gives a plain "YYYY-MM-DD" string with no timezone.
// Read/write it using the browser's LOCAL date components on both ends
// (never .toISOString(), which is UTC and would silently shift the date by
// up to a day depending on timezone) so a round trip through this form
// always shows back the exact date the teacher picked.
const toDateInputValue = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// End-of-day in the browser's own timezone, not UTC midnight (which is
// already the previous evening in every Canadian timezone) - the date a
// teacher picks should mean "through the end of that day, where they are."
const parseDateInputValue = (value: string): Date => new Date(`${value}T23:59:59`);

export function SchoolProfile({ onBack }: SchoolProfileProps) {
  const [schoolName, setSchoolName] = useState('');
  const [schoolYearEndDateInput, setSchoolYearEndDateInput] = useState('');
  const [lockInfo, setLockInfo] = useState<SchoolYearLockInfo>({ status: 'none', lockDate: null, archiveDate: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadProfile = () => {
    getTeacherProfile().then(profile => {
      setSchoolName(profile?.schoolName ?? '');
      setSchoolYearEndDateInput(profile?.schoolYearEndDate ? toDateInputValue(profile.schoolYearEndDate.toDate()) : '');
      setLockInfo(getSchoolYearLockStatus(profile));
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTeacherProfile({
        schoolName: schoolName.trim(),
        ...(schoolYearEndDateInput && { schoolYearEndDate: Timestamp.fromDate(parseDateInputValue(schoolYearEndDateInput)) }),
      });
      toast.success('School profile saved.');
      loadProfile();
    } catch {
      toast.error('Could not save your school profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearSchoolYear = async () => {
    setClearing(true);
    try {
      await clearSchoolYearEndDate();
      toast.success('School year end date cleared.');
      loadProfile();
    } catch {
      toast.error('Could not clear the school year end date. Please try again.');
    } finally {
      setClearing(false);
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

        <Card className="border-l-4 border-l-[#6B5FE4]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-[#6B5FE4]" />
              <CardTitle className="text-base">School Year</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#6B5FE4]" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="schoolYearEndDate">End of school year</Label>
                  <Input
                    id="schoolYearEndDate"
                    type="date"
                    value={schoolYearEndDateInput}
                    onChange={(e) => setSchoolYearEndDateInput(e.target.value)}
                    disabled={saving}
                  />
                  <p className="text-xs text-gray-500">
                    Classes and students become read-only 2 days after this date, and archive 90 days after it. Set a new date each year to unlock and start fresh.
                  </p>
                </div>

                {lockInfo.status === 'locked' && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <Lock className="w-4 h-4" />
                    <AlertDescription>
                      Read-only since {lockInfo.lockDate ? format(lockInfo.lockDate, 'MMM d, yyyy') : ''} — classes archive {lockInfo.archiveDate ? format(lockInfo.archiveDate, 'MMM d, yyyy') : ''}. Set a new date above and save to unlock.
                    </AlertDescription>
                  </Alert>
                )}
                {lockInfo.status === 'active' && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription>
                      Classrooms become read-only {lockInfo.lockDate ? format(lockInfo.lockDate, 'MMM d, yyyy') : ''} and archived {lockInfo.archiveDate ? format(lockInfo.archiveDate, 'MMM d, yyyy') : ''}.
                    </AlertDescription>
                  </Alert>
                )}

                {schoolYearEndDateInput && (
                  <Button
                    size="sm"
                    onClick={handleClearSchoolYear}
                    disabled={clearing || saving}
                    className="text-gray-600 hover:text-red-600"
                  >
                    {clearing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Clear school year end date
                  </Button>
                )}
              </>
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
