/**
 * Formats a full student name to first name + last initial for display.
 * Full name is retained in storage; this is display-only masking.
 * e.g. "Emma Thompson" → "Emma T."
 *
 * Bulk-imported students (see bulkImportNames.ts) are already stored
 * pre-minimized - "Emma T.", or "Emma Th."/"Madonna (1)" when escalated to
 * disambiguate a collision. Re-running that through this masking would
 * collapse an escalated name like "Emma Thomp." back down to "Emma T.",
 * silently reintroducing the exact collision it was escalated to avoid. A
 * genuine full name's last word never ends in a bare period or a bare
 * "(N)", so that's a safe, unambiguous signal the name is already masked.
 */
export function formatStudentName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  const last = parts[parts.length - 1];
  if (last.endsWith('.') || /^\(\d+\)$/.test(last)) return fullName;
  const firstName = parts[0];
  const lastInitial = last.charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}
