import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { ArrowLeft, Lock, Fingerprint, Save } from 'lucide-react';
import { toast } from 'sonner';
import { LaurelLogo } from './LaurelLogo';

interface PasswordManagementProps {
  onBack: () => void;
}

export function PasswordManagement({ onBack }: PasswordManagementProps) {
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleSave = () => {
    toast.success('Security settings updated successfully!');
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
        <h2 className="text-xl font-semibold text-gray-800">Password & Security</h2>
        <p className="text-sm text-gray-600">Manage your account security settings</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="border-l-4 border-l-[#767F93]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#767F93]" />
              <CardTitle className="text-base">Change Password</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
             />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
             />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
             />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#6B5FE4]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-[#6B5FE4]" />
              <CardTitle className="text-base">Biometric Authentication</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">Enable Biometric Login</p>
                <p className="text-sm text-gray-600">Use fingerprint or face ID to sign in</p>
              </div>
              <Switch
                checked={biometricEnabled}
                onCheckedChange={setBiometricEnabled}
             />
            </div>
            {biometricEnabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> You'll be prompted to set up biometric authentication on your next login.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-700">
              <strong>Security Tip:</strong> Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
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
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}
