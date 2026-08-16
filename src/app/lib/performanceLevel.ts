import { PerformanceLevel } from './types';

// Single source of truth for the label/color pairing, shared between the
// picker (AddObservationDialog) and every place an observation's saved
// level is displayed back (history, student summary, data export).
export const PERFORMANCE_LEVELS: { value: PerformanceLevel; label: string; color: string }[] = [
  { value: 'needs-support', label: 'Needs Support', color: '#DC2626' },
  { value: 'still-learning', label: 'Still Learning', color: '#D97706' },
  { value: 'meets-expectations', label: 'Meets Expectations', color: '#16A34A' },
  { value: 'exceeds-expectations', label: 'Exceeds Expectations', color: '#2563EB' },
];

const BY_VALUE = new Map(PERFORMANCE_LEVELS.map(l => [l.value, l]));

export const performanceLevelLabel = (level: PerformanceLevel): string =>
  BY_VALUE.get(level)?.label ?? level;

export const performanceLevelColor = (level: PerformanceLevel): string =>
  BY_VALUE.get(level)?.color ?? '#6B7280';
