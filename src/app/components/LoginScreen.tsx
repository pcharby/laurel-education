import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { GraduationCap, CheckCircle, Loader2 } from 'lucide-react';
import { LaurelLogo } from './LaurelLogo';
import { auth } from '../../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  AuthProvider,
} from 'firebase/auth';

interface LoginScreenProps {
  onLogin: () => void;
  onDemo: () => void;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/operation-not-allowed': 'Email/password sign-in is not enabled for this project yet.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup. Please allow popups and try again.',
};

export function LoginScreen({ onLogin, onDemo }: LoginScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onLogin();
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      setError(AUTH_ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  const handleSsoSignIn = async (provider: AuthProvider) => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      setError(AUTH_ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => handleSsoSignIn(new GoogleAuthProvider());
  const handleMicrosoftSignIn = () => handleSsoSignIn(new OAuthProvider('microsoft.com'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A40] via-[#2E2B6E] to-[#6B5FE4] flex flex-col p-4">
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <LaurelLogo height="xl" />
            </div>
            <CardTitle className="text-2xl mb-1">Welcome to Laurel Education</CardTitle>
            <CardDescription className="text-sm italic text-[#6B5FE4]/80">
              Observation Intelligence for Human Development
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4 bg-gradient-to-br from-[#F0EEF8] to-[#EBE8F5] rounded-lg p-4 border-2 border-[#D4D0EE]">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#6B5FE4]" />
                What Laurel Education Does:
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Capture observations via text, audio, or photos in under 30 seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Centralize all student assessment data in one place</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Generate AI-powered report card commentary aligned with curriculum</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Track class and student progress with visual dashboards</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="h-11"
                  disabled={loading}
               />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="h-11"
                  disabled={loading}
               />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] hover:from-[#1A1A40]/90 hover:to-[#6B5FE4]/90 font-semibold gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
              </Button>

              <button
                type="button"
                onClick={toggleMode}
                disabled={loading}
                className="w-full text-center text-sm text-[#6B5FE4] hover:underline"
              >
                {mode === 'signup'
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Create one"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="h-11 border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-medium gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.87c2.27-2.09 3.55-5.17 3.55-8.89z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3.02c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.12A12 12 0 0 0 12 24z" />
                    <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.27a12 12 0 0 0 0 10.78z" />
                    <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.43-3.43C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.12C6.22 6.86 8.87 4.75 12 4.75z" />
                  </svg>
                  Google
                </Button>
                <Button
                  onClick={handleMicrosoftSignIn}
                  disabled={loading}
                  className="h-11 border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-medium gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 23 23">
                    <path fill="#F25022" d="M1 1h10v10H1z" />
                    <path fill="#7FBA00" d="M12 1h10v10H12z" />
                    <path fill="#00A4EF" d="M1 12h10v10H1z" />
                    <path fill="#FFB900" d="M12 12h10v10H12z" />
                  </svg>
                  Microsoft
                </Button>
              </div>

              <Button
                onClick={onDemo}
                disabled={loading}
                className="w-full h-11 border-2 border-[#6B5FE4] hover:bg-[#EBE8F5] font-semibold"
              >
                View Demo
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-white/80 text-sm pb-4 space-y-1">
        <p>© 2026 Laurel Education. Observation Intelligence for Human Development.</p>
        <p className="text-white/60 text-xs">Created by Paul Charbonneau</p>
      </div>
    </div>
  );
}
