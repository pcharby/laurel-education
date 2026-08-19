import { useEffect, useState } from 'react';

// Not in the standard DOM lib yet - this is the Chrome/Edge/Android
// install-prompt event shape (never fires on Safari or Firefox).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // iOS Safari's own (non-standard) flag - not covered by the media query above.
  (navigator as { standalone?: boolean }).standalone === true;

const isIOS = (): boolean => /iPad|iPhone|iPod/.test(navigator.userAgent);

// Chrome/Edge stopped showing an address-bar install icon automatically for
// most sites - install now lives inside a browser menu that's easy to miss.
// This captures the browser's own install event so the app can offer a
// visible, one-click "Install" button instead of relying on anyone finding
// that menu item themselves.
export function useInstallPrompt(): {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
} {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isStandalone());

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null); // a captured prompt can only be used once
    return outcome;
  };

  return { canInstall: deferredPrompt !== null, isInstalled, isIOS: isIOS(), promptInstall };
}
