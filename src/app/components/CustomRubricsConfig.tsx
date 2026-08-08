import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';

interface CustomRubricsConfigProps {
  onBack: () => void;
}

export function CustomRubricsConfig({ onBack }: CustomRubricsConfigProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [newRubric, setNewRubric] = useState('');

  const [rubrics, setRubrics] = useState({
    'Mathematics': ['Problem Solving', 'Number Sense', 'Algebraic Thinking', 'Data Management'],
    'Science': ['Scientific Inquiry', 'Critical Thinking', 'Observation Skills'],
    'Language Arts': ['Reading Comprehension', 'Written Expression', 'Oral Communication'],
  });

  const subjects = ['Mathematics', 'Science', 'Language Arts'];

  const handleAddRubric = () => {
    if (!newRubric.trim()) return;

    setRubrics(prev => ({
      ...prev,
      [selectedSubject]: [...prev[selectedSubject as keyof typeof prev], newRubric.trim()]
    }));
    setNewRubric('');
  };

  const handleRemoveRubric = (rubric: string) => {
    setRubrics(prev => ({
      ...prev,
      [selectedSubject]: prev[selectedSubject as keyof typeof prev].filter(r => r !== rubric)
    }));
  };

  const handleSave = () => {
    // In production, save to backend
    toast.success('Custom rubrics saved successfully!');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col" style={{ backgroundColor: 'rgba(91, 155, 213, 0.08)' }}>
      <div className="bg-white/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button  size="sm" onClick={onBack} className="hover:bg-white/40">
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
        <h2 className="text-xl font-semibold text-gray-800">Custom Rubrics Configuration</h2>
        <p className="text-sm text-gray-600">Customize learning objectives for each subject</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {subjects.map(subject => (
            <Button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              
              className={selectedSubject === subject ? 'bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4]' : ''}
            >
              {subject}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{selectedSubject} Rubrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-rubric">Add New Rubric</Label>
              <div className="flex gap-2">
                <Input
                  id="new-rubric"
                  value={newRubric}
                  onChange={(e) => setNewRubric(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRubric()}
                  placeholder="e.g., Creative Problem Solving"
                  className="flex-1"
               />
                <Button onClick={handleAddRubric} className="gap-2" style={{ backgroundColor: '#6B5FE4' }}>
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Rubrics ({rubrics[selectedSubject as keyof typeof rubrics].length})</Label>
              <div className="flex flex-wrap gap-2 min-h-[100px] border-2 rounded-lg p-3 bg-gray-50">
                {rubrics[selectedSubject as keyof typeof rubrics].map(rubric => (
                  <Badge
                    key={rubric}
                    
                    className="gap-2 py-2 px-3 text-sm"
                  >
                    {rubric}
                    <button
                      onClick={() => handleRemoveRubric(rubric)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> Align your custom rubrics with your curriculum expectations and lesson plans. These will be available when recording observations.
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
          Save Custom Rubrics
        </Button>
      </div>
    </div>
  );
}
