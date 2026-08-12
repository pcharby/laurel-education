import { Button } from './ui/button';
import { FileText, Mic, Camera, ArrowLeft, BarChart3 } from 'lucide-react';
import { LaurelLogo } from './LaurelLogo';
import { SchoolClass } from '../lib/types';

interface MobileObservationTypeSelectorProps {
  onSelectType: (type: 'text' | 'audio' | 'image') => void;
  onBack: () => void;
  onClassInsights: () => void;
  classInfo: SchoolClass;
}

export function MobileObservationTypeSelector({
  onSelectType,
  onBack,
  onClassInsights,
  classInfo
}: MobileObservationTypeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5FC] to-[#EBE8F5] flex flex-col p-4">
      <div className="flex items-center justify-between mb-6">
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

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-1 text-gray-800">{classInfo.subject}</h2>
        <p className="text-gray-600">Grade {classInfo.grade}{classInfo.name ? ` — ${classInfo.name}` : ''}</p>
      </div>

      <div className="flex-1 flex items-center justify-center pb-8">
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {/* Top left - Text */}
          <button
            onClick={() => onSelectType('text')}
            className="aspect-square rounded-2xl bg-gradient-to-br from-[#A5B4FC] to-[#818CF8] hover:from-[#A5B4FC]/90 hover:to-[#818CF8]/90 shadow-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 p-4"
          >
            <FileText className="w-16 h-16 text-white mb-2" strokeWidth={1.5} />
            <span className="text-white font-semibold text-sm">Text Note</span>
          </button>

          {/* Top right - Audio */}
          <button
            onClick={() => onSelectType('audio')}
            className="aspect-square rounded-2xl bg-gradient-to-br from-[#6B5FE4] to-[#3730A3] hover:from-[#6B5FE4]/90 hover:to-[#3730A3]/90 shadow-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 p-4"
          >
            <Mic className="w-16 h-16 text-white mb-2" strokeWidth={1.5} />
            <span className="text-white font-semibold text-sm">Voice Memo</span>
          </button>

          {/* Bottom left - Photo */}
          <button
            onClick={() => onSelectType('image')}
            className="aspect-square rounded-2xl shadow-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 p-4"
            style={{
              backgroundImage: 'linear-gradient(135deg, #7D9D77 0%, #5E7D59 50%, #4B6647 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }}
          >
            <Camera className="w-16 h-16 text-white mb-2" strokeWidth={1.5} />
            <span className="text-white font-semibold text-sm">Photo</span>
          </button>

          {/* Bottom right - Class Insights */}
          <button
            onClick={onClassInsights}
            className="aspect-square rounded-2xl bg-gradient-to-br from-[#4B5E7A] to-[#1A1A40] hover:from-[#4B5E7A]/90 hover:to-[#1A1A40]/90 shadow-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 p-4"
          >
            <BarChart3 className="w-16 h-16 text-white mb-2" strokeWidth={1.5} />
            <span className="text-white font-semibold text-sm">Class Insights</span>
          </button>
        </div>
      </div>
    </div>
  );
}
