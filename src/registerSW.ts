import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

// Registered manually (injectRegister: false in vite.config.ts) so an
// available update can prompt a reload. Without this, a returning visitor's
// old service worker keeps serving its stale precached index.html/JS for
// the rest of that page view - the new version only activates in the
// background and would otherwise wait for the visitor's next unrelated
// navigation to actually take effect.
//
// Deliberately NOT an automatic/silent reload - a teacher could be
// mid-observation-entry with unsaved text when a background update check
// fires. A dismissible prompt lets them choose the moment.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    toast('A new version of Laurel Education is available.', {
      duration: Infinity,
      action: {
        label: 'Refresh',
        onClick: () => updateSW(true),
      },
    });
  },
});
