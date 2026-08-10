// Canadian region for all functions in this codebase. Student names and
// observation content pass through generateEvaluation on the way to the
// Anthropic API - keeping the compute itself in Canada is a partial
// data-residency mitigation. The AI inference call still runs on
// Anthropic's (US) infrastructure regardless of this setting; full
// residency would require routing through Claude on Vertex AI pinned to
// a Canadian region instead of the direct Anthropic API.
export const REGION = 'northamerica-northeast1';
