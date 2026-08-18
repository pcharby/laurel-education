import { useState, useEffect, useRef } from 'react';
import { CurriculumResource, SchoolClass } from '../lib/types';
import {
  getTeacherProfile,
  saveTeacherProfile,
  getClasses,
  getCurriculumResources,
  addCurriculumLink,
  uploadCurriculumFile,
  deleteCurriculumResource,
} from '../lib/storage';
import { auth } from '../../firebase';
import { JURISDICTION_GROUPS } from '../lib/jurisdictions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ArrowLeft, Save, BookOpen, Upload, Link as LinkIcon, FileText, X, Check, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';
import { useSchoolName } from '../lib/useSchoolName';

interface CurriculumConfigProps {
  onBack: () => void;
  onCustomRubrics: () => void;
}

export function CurriculumConfig({ onBack, onCustomRubrics }: CurriculumConfigProps) {
  const { schoolName, badgeLetter } = useSchoolName();
  const [jurisdiction, setJurisdiction] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [jurisdictionDraft, setJurisdictionDraft] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassKey, setSelectedClassKey] = useState<string>('');

  const [resources, setResources] = useState<CurriculumResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addMode, setAddMode] = useState<'link' | 'file'>('link');
  const [title, setTitle] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTeacherProfile().then(profile => {
      setJurisdiction(profile?.jurisdiction ?? null);
      setJurisdictionDraft(profile?.jurisdiction ?? '');
      setProfileLoading(false);
    });
    getClasses().then(result => {
      setClasses(result);
      setClassesLoading(false);
      if (result.length > 0) {
        setSelectedClassKey(`${result[0].subject}|${result[0].grade}`);
      }
    });
  }, []);

  const subjectGradeOptions = Array.from(
    new Map(classes.map(c => [`${c.subject}|${c.grade}`, c])).values()
  );
  const [selectedSubject, selectedGrade] = selectedClassKey.split('|');

  const loadResources = () => {
    if (!jurisdiction || !selectedSubject || !selectedGrade) return;
    setResourcesLoading(true);
    getCurriculumResources(jurisdiction, selectedGrade, selectedSubject).then(result => {
      setResources(result);
      setResourcesLoading(false);
    });
  };

  useEffect(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jurisdiction, selectedClassKey]);

  const handleSaveJurisdiction = async () => {
    if (!jurisdictionDraft) return;
    setSavingProfile(true);
    try {
      await saveTeacherProfile({ jurisdiction: jurisdictionDraft });
      setJurisdiction(jurisdictionDraft);
      toast.success('Jurisdiction saved.');
    } catch {
      toast.error('Could not save your jurisdiction. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const openAddDialog = () => {
    setTitle('');
    setExternalUrl('');
    setFile(null);
    setAddMode('link');
    setShowAddDialog(true);
  };

  const handleAddResource = async () => {
    if (!title.trim() || !jurisdiction || !selectedSubject || !selectedGrade) return;
    if (addMode === 'link' && !externalUrl.trim()) return;
    if (addMode === 'file' && !file) return;

    setSubmitting(true);
    try {
      if (addMode === 'link') {
        await addCurriculumLink({
          jurisdiction,
          grade: selectedGrade,
          subject: selectedSubject,
          title: title.trim(),
          externalUrl: externalUrl.trim(),
        });
      } else if (file) {
        await uploadCurriculumFile(file, {
          jurisdiction,
          grade: selectedGrade,
          subject: selectedSubject,
          title: title.trim(),
        });
      }
      toast.success('Resource added.');
      setShowAddDialog(false);
      loadResources();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add this resource. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (resource: CurriculumResource) => {
    if (!confirm(`Remove "${resource.title}"? This removes it for every teacher who can see this jurisdiction/grade/subject.`)) return;
    try {
      await deleteCurriculumResource(resource);
      toast.success('Resource removed.');
      loadResources();
    } catch {
      toast.error('Could not remove this resource. Please try again.');
    }
  };

  const currentTeacherId = auth.currentUser?.uid;

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
        <h2 className="text-xl font-semibold text-foreground">Curriculum & Lesson Plans</h2>
        <p className="text-sm text-muted-foreground">Browse and share curriculum resources with other teachers</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Jurisdiction */}
        <Card className="border-l-4 border-l-[#6B5FE4]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#6B5FE4]" />
              <CardTitle className="text-base">Your Jurisdiction</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {profileLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#6B5FE4]" />
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Curriculum resources are shared between teachers in the same province/state, grade, and subject.
                </p>
                <div className="flex gap-2">
                  <Select value={jurisdictionDraft} onValueChange={setJurisdictionDraft}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select your province or state" />
                    </SelectTrigger>
                    <SelectContent>
                      {JURISDICTION_GROUPS.map(group => (
                        <SelectGroup key={group.label}>
                          <SelectLabel>{group.label}</SelectLabel>
                          {group.options.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleSaveJurisdiction}
                    disabled={savingProfile || !jurisdictionDraft || jurisdictionDraft === jurisdiction}
                    className="bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white gap-2 shrink-0"
                  >
                    {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {!jurisdiction ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Set your jurisdiction above to browse and share curriculum resources.
            </CardContent>
          </Card>
        ) : classesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#6B5FE4]" />
          </div>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Add a class in Classes & Subjects first - curriculum is browsed by the subjects and grades you teach.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-4 space-y-3">
                <Label>Subject & Grade</Label>
                <Select value={selectedClassKey} onValueChange={setSelectedClassKey}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectGradeOptions.map(c => (
                      <SelectItem key={`${c.subject}|${c.grade}`} value={`${c.subject}|${c.grade}`}>
                        {c.subject} — Grade {c.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#7D9D77]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#7D9D77]" />
                    <CardTitle className="text-base">
                      {selectedSubject} — Grade {selectedGrade} · {jurisdiction}
                    </CardTitle>
                  </div>
                  <Button size="sm" className="gap-2 bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white" onClick={openAddDialog}>
                    <Upload className="w-4 h-4" />
                    Add Resource
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {resourcesLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-[#6B5FE4]" />
                  </div>
                ) : resources.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No curriculum resources yet for this jurisdiction/grade/subject. Be the first to add one.
                  </p>
                ) : (
                  resources.map(resource => (
                    <div key={resource.id} className="flex items-center justify-between rounded-md bg-accent/40 px-3 py-2">
                      <a
                        href={resource.type === 'link' ? resource.externalUrl : resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 min-w-0 hover:underline"
                      >
                        {resource.type === 'link' ? (
                          <LinkIcon className="w-4 h-4 text-[#6B5FE4] shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-[#6B5FE4] shrink-0" />
                        )}
                        <span className="text-sm truncate">{resource.title}</span>
                      </a>
                      {resource.addedByTeacherId === currentTeacherId && (
                        <button
                          type="button"
                          onClick={() => handleDelete(resource)}
                          className="text-muted-foreground hover:text-red-500 ml-2 shrink-0"
                          aria-label={`Delete ${resource.title}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}

        <Card className="bg-accent/40 border-accent">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-foreground">
              Rubrics and curriculum strands are configured separately, per subject.
            </p>
            <Button onClick={onCustomRubrics} variant="outline" className="shrink-0 border-2 border-[#7D9D77] hover:bg-[#7D9D77]/10">
              Configure Rubrics & Strands
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Resource Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && setShowAddDialog(false)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add Curriculum Resource</DialogTitle>
            <DialogDescription>
              Visible to every teacher browsing {selectedSubject} — Grade {selectedGrade} in {jurisdiction}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                placeholder="e.g. 2024 Grade 5 Math Curriculum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant={addMode === 'link' ? undefined : 'outline'}
                className={addMode === 'link' ? 'flex-1 bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white' : 'flex-1'}
                onClick={() => setAddMode('link')}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Link
              </Button>
              <Button
                type="button"
                variant={addMode === 'file' ? undefined : 'outline'}
                className={addMode === 'file' ? 'flex-1 bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white' : 'flex-1'}
                onClick={() => setAddMode('file')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>

            {addMode === 'link' ? (
              <div className="space-y-1">
                <Label>URL</Label>
                <Input
                  placeholder="https://..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-1">
                <Label>File</Label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#6B5FE4] transition-colors cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                  <p className="text-sm font-medium">{file ? file.name : 'Click to browse'}</p>
                  <p className="text-xs text-muted-foreground">PDF, Word, or text - 20MB max</p>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              className="bg-[#1A1A40] hover:bg-[#1A1A40]/90 text-white gap-2"
              onClick={handleAddResource}
              disabled={submitting || !title.trim() || (addMode === 'link' ? !externalUrl.trim() : !file)}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
