import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Lock, BookOpen, Calendar, Bug } from 'lucide-react';
import { LaurelLogo } from './LaurelLogo';

interface SettingsMenuProps {
  onBack: () => void;
  onClassesAndSubjects: () => void;
  onCurriculum: () => void;
  onPasswordManagement: () => void;
  onReportProblem: () => void;
}

export function SettingsMenu({ onBack, onClassesAndSubjects, onCurriculum, onPasswordManagement, onReportProblem }: SettingsMenuProps) {
  const settingsOptions = [
    {
      icon: BookOpen,
      title: 'Classes & Subjects',
      description: 'Manage schedule, subjects, and student lists',
      color: '#7D9D77',
      onClick: onClassesAndSubjects,
    },
    {
      icon: Calendar,
      title: 'Curriculum & Lesson Plans',
      description: 'Upload curriculum, manage rubrics and learning objectives',
      color: '#6B5FE4',
      onClick: onCurriculum,
    },
    {
      icon: Lock,
      title: 'Password & Security',
      description: 'Update your password or delete your account',
      color: '#767F93',
      onClick: onPasswordManagement,
    },
    {
      icon: Bug,
      title: 'Report a Problem',
      description: 'Report a bug or send feedback',
      color: '#D97706',
      onClick: onReportProblem,
    },
  ];

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
        <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {settingsOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.title}
              onClick={option.onClick}
              className="w-full"
            >
              <Card className="hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-white/40 bg-white/95">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${option.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: option.color }} />
                    </div>
                    <div className="text-left flex-1">
                      <CardTitle className="text-base">{option.title}</CardTitle>
                      <CardDescription className="text-sm">{option.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-sm border-t">
        <div className="text-center text-gray-600 text-xs">
          <p>Laurel Education v1.0.0</p>
          <p className="mt-1">© 2026 Laurel Education. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
