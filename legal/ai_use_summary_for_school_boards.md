# AI Use Summary — for School Boards and Procurement Review

**Status:** DRAFT — INTERNAL HANDOUT, NOT REVIEWED BY COUNSEL
**Purpose:** A one-page, plain-language summary of Laurel Education's AI use, intended to be handed to a school board's privacy/procurement office or referenced in an AI-use assessment. Every claim below is drawn directly from the current implementation and the documents in this folder — nothing here is aspirational.

---

**What the feature does.** Laurel Education can generate a *draft* report-card comment for a student, based only on the classroom observations a teacher has already recorded for that student. The teacher requests it; the teacher reviews, edits, and approves it before it's used anywhere official.

**What model is used.** Anthropic's Claude (`claude-opus-5`), accessed via Anthropic's commercial API.

**Is student data used to train the AI model?** No. Anthropic's Commercial Terms and Data Processing Addendum prohibit using API customer data to train its models. (See `anthropic_dpa_acceptance_record.md` in this folder.)

**Is the student's name sent to the AI?** No. The AI receives a placeholder (`"[STUDENT]"`) in place of the student's name and writes using it; the real name is substituted back in on Laurel Education's own servers after the AI's response is returned — the AI provider never receives it.

**Is a human always involved before the output is used?** Yes, by design and by contract. The AI's output is explicitly a draft. Laurel Education's Terms of Service require the teacher to review and edit it before relying on it in any official capacity — the product never presents AI output as a finished evaluation.

**Where is the data processed?** Laurel Education's application and database run on servers located in Canada (Montreal). The one exception is the AI inference call itself, which is processed on Anthropic's infrastructure in the United States — this is disclosed in the Privacy Policy, and Laurel Education monitors for a Canadian-region alternative.

**Is usage limited or monitored?** Yes. Requests are rate-limited per teacher (20 per hour) to prevent misuse, and every AI-generated evaluation that gets saved is captured by Laurel Education's internal audit trail, the same as any other student record change.

**Who is the subprocessor, and what governs them?** Anthropic, PBC. Their processing of any data submitted through their commercial API is governed by their Commercial Terms of Service and incorporated Data Processing Addendum. Anthropic commits to deleting all copies of customer data within 30 days of contract termination.

**What isn't sent to the AI at all?** Student ID numbers, grades, school names, and any data outside the specific observations selected for that evaluation request.

---

*For the full technical and risk analysis behind this summary, see `ai_report_generation_pia.md` in this folder. For questions about this feature or Laurel Education's data practices generally, contact [PRIVACY CONTACT EMAIL — see Privacy Policy].*
