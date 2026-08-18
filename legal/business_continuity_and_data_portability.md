# Business Continuity & Data Portability Statement

**Status:** DRAFT — INTERNAL POLICY STATEMENT, NOT REVIEWED BY COUNSEL
**Prepared:** August 18, 2026
**Related documents:** [Laurel_Education_Incident_Response_Plan.docx](Laurel_Education_Incident_Response_Plan.docx)

This document exists to answer a fair question directly, rather than leave it unaddressed: what happens to a school's data if Laurel Education becomes unavailable, is acquired, or ceases operating? It is written to be read honestly by a school board evaluating the vendor's operational risk — it does not overstate protections that do not exist yet.

## 1. Current Reality

Laurel Education is operated by a single individual (Paul Charbonneau). There is no team, no formal company structure confirmed at the time of writing, and no dedicated operations or support staff. This is disclosed plainly in the Incident Response Plan as well, and it is the single most significant operational risk factor a prospective institutional customer should weigh — no security control changes this fact.

## 2. What Already Exists Today

These are real, working capabilities, not commitments contingent on a future agreement:

- **Self-service data export.** Any account holder can export the full record for an individual student (all observations, evaluations, and metadata) in both a human-readable report and a machine-readable JSON file, at any time, without needing to contact the vendor.
- **Self-service account deletion.** An account holder can delete their entire account and all associated data immediately and independently, without depending on the vendor to act.
- **No proprietary lock-in on the exported format.** The JSON export uses plain, documented field names, not an obfuscated or proprietary structure requiring Laurel Education's own software to read.

Together, these mean a customer is never solely dependent on the vendor remaining operational to retrieve what they have entered — retrieval is a button, not a support ticket, provided the account itself is still reachable (see Section 3 for what happens if it is not).

## 3. What Does Not Exist Yet

Stated plainly, without euphemism:

- **No source code escrow arrangement.** If Laurel Education became unable to continue operating, there is no independent third party holding a copy of the source code that a customer, or a designated successor, could obtain.
- **No data escrow arrangement.** There is no independent third party holding a standing copy of customer data outside of Laurel Education's own Google Cloud project.
- **No named successor or continuity plan** for who would operate the service, or ensure a final data-export window, if the individual operating it became unavailable (illness, incapacity, or otherwise) without warning.
- **No contractual wind-down commitment** (e.g., a guaranteed minimum notice period before discontinuing the service, or a guaranteed final export opportunity) exists outside of what is described in Section 2 above, which depends on the service still being operational and reachable.

## 4. What a Board Should Reasonably Ask For

If proceeding despite the above — for example, under the limited pilot described in the accompanying procurement review — a board's agreement with Laurel Education should specifically address:

1. A **minimum advance notice period** before the service could be discontinued or a customer's access terminated for reasons other than cause, giving time to export data through the existing self-service tools.
2. Written acknowledgment that, absent a future escrow arrangement, **continuity is not guaranteed** in the event of the operator's sudden unavailability, and that the board's own risk tolerance for that scenario has been considered.
3. A commitment to notify customers promptly if control of the company, or its infrastructure, changes hands.

## 5. Path Forward

As Laurel Education grows beyond a single-person operation, the appropriate next steps — in rough order of practicality — are: formalizing a registered legal entity (a prerequisite for any escrow arrangement or enforceable continuity commitment); establishing a wind-down/notice commitment in the standard customer agreement; and, once justified by scale and revenue, a source code and/or data escrow arrangement with an independent escrow agent. None of these exist today, and this document does not claim otherwise.
