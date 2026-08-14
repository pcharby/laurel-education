import { TeacherProfile } from './types';

const LOCK_GRACE_MS = 2 * 24 * 60 * 60 * 1000; // 2 days - mirrors firestore.rules' isTeacherLocked()
// 60 days - mirrors ARCHIVE_GRACE_MS in functions/src/schoolYearLockdown.ts.
// Teachers don't have to wait on this at all though - see archiveMyPreviousYear.
const ARCHIVE_GRACE_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

export interface SchoolYearLockInfo {
  status: 'none' | 'active' | 'locked';
  lockDate: Date | null;
  archiveDate: Date | null;
}

// Pure UI guidance only - the real enforcement is firestore.rules'
// isTeacherLocked() (blocks create/update once locked) and the
// schoolYearLockdownSweep Cloud Function (archives ARCHIVE_GRACE_MS after, or immediately via archiveMyPreviousYear). This
// mirrors that same math client-side so the UI can show status and disable
// buttons proactively, without waiting on a failed write to find out.
export const getSchoolYearLockStatus = (profile: TeacherProfile | null): SchoolYearLockInfo => {
  if (!profile?.schoolYearEndDate) {
    return { status: 'none', lockDate: null, archiveDate: null };
  }

  const endDate = profile.schoolYearEndDate.toDate();
  const lockDate = new Date(endDate.getTime() + LOCK_GRACE_MS);
  const archiveDate = new Date(endDate.getTime() + ARCHIVE_GRACE_MS);
  const status = Date.now() >= lockDate.getTime() ? 'locked' : 'active';

  return { status, lockDate, archiveDate };
};
