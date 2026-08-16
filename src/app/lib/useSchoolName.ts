import { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { getTeacherProfile } from './storage';

// Shared with the multi-school header override (see ClassSelector.tsx/
// StudentSummarySelector.tsx): whichever name is currently shown in the
// header, the badge is always just its first letter.
export const badgeLetterFor = (name: string): string => name.charAt(0).toUpperCase();

// Every screen's header shows a school badge. Demo/anonymous accounts keep
// the fixed sample school name (matching the rest of the demo experience -
// see DEMO_CLASSES in ClassSelector.tsx); real accounts show the school
// name from their profile once set, or a generic placeholder until then.
export function useSchoolName(): { schoolName: string; badgeLetter: string } {
  const isDemo = auth.currentUser?.isAnonymous ?? false;
  const [schoolName, setSchoolName] = useState(isDemo ? 'Riverside Elementary' : 'Your School');

  useEffect(() => {
    if (isDemo) return;
    getTeacherProfile().then(profile => {
      if (profile?.schoolName) setSchoolName(profile.schoolName);
    });
  }, [isDemo]);

  return { schoolName, badgeLetter: badgeLetterFor(schoolName) };
}
