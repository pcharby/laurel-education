import './admin.js';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { REGION } from './region.js';

const resendApiKey = defineSecret('RESEND_API_KEY');

// Personal inbox for now - there's no support@ address until the real
// domain is in place. Update this once one exists.
const NOTIFY_EMAIL = 'pcharby@gmail.com';

interface BugReportData {
  category: 'bug' | 'feature-request' | 'other';
  description: string;
  teacherEmail: string | null;
  displayName: string | null;
  schoolName: string | null;
  screenTrail: string;
  userAgent: string;
  viewport: string;
  appVersion: string;
  createdAt: string;
}

const CATEGORY_LABELS: Record<BugReportData['category'], string> = {
  bug: 'Something is broken',
  'feature-request': 'Feature request',
  other: 'Something else',
};

// Notification only - the report itself already safely persisted in
// Firestore by the time this runs, so a failed send here just means a
// missed email, not lost data. Logged rather than thrown to avoid
// pointless retries against something like a bad API key.
export const notifyOnBugReport = onDocumentCreated(
  { document: 'bugReports/{reportId}', region: REGION, secrets: [resendApiKey] },
  async (event) => {
    const data = event.data?.data() as BugReportData | undefined;
    if (!data) return;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey.value()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Laurel Education <onboarding@resend.dev>',
        to: [NOTIFY_EMAIL],
        subject: `[Laurel Education] ${CATEGORY_LABELS[data.category]}`,
        text: [
          data.description,
          '',
          '---',
          `From: ${data.displayName ?? 'unknown'} <${data.teacherEmail ?? 'unknown'}>`,
          `School: ${data.schoolName ?? 'unknown'}`,
          `Screens visited: ${data.screenTrail}`,
          `Browser: ${data.userAgent}`,
          `Viewport: ${data.viewport}`,
          `App version: ${data.appVersion}`,
          `Submitted: ${data.createdAt}`,
        ].join('\n'),
      }),
    });

    if (!response.ok) {
      logger.error('Failed to send bug report notification email', {
        status: response.status,
        body: await response.text(),
      });
    }
  }
);
