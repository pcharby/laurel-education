// A CSV export's name column may be quoted/comma-separated with other
// fields - take the first column as the name and strip any surrounding
// quotes. A plain one-name-per-line paste has no commas, so this is a
// no-op for that common case.
const firstColumn = (line: string): string => line.split(',')[0].trim().replace(/^"|"$/g, '');

// Turns raw pasted/uploaded text (one name per line, or a CSV with the name
// in the first column) into a plain list of full names, ready to pass to
// resolveBulkImportNames. Shared by every "paste or upload a roster" entry
// point (BulkImportStudentsDialog, ManageClassRosterDialog).
export const parseNameListText = (rawText: string): string[] =>
  rawText.split('\n').map(firstColumn).filter(Boolean);

interface ParsedName {
  first: string;
  /** Empty when only a single name/word was given - no last name to draw a prefix from. */
  last: string;
}

const parseFullName = (raw: string): ParsedName => {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: '', last: '' };
  return {
    first: parts[0],
    last: parts.length > 1 ? parts[parts.length - 1] : '',
  };
};

const formatWithPrefix = (p: ParsedName, prefixLen: number): string => {
  if (!p.last) return p.first;
  return `${p.first} ${p.last.slice(0, Math.max(1, prefixLen))}.`;
};

// Turns a roster of full names into "First L." display names, importing
// only the first name and last initial per student - never the full last
// name. Two students who'd otherwise collide on first name + last initial
// (e.g. "Emma Thompson" and "Emma Taylor", both "Emma T.") grow their last-
// name prefix one letter at a time, only as far as needed to tell that
// specific cluster apart, so "Emma Chen" elsewhere in the same roster is
// left alone as plain "Emma C.". If two students are still identical once
// the last name itself is exhausted (true duplicates, or two bare first
// names with no last name at all), a numeric suffix breaks the tie so no
// two students ever end up with the same displayed name.
export const resolveBulkImportNames = (rawNames: string[]): string[] => {
  const parsed = rawNames.map(parseFullName);
  const results = new Array<string>(parsed.length);

  const assign = (indices: number[], prefixLen: number): void => {
    if (indices.length === 1) {
      results[indices[0]] = formatWithPrefix(parsed[indices[0]], prefixLen);
      return;
    }

    const groups = new Map<string, number[]>();
    for (const i of indices) {
      const key = parsed[i].last.slice(0, prefixLen).toLowerCase();
      const group = groups.get(key) ?? [];
      group.push(i);
      groups.set(key, group);
    }

    const exhausted = indices.every(i => parsed[i].last.length <= prefixLen);

    for (const group of groups.values()) {
      if (group.length === 1) {
        results[group[0]] = formatWithPrefix(parsed[group[0]], prefixLen);
      } else if (exhausted) {
        group.forEach((i, idx) => {
          results[i] = `${formatWithPrefix(parsed[i], prefixLen)} (${idx + 1})`;
        });
      } else {
        assign(group, prefixLen + 1);
      }
    }
  };

  const byFirstName = new Map<string, number[]>();
  parsed.forEach((p, i) => {
    const key = p.first.toLowerCase();
    const group = byFirstName.get(key) ?? [];
    group.push(i);
    byFirstName.set(key, group);
  });

  for (const indices of byFirstName.values()) {
    assign(indices, 1);
  }

  return results;
};
