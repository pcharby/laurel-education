import { Student } from './types';
import { firstNameOf } from './utils';

// Students are sorted by first name only - the first whitespace-separated
// token of Student.name. Works the same whether the name is a full name
// from the single-add flow ("Sarah Johnson") or an already-minimized
// bulk-import name ("Sarah J."), since the first token is the first name
// either way. Last name/initial only breaks ties between same-first-name
// students, matching how a teacher scans a printed class list.
export const compareStudentsByFirstName = (a: Student, b: Student): number =>
  firstNameOf(a.name).localeCompare(firstNameOf(b.name), undefined, { sensitivity: 'base' })
  || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
