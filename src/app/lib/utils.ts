/**
 * Formats a full student name to first name + last initial for display.
 * Full name is retained in storage; this is display-only masking.
 * e.g. "Emma Thompson" → "Emma T."
 */
export function formatStudentName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}
