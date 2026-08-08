import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FileText, Mic, Image as ImageIcon } from 'lucide-react';
import { LaurelLogo } from './LaurelLogo';

interface ObservationTypeSelectorProps {
  onSelectType: (type: 'text' | 'audio' | 'image') => void;
}

export function ObservationTypeSelector({ onSelectType }: ObservationTypeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <LaurelLogo height="lg" />
          </div>
          <p className="text-xl text-gray-700">Quick Observation Capture</p>
          <p className="text-gray-600 mt-2">Select how you'd like to record your observation</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card
            className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-200 border-2 hover:border-[#A5B4FC] bg-gradient-to-br from-white to-indigo-50"
            onClick={() => onSelectType('text')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-[#A5B4FC]/20 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-[#818CF8]" />
              </div>
              <CardTitle className="text-2xl">Text Note</CardTitle>
              <CardDescription className="text-base">
                Type your observation
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-gray-600">
              Quick and easy for detailed notes during or after class
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-200 border-2 hover:border-[#06B6D4] bg-gradient-to-br from-white to-cyan-50"
            onClick={() => onSelectType('audio')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-[#06B6D4]/20 rounded-full flex items-center justify-center mb-4">
                <Mic className="w-10 h-10 text-[#06B6D4]" />
              </div>
              <CardTitle className="text-2xl">Voice Memo</CardTitle>
              <CardDescription className="text-base">
                Record an audio note
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-gray-600">
              Perfect for capturing observations on the go
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-200 border-2 hover:border-gray-300"
            onClick={() => onSelectType('image')}
            style={{
              backgroundImage: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 25%, #F3F4F6 50%, #D1D5DB 75%, #E5E7EB 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)'
            }}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4"
                style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <ImageIcon className="w-10 h-10 text-gray-700" />
              </div>
              <CardTitle className="text-2xl">Photo</CardTitle>
              <CardDescription className="text-base">
                Upload a photo
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-gray-600">
              Capture student work or classroom moments
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Average time to capture: ~30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
