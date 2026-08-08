import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Save, BookOpen, Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';

interface CurriculumConfigProps {
  onBack: () => void;
  onCustomRubrics: () => void;
}

export function CurriculumConfig({ onBack, onCustomRubrics }: CurriculumConfigProps) {
  const subjects = [
    { name: 'Mathematics', grade: '5', expectations: 12, lessonPlans: 8 },
    { name: 'Science', grade: '5', expectations: 10, lessonPlans: 6 },
    { name: 'Language Arts', grade: '5', expectations: 15, lessonPlans: 12 },
  ];

  const handleSave = () => {
    toast.success('Curriculum updates saved successfully!');
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
        <h2 className="text-xl font-semibold text-gray-800">Curriculum & Lesson Plans</h2>
        <p className="text-sm text-gray-600">Update curriculum expectations and lesson plans</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="border-l-4 border-l-[#6B5FE4]">
          <CardHeader>
            <CardTitle className="text-base">Upload Curriculum Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6B5FE4] transition-colors cursor-pointer">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Upload Curriculum</p>
              <p className="text-xs text-gray-500">Drag & drop PDF or click to browse</p>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
            </div>
            <Button
              onClick={onCustomRubrics}
              
              className="w-full border-2 border-[#7D9D77] hover:bg-[#7D9D77]/10"
            >
              Configure Rubrics & Objectives
            </Button>
          </CardContent>
        </Card>

        {subjects.map((subject) => (
          <Card key={subject.name} className="border-l-4 border-l-[#7D9D77]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#7D9D77]" />
                  <CardTitle className="text-base text-gray-900">{subject.name} - Grade {subject.grade}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="text-2xl font-bold text-[#6B5FE4]">{subject.expectations}</div>
                  <div className="text-xs text-gray-600">Curriculum Expectations</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div className="text-2xl font-bold text-[#7D9D77]">{subject.lessonPlans}</div>
                  <div className="text-xs text-gray-600">Lesson Plans</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button  size="sm" className="flex-1 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Expectation
                </Button>
                <Button  size="sm" className="flex-1 gap-2">
                  <Calendar className="w-4 h-4" />
                  Add Lesson Plan
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Recent Curriculum Updates:</p>
                <div className="space-y-1">
                  <Badge  className="text-xs">Unit 3: Fractions & Decimals</Badge>
                  <Badge  className="text-xs ml-2">Unit 4: Data Management</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Curriculum expectations and lesson plans help Laurel Education align observations with your teaching goals. AI-generated evaluations will reference these when creating report card commentary.
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
          Save Curriculum Updates
        </Button>
      </div>
    </div>
  );
}
