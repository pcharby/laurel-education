# Anthropic Data Processing Addendum — Acceptance Record

**Status:** In effect automatically — no separate signing action required or available.
**How it applies:** Anthropic's DPA is incorporated by reference into its
[Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms),
which govern any Anthropic API/Console account (as opposed to the separate
Consumer Terms that govern Claude.ai). Laurel Education's `generateEvaluation`
Cloud Function calls the Anthropic API using an account under these
Commercial Terms, so the DPA already applies — there is no additional
click-through, unlike Google's Cloud DPA.
**DPA document:** https://www.anthropic.com/legal/data-processing-addendum
**Commercial Terms of Service:** https://www.anthropic.com/legal/commercial-terms
**Checked:** August 2026

## Key terms (per the current published DPA)

- **No training on customer data**: Anthropic is restricted from retaining
  or using Customer Personal Data "outside of the direct business
  relationship and for any purpose other than for the business purposes
  specified" — consistent with Anthropic's standard no-training-on-API-data
  policy.
- **Post-termination deletion**: within 30 days of contract termination,
  Anthropic deletes all copies of Customer Data.
- **Subprocessors**: Schedule 4 references a dynamic subprocessor list at
  a separate URL not yet located from the public DPA page — check the
  Anthropic Console account directly, or ask Anthropic support for the
  current link. Laurel Education has a 15-day right to object to any new
  subprocessor Anthropic adds.
- **Data residency**: no region-selection or data-residency option is
  offered in the DPA. This matches the Vertex AI / AWS Bedrock research
  finding from the compliance review: no Canadian-region option exists for
  Claude inference via any current path, which is why report-generation
  calls are pseudonymized before being sent (see
  [Laurel_Education_Privacy_Policy.docx](Laurel_Education_Privacy_Policy.docx),
  Section 6, and `functions/src/index.ts`).
- **Retention during active use**: the DPA does not specify a retention
  period for API inputs/outputs while the account is active (only the
  post-termination deletion commitment above). Worth confirming directly
  with Anthropic if a school board asks for a specific number.

## Still outstanding

- Locate and review the current subprocessor list (Schedule 4).
- If a school board specifically requires a counter-signed or
  company-name-populated copy rather than terms-incorporated-by-reference,
  that would need to be requested directly from Anthropic — the public DPA
  page gives no indication this is offered self-serve.
