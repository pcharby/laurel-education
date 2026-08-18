# Privacy Impact Assessment — AI Report Generation

**Status:** DRAFT — INTERNAL ANALYTICAL RECORD, NOT REVIEWED BY COUNSEL
**Feature assessed:** `generateEvaluation` Cloud Function (`functions/src/index.ts`)
**Prepared:** August 18, 2026
**Related documents:** [Laurel_Education_Privacy_Policy.docx](Laurel_Education_Privacy_Policy.docx) (Section 6), [Laurel_Education_Terms_of_Service.docx](Laurel_Education_Terms_of_Service.docx) (Section 6), [anthropic_dpa_acceptance_record.md](anthropic_dpa_acceptance_record.md)

This is not a substitute for a Privacy Impact Assessment conducted or reviewed by qualified privacy counsel, and should be treated as raw material for that review rather than a finished compliance artifact — the same caveat carried by every other document in this folder.

## 1. Purpose and Necessity

The feature generates a draft report-card commentary (a summary, a list of strengths, and a list of areas for improvement) from a teacher's own classroom observations for one student. It exists to save teachers time drafting report cards; it does not make any decision about a student — the output is explicitly a draft requiring human review before use (Terms of Service, Section 6).

## 2. Data Flow

1. A teacher requests an evaluation for one student from within the app.
2. The client sends the student's display name and their recorded observations (free-text content, type, subject, tags, and performance level) to the `generateEvaluation` Cloud Function.
3. The function is rate-limited to 20 calls per teacher per hour (`enforceRateLimit`, `functions/src/rateLimit.ts`) before any further processing occurs.
4. The function builds a prompt that refers to the student only as `"[STUDENT]"` — **the student's real name is never included in what is sent to Anthropic.**
5. The prompt (with observation content as entered) is sent to Anthropic's API (model: `claude-opus-5`), running on Anthropic's infrastructure in the United States.
6. Anthropic returns a structured response (summary / strengths / areas for improvement), still using the `"[STUDENT]"` placeholder.
7. The Cloud Function substitutes the real student name back into the response text (`substitutePlaceholder`) before returning it to the teacher — this substitution happens entirely on Laurel Education's own infrastructure (`northamerica-northeast1`, Montreal), after the AI provider is no longer involved.
8. The teacher reviews, edits, and (if generated as part of an evaluation record) the result is saved and captured by the existing audit trail (`auditEvaluations`).

## 3. What Is Pseudonymized, and What Isn't

| Data element | Sent to Anthropic? | Notes |
|---|---|---|
| Student's real name | **No** | Replaced with the literal placeholder `[STUDENT]`; substituted back in after the AI response returns, entirely on Laurel Education's own infrastructure. |
| Observation free-text content | **Yes, as entered** | This is the substantive input the AI needs to write useful commentary. No automated scanning, redaction, or filtering is applied. |
| Observation type / subject / tags / performance level | **Yes, as entered** | Structured metadata, not free text — low re-identification risk on its own. |
| Student ID, grade, school | **No** | Not part of the request payload at all. |

**Residual risk:** because free-text content is sent verbatim, a teacher who types another student's name, or a medical/disciplinary detail, into an observation transmits that detail to Anthropic along with the rest of the text. The Privacy Policy asks teachers to avoid this (Section 6), but nothing in the product enforces it today.

**Founder decision on file (August 18, 2026):** an automated client-side check — flagging observation text that appears to contain another enrolled student's name before sending it for AI generation — was considered and **deliberately not built**, on the reasoning that student names are already reduced to first name + last initial everywhere in the app's own conventions (see `resolveBulkImportNames`), which meaningfully lowers the practical risk this control would have addressed. Recorded here so the reasoning is available if the risk profile is revisited (e.g., if the app ever accepts or displays full last names anywhere).

## 4. Data Location and Cross-Border Transfer

- The Cloud Function itself, and the Firestore database it reads from and writes to, run in `northamerica-northeast1` (Montreal, Canada).
- The Anthropic API call is the one identified exception: it is processed on Anthropic's infrastructure in the United States. No Canadian-region hosting option for Claude inference has been identified as of this assessment (see `functions/src/region.ts` and `anthropic_dpa_acceptance_record.md`).
- Per Anthropic's Commercial Terms and DPA (as summarized in `anthropic_dpa_acceptance_record.md`): Anthropic does not train on this data, and deletes all copies within 30 days of contract termination. No specific retention period is stated for API inputs/outputs during active use — worth confirming directly with Anthropic if a school board asks for a number.

## 5. Safeguards Already in Place

- **Pseudonymization** of the direct identifier (student name) — verified against the actual implementation in `functions/src/index.ts`, not just asserted.
- **Rate limiting** (20 requests/hour/teacher) reduces both cost-abuse and the volume of data that could be exposed by a compromised or careless account in a short window.
- **Mandatory human review** — the Terms of Service (Section 6) makes the teacher responsible for reviewing and editing AI output before relying on it for any official purpose; the product does not present AI output as final.
- **Audit trail** — a saved evaluation is captured by the existing `auditEvaluations` trigger, same as any other student record.
- **Authentication required** — `generateEvaluation` throws `unauthenticated` for any unauthenticated caller; only a signed-in teacher can invoke it, and only for their own students (enforced by the surrounding app, not by this function directly — see `firestore.rules` for the isolation guarantee on the underlying data).

## 6. Residual Risks and Recommended Mitigations

| Risk | Severity | Mitigation status |
|---|---|---|
| Free-text observation content may contain a second student's identifying information | Low–Medium | Not automated; addressed today only by Privacy Policy language asking teachers to avoid it. Revisit if the risk profile changes (see Section 3). |
| Cross-border transfer of observation content to the US for inference | Medium | Disclosed transparently in the Privacy Policy (Section 7); monitored for a Canadian-region alternative. No further mitigation available today short of switching AI providers or hosting paths. |
| AI-generated content may be inaccurate or inappropriate if relied on without review | Medium | Mitigated by the mandatory-review requirement in the Terms of Service; not a privacy risk per se, but relevant to overall risk posture. |
| No signed/executed DPA on file with Anthropic (only DPA-by-incorporation analysis) | Medium | Tracked separately — see `anthropic_dpa_acceptance_record.md`, "Still outstanding." |

## 7. Recommendation

The feature's core design — pseudonymize the identifier, disclose the exception transparently, require human review — is sound and matches what's actually implemented. The two items worth closing before this assessment is relied upon in a school-board conversation: (1) confirm the Anthropic DPA position in writing (see the acceptance record), and (2) have this assessment itself reviewed by counsel alongside the Privacy Policy and Terms of Service.
