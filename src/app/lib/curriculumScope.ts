interface ScopedEntry {
  grade?: string;
  schoolId?: string;
}

// A Rubric/Strand entry applies to a given class's (grade, schoolId) if its
// own grade/schoolId is unset (applies everywhere for that subject - this
// is how every entry behaved before scoping existed, so old data keeps
// showing up exactly where it always did) or matches exactly.
export const matchesScope = (entry: ScopedEntry, grade: string, schoolId: string | undefined): boolean =>
  (entry.grade === undefined || entry.grade === grade)
  && (entry.schoolId === undefined || entry.schoolId === schoolId);
