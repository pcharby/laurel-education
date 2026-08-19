import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Download, CheckCircle2, Share } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';
import { useInstallPrompt } from '../lib/useInstallPrompt';

interface InstallAppProps {
  onBack: () => void;
}

export function InstallApp({ onBack }: InstallAppProps) {
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstallPrompt();

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      toast.success('Installed! Look for Laurel Education on your home screen or apps list.');
    } else if (outcome === 'dismissed') {
      toast('No problem - you can install any time from this screen.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col" style={{ backgroundColor: 'rgba(91, 155, 213, 0.08)' }}>
      <div className="bg-white/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center gap-3 mb-3">
          <Button size="sm" onClick={onBack} className="hover:bg-white/40">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <LaurelLogo height="md" showProductName />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Install the App</h2>
        <p className="text-sm text-gray-600">Get one-tap access from your home screen or dock</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isInstalled ? (
          <Card className="border-l-4 border-l-green-600">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <CardTitle className="text-base">You're already using the installed app</CardTitle>
              </div>
            </CardHeader>
          </Card>
        ) : canInstall ? (
          <Card className="border-l-4 border-l-[#6B5FE4]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#6B5FE4]" />
                <CardTitle className="text-base">Ready to install</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Installs like any other app - no App Store needed, and you'll always get the latest version automatically.
              </p>
              <Button
                onClick={handleInstall}
                className="w-full h-12 bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] hover:from-[#1A1A40]/90 hover:to-[#6B5FE4]/90 font-semibold gap-2"
              >
                <Download className="w-5 h-5" />
                Install App
              </Button>
            </CardContent>
          </Card>
        ) : isIOS ? (
          <Card className="border-l-4 border-l-[#6B5FE4]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Share className="w-5 h-5 text-[#6B5FE4]" />
                <CardTitle className="text-base">Add to your Home Screen</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Tap the <strong>Share</strong> button in Safari (the square with an arrow)</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                <li>Tap <strong>Add</strong> - Laurel Education will appear as an app icon</li>
              </ol>
              <p className="text-xs text-gray-500 mt-3">
                This only works in Safari - other iOS browsers don't support adding apps to the Home Screen.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-l-4 border-l-gray-400">
            <CardHeader>
              <CardTitle className="text-base">Installing from this browser</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Look for an "Install" or "Add to Home Screen" option in your browser's menu. If it's not available, try opening this page in Chrome or Edge instead.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
