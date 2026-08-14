import { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { getTeacherProfile } from './storage';
import { getSchoolYearLockStatus, SchoolYearLockInfo } from './schoolYearLock';

// Demo/anonymous accounts have no real teacherProfile behind them and must
// never engage this feature - same isDemo guard as useSchoolName.ts.
export function useSchoolYearLock(): SchoolYearLockInfo {
  const isDemo = auth.currentUser?.isAnonymous ?? false;
  const [info, setInfo] = useState<SchoolYearLockInfo>({ status: 'none', lockDate: null, archiveDate: null });

  useEffect(() => {
    if (isDemo) return;
    getTeacherProfile().then(profile => setInfo(getSchoolYearLockStatus(profile)));
  }, [isDemo]);

  return info;
}
