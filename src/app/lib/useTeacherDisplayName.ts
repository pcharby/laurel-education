import { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { getTeacherProfile } from './storage';

// Demo accounts have no real profile - same isDemo guard as useSchoolName.ts.
// Real accounts show their chosen display name once set; before that,
// callers should omit the name from a greeting entirely rather than
// falling back to the raw email address.
export function useTeacherDisplayName(): string | null {
  const isDemo = auth.currentUser?.isAnonymous ?? false;
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) return;
    getTeacherProfile().then(profile => {
      if (profile?.displayName) setDisplayName(profile.displayName);
    });
  }, [isDemo]);

  return displayName;
}
