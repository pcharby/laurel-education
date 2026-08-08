import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Plus, X, Save, BookOpen, Users } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';

interface ClassesAndSubjectsConfigProps {
  onBack: () => void;
}

export function ClassesAndSubjectsConfig({ onBack }: ClassesAndSubjectsConfigProps) {
  const [classes, setClasses] = useState([
    { id: 'math-5a', name: 'Grade 5A', subject: 'Mathematics', schedule: 'Mon, Wed, Fri 9:00-10:30' },
    { id: 'math-5b', name: 'Grade 5B', subject: 'Mathematics', schedule: 'Tue, Thu 9:00-10:30' },
    { id: 'science-5a', name: 'Grade 5A', subject: 'Science', schedule: 'Mon, Wed 1:00-2:30' },
    { id: 'lang-5a', name: 'Grade 5A', subject: 'Language Arts', schedule: 'Daily 10:45-12:00' },
  ]);

  const handleSave = () => {
    toast.success('Classes saved successfully!');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col" style={{ backgroundColor: 'rgba(91, 155, 213, 0.08)' }}>
      <div className="bg-white/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button  size="sm" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <LaurelLogo height="md" showProductName />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6B5FE4] to-[#1A1A40] rounded-full flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <div className="text-xs text-gray-700">Riverside Elem.</div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Classes & Subjects</h2>
        <p className="text-sm text-gray-600">Manage your teaching schedule and subjects</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="border-l-4 border-l-[#7D9D77]">
          <CardHeader>
            <CardTitle className="text-base">Student List Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#7D9D77] transition-colors cursor-pointer">
              <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Upload Class List (CSV)</p>
              <p className="text-xs text-gray-500">Or link to Student Information System</p>
              <input type="file" className="hidden" accept=".csv,.xlsx" />
            </div>
            <Button  className="w-full">
              Connect to Student Information System
            </Button>
            <Button  className="w-full">
              Manually Add/Remove Students
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Your Classes</span>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Class
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {classes.map((classInfo) => (
              <Card key={classInfo.id} className="border-l-4 border-l-[#6B5FE4]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-[#6B5FE4]" />
                        <p className="font-semibold text-gray-900">{classInfo.subject}</p>
                      </div>
                      <p className="text-sm text-gray-600">{classInfo.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{classInfo.schedule}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button  size="sm">
                        Edit
                      </Button>
                      <Button  size="sm" className="text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-700">
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
    </div>
  );
}
