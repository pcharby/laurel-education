# Security Questionnaire — Self-Assessment

**Status:** DRAFT — VENDOR SELF-ASSESSMENT, NOT INDEPENDENTLY AUDITED
**Prepared:** August 18, 2026
**Related documents:** [Laurel_Education_Privacy_Policy.docx](Laurel_Education_Privacy_Policy.docx), [Laurel_Education_Incident_Response_Plan.docx](Laurel_Education_Incident_Response_Plan.docx), [ai_report_generation_pia.md](ai_report_generation_pia.md)

This answers the standard questions a school board (or any customer) security review typically asks. Every answer below reflects what is actually implemented, not an aspiration — each is grounded in the current codebase and Firebase project configuration. **This is a vendor self-assessment, not a substitute for an independent security audit or penetration test.** A reviewing board should treat this as a starting document, not a final answer.

## Encryption

| Question | Answer |
|---|---|
| Encryption in transit? | Yes — HTTPS/TLS for all traffic (Hosting, Firestore, Storage, Cloud Functions), enforced by Firebase/Google Cloud infrastructure. |
| Encryption at rest? | Yes — Google Cloud's default encryption (AES-256, Google-managed keys) for Firestore and Cloud Storage. |
| Customer-managed encryption keys (CMEK) available? | No. Only Google-managed keys are used today. |

## Access Control

| Question | Answer |
|---|---|
| How is tenant/customer data isolated? | Every record (student, class, observation, evaluation, rubric, strand) carries a `teacherId` field, and server-side security rules (`firestore.rules`) enforce that a request can only read or write a document whose `teacherId` matches the authenticated caller's own ID — not just checked in application code, but denied at the database layer regardless of what the client sends. |
| Is there a default-deny policy? | Yes. The last rule in `firestore.rules` and `storage.rules` is an explicit deny-all for anything not matched by an earlier rule. |
| Is access control covered by automated tests? | Yes, as of August 2026 — 46 tests run against the real Firestore/Storage emulators in CI on every change, covering cross-tenant isolation, immutable/system-only collections, and time-based access lockdown rules. |
| Role-based access control (RBAC) / admin roles? | No. There is currently no administrator, board, or institution-level role with visibility across multiple teachers' data — every account is a single, independent tenant. (Flagged as a governance gap in the accompanying procurement review.) |
| Multi-factor authentication? | Supported by the underlying platform (Firebase Authentication) but not yet enabled or offered to end users. |
| Password requirements? | Minimum 6 characters, enforced client- and server-side via Firebase Authentication. Self-service password reset is available. |

## Subprocessors

| Subprocessor | Purpose | Data location |
|---|---|---|
| Google Cloud / Firebase | Hosting, database, file storage, authentication | Canada (`northamerica-northeast1`, Montreal) |
| Anthropic, PBC | AI-assisted report commentary generation | United States (the one disclosed exception to Canadian data residency) |

Both subprocessor relationships are governed by the providers' standard commercial terms and data processing addenda; see the acceptance records in this folder. No further subprocessors are used. New subprocessors would be disclosed with advance notice under a signed customer agreement (see the DPA exhibit template in this folder).

## Application Security

| Question | Answer |
|---|---|
| Content Security Policy / security headers? | Yes — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security, and Permissions-Policy are all set on the Hosting layer. |
| Rate limiting / abuse prevention? | Yes — AI generation and file-upload endpoints are rate-limited per account (20 requests/hour). |
| Bot / automated-abuse protection (App Check)? | Not yet enabled. Planned but requires a coordinated client rollout before it can be safely turned on. |
| Dependency vulnerability monitoring? | Yes — automated weekly dependency update scanning (Dependabot) across both the web app and backend packages. |
| Secrets management? | API keys used server-side (the AI provider's key) are stored in a managed secret store (Google Cloud Secret Manager) and injected at runtime — never hardcoded or committed to source control. Client-side configuration values (Firebase project identifiers) are not secrets by design; access is governed entirely by the server-side rules above, not by keeping these values hidden. |
| Independent penetration test or code audit? | No. Not yet conducted. |

## Logging and Monitoring

| Question | Answer |
|---|---|
| Is access to personal data logged? | Yes — every creation, modification, and deletion of a student, observation, or evaluation record is automatically logged with the acting account and timestamp, in a log collection that is readable only by the record's own owner and never client-writable. |
| Log retention? | 2 years, after which entries are automatically and permanently purged on a daily schedule. |
| Are logs reviewed proactively, or only on incident? | Reactively today — reviewed when investigating a specific reported concern, not via a standing monitoring/alerting program. This reflects the vendor's current single-person operational scale. |

## Backup and Recovery

| Question | Answer |
|---|---|
| Is customer data backed up? | Data is stored in Google Cloud Firestore, which supports point-in-time recovery as a platform capability; whether it is actively enabled for this project should be confirmed directly rather than assumed. |
| Is a restore process tested? | Not on a regular schedule today, given current scale. |

## Incident Response

| Question | Answer |
|---|---|
| Is there a documented incident response plan? | Yes — see the Incident Response & Breach Notification Plan in this folder, covering detection, containment, investigation, and notification. |
| Who is responsible for incident response? | Currently one individual holds every role (technical, legal, communications). This is disclosed plainly in the plan itself as a scale limitation, not concealed. |
| Breach notification commitment? | The plan commits to notifying affected account holders as soon as feasible and, where the legal threshold is met, the applicable regulator. This is not yet backed by a contractually binding SLA to any specific customer — that would be established in a signed agreement. |

## Data Handling

| Question | Answer |
|---|---|
| Is customer data used to train AI models? | No, contractually prohibited by the AI subprocessor's terms, and not done by this application in any case. |
| Can a customer export their data? | Yes, self-service, at any time, per student or for a full account, in both human-readable and machine-readable (JSON) form. |
| Can a customer delete their data? | Yes, self-service and immediate — per student, or full account deletion (which also removes the underlying authentication credential). |
| Is data automatically deleted after a retention period? | Yes — accounts with no sign-in activity for 2 years are automatically and permanently deleted, including all associated files. |

## Summary

The strongest points of this assessment are the server-enforced tenant isolation (not just an application-layer convention), the automated access logging, and the fact these are now verified by automated tests rather than manual review alone. The most significant gaps for a board evaluating this vendor are the absence of any independent third-party validation of the above, the absence of role-based access for institutional oversight, and MFA not yet being available to end users. None of these are represented here as resolved — they are listed openly so a reviewing board can weigh them accurately.
