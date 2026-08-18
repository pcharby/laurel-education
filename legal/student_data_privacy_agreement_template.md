# Student Data Privacy Agreement — Exhibit Template

**Status:** DRAFT FOR LEGAL REVIEW — NOT YET IN EFFECT — INTERNAL TEMPLATE
**Last Updated:** August 18, 2026

This is a working draft prepared to reflect Laurel Education's actual technical practices as of August 2026. It has not been reviewed by a lawyer and must not be sent to a school or school board as a binding exhibit until reviewed by qualified legal counsel familiar with PIPEDA and applicable provincial privacy legislation (e.g., Ontario's MFIPPA, BC's FOIPPA, Alberta's FOIP, Quebec's Law 25). Text in bold red brackets marks information Laurel Education must supply, or that must be negotiated with the specific board. This exhibit is intended to attach to, and supplement, the Terms of Service — it does not replace it.

**Why this document exists:** public school boards are governed by their own province's freedom-of-information/privacy statute, not PIPEDA directly, and routinely require a vendor to sign a data-sharing exhibit meeting a specific template (or their own) before onboarding — a general Terms of Service page does not usually satisfy that requirement on its own. This exhibit collects, in one place, the information a board's privacy office typically asks for.

---

## 1. Parties and Roles

This Exhibit is between **[SCHOOL / SCHOOL BOARD NAME]** ("the **Board**") and **[LAUREL EDUCATION LEGAL ENTITY NAME]** ("**Laurel Education**"), and supplements the Terms of Service governing the Board's (and its authorized teachers') use of the Laurel Education service.

For the purposes of this Exhibit and applicable privacy law:

- The **Board** is the data controller (or "data custodian"/"head" under applicable provincial legislation) for Student Data entered by its teachers.
- **Laurel Education** is a data processor / service provider, acting only on the Board's instructions (as expressed through the ordinary use of the Service by the Board's authorized teachers) and for no other purpose.

## 2. Definitions

- **"Student Data"** means personal information about a student entered into the Service by an authorized teacher, including student name, grade level, classroom observations, and AI-generated report commentary drafts.
- **"Service"** means the Laurel Education web application.
- **"Subprocessor"** means a third party engaged by Laurel Education to process Student Data on its behalf.

## 3. Scope and Purpose of Processing

Laurel Education processes Student Data solely to provide the Service: capturing classroom observations, organizing them by student and subject, and generating draft report-card commentary at a teacher's request. Laurel Education does not process Student Data for any other purpose, including:

- Advertising, marketing, or behavioral profiling of students;
- Sale, rental, or other disclosure of Student Data to third parties, except the Subprocessors named below;
- Training artificial intelligence or machine learning models.

## 4. Categories of Student Data Processed

- Student first name and grade level (and last initial only, where a bulk class list is imported — full last names are never retained through that path).
- Classroom observations: free-text content, subject, observation type, tags, and recorded performance level.
- AI-generated report-card commentary drafts.

Laurel Education does not collect Student Data independently — it stores only what an authorized teacher chooses to enter.

## 5. Subprocessors

| Subprocessor | Role | Data location | Governing terms |
|---|---|---|---|
| Google Cloud / Firebase | Application hosting, database (Firestore), file storage, authentication | Canada (`northamerica-northeast1`, Montreal) | Google Cloud Data Processing Addendum (accepted — see `google_cloud_dpa_acceptance_record.md`) |
| Anthropic, PBC | AI-assisted report-commentary generation | United States — the one exception to Canadian data residency, disclosed in full in the Privacy Policy (Section 7) and the accompanying Privacy Impact Assessment (`ai_report_generation_pia.md`) | Anthropic Commercial Terms of Service and incorporated Data Processing Addendum (see `anthropic_dpa_acceptance_record.md`) |

Laurel Education will provide the Board with reasonable advance notice before adding a new Subprocessor that will process Student Data, and will give the Board an opportunity to object on reasonable privacy or security grounds. **[NOTICE PERIOD — TO BE NEGOTIATED, e.g. 30 days]**

## 6. Data Location and Cross-Border Transfer

Student Data is stored and processed on infrastructure located in Canada, with one disclosed exception: the specific AI inference call described in Section 5 above is processed on infrastructure located in the United States. Laurel Education monitors for a Canadian-region hosting option for that call and will migrate if one becomes available equivalent to what's stated in the Privacy Policy.

## 7. Security Measures

Laurel Education maintains the following technical and organizational measures, detailed further in its Incident Response & Breach Notification Plan and Privacy Policy (Section 11):

- Encryption of Student Data in transit (TLS) and at rest (Google Cloud default encryption).
- Server-enforced data isolation: one teacher's account cannot read or write another teacher's data, including another teacher at the same Board, enforced at the database rule level rather than solely in application code.
- Rate limiting on AI-generation requests and other automated abuse vectors.
- Automated audit logging of the creation, modification, and deletion of Student Data records.
- A documented incident response and breach notification process (see Section 9 below).

## 8. Data Subject Rights Support

Laurel Education provides self-service tools that support the Board's obligations to individuals under applicable privacy and education law:

- **Access:** a teacher can export the full record held for an individual student (observations, evaluations, and metadata) at any time from within the Service.
- **Correction:** most Student Data fields are directly editable by the authorized teacher.
- **Deletion:** a teacher can permanently delete an individual student's record (and all associated observations and evaluations), or their entire account and all associated data, at any time from within the Service. Both actions are immediate.

Because Laurel Education's direct relationship is with the Board's teachers rather than with students or parents/guardians, requests from a parent or guardian should be directed to the Board or the relevant teacher in the first instance, consistent with the Board's own policies.

## 9. Breach Notification

In the event of a security incident affecting Student Data, Laurel Education will notify the Board **[TIMEFRAME — TO BE NEGOTIATED, e.g. without undue delay and in no case later than 72 hours after confirming the incident meets the notification threshold]**, following the process set out in its Incident Response & Breach Notification Plan. The Board acknowledges it may have its own separate breach-notification obligations under its provincial legislation and remains responsible for its own regulatory notifications; Laurel Education's notification to the Board is intended to support, not replace, that process.

## 10. Data Retention and Deletion on Termination

- Student Data is retained only for as long as the Board's (or an individual teacher's) account remains active, subject to the automated inactivity-based deletion described in the Privacy Policy (accounts inactive for 2 years are automatically and permanently deleted).
- Upon termination of the Board's agreement with Laurel Education, or upon written request, Laurel Education will delete all Student Data associated with the Board's teachers within **[TERMINATION DELETION TIMEFRAME — TO BE NEGOTIATED]** of the termination date or request, whichever is later, except to the extent retention is required by law.

## 11. Audit and Compliance

Upon reasonable advance notice, Laurel Education will respond in writing to reasonable requests from the Board to confirm compliance with this Exhibit, including providing a copy of its current Incident Response Plan and this Privacy Impact Assessment for the AI feature. **[FULL ON-SITE OR THIRD-PARTY AUDIT RIGHTS — TO BE NEGOTIATED IF REQUIRED BY THE BOARD; NOT OFFERED BY DEFAULT GIVEN LAUREL EDUCATION'S CURRENT SCALE]**

## 12. Term

This Exhibit remains in effect for as long as the underlying Terms of Service between the Board and Laurel Education remain in effect.

---

**Signatures**

For the Board: **[NAME, TITLE, DATE]**

For Laurel Education: **[NAME, TITLE, DATE]**
