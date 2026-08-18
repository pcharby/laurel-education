# Accessibility Statement

**Status:** DRAFT — REFLECTS A TARGETED REVIEW, NOT A FULL CONFORMANCE AUDIT
**Prepared:** August 18, 2026

This statement describes what has actually been checked and fixed in the Laurel Education application, and is deliberately specific about what has not. **It is not a claim of WCAG 2.1 Level AA conformance.** A board relying on this application should still commission an independent accessibility audit appropriate to its own procurement policy (e.g., under Ontario's AODA or equivalent provincial legislation) before treating accessibility as settled.

## What Was Reviewed

A targeted, source-code-level review covering:

- Every image element, for the presence of alternative text.
- Every interactive control built from a non-semantic element (e.g., a `<div>` acting as a button), which would be invisible to assistive technology and unreachable by keyboard.
- Every icon-only button (a control with no visible text label), for the presence of an accessible name (`aria-label`).
- Every form input and `<select>` element, for a programmatically associated label (`<label for>` / matching `id`), not merely a visually adjacent one.
- Focus-visibility: whether removing the browser's default focus outline (`outline-none`, used throughout the component library for custom styling) was paired with a replacement focus-visible style, rather than removing keyboard focus indication entirely.

## What Was Found and Fixed

- **Six icon-only buttons had no accessible name** — a screen reader announced them only as "button," with no indication of what they would do. These were controls to remove a curriculum strand or rubric tag, remove a class, delete a curriculum resource, remove a tag from an observation, delete an observation, and remove a school. Each now has a specific `aria-label` (e.g., "Remove tag Reading Comprehension," "Delete observation from Mar 4, 2026").
- **Two search inputs relied on placeholder text alone** — placeholder text is not reliably treated as a label by assistive technology and disappears once text is entered. Both now carry an explicit `aria-label`.
- **Two `<select>` elements had a visible label that was not programmatically connected to the control** — a sighted mouse user would see "School" or "Curriculum Strand" next to the dropdown, but a screen reader user tabbing to the control would hear nothing identifying it. Both are now correctly wired via matching `id`/`for` attributes.
- **Images already had appropriate alternative text**, and **no non-semantic clickable elements** (a `<div>` or `<span>` used as a fake button) were found anywhere in the application — both already correct before this review.
- **Focus indication is intact** — every place `outline-none` is used is paired with a `focus-visible` ring style, not a bare removal of keyboard focus indication.

## What Was Not Assessed

This review did not include, and this statement makes no claim about:

- **Color contrast** — no computed-contrast measurement was performed against the application's color palette. This is a common source of AA failures and should be checked directly (automated tooling can do this quickly) before relying on this statement.
- **Screen reader testing** — no testing was performed with actual assistive technology (e.g., NVDA, JAWS, VoiceOver); this review checked for the presence of the semantic information screen readers depend on, not the end-to-end experience of using one.
- **Keyboard-only navigation testing** — no end-to-end pass tabbing through every screen was performed; the review checked for the structural patterns (semantic elements, focus-visible styles) that keyboard accessibility depends on.
- **Radix UI primitives' own accessibility.** The application's dialogs, checkboxes, and radio groups are built on Radix UI, which ships strong accessibility behavior (focus trapping, keyboard interaction, ARIA roles) by default. This review did not independently re-verify that library's own conformance — it relied on Radix's own documented accessibility support.
- **Mobile screen reader / touch-target-size review.**
- **Any formal WCAG 2.1 success-criterion checklist**, worked through item by item.

## Bottom Line

The obvious, mechanically-detectable gaps found in this pass have been fixed. This is a reasonable-effort improvement, not a certification. Treat "not yet assessed" above as the actual scope of remaining risk, not as items presumed fine by omission.
