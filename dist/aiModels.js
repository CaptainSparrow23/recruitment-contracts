// Canonical set of selectable AI model ids, shared across the picker UI, the
// chat/copilot wire, and the backend provider layer — one source of truth for
// the allowlist. The backend registry keys its capability table off these ids;
// the frontend picker derives its options from them. Provider/capability detail
// deliberately lives on each side (frontend UI metadata, backend modelRegistry),
// not here — this module is just the id vocabulary + a runtime guard.
export const AI_MODEL_IDS = [
    "gpt-5.6-sol",
    "gpt-5.6-terra",
    "gpt-5.6-luna",
    "gpt-5.5",
    "gpt-5.4",
    "gpt-5.4-mini",
    "gpt-5.4-nano",
    "claude-opus-4-8",
    "claude-sonnet-5",
    "claude-haiku-4-5-20251001"
];
export function isAiModelId(value) {
    return (typeof value === "string" &&
        AI_MODEL_IDS.includes(value));
}
// Models that require a paid tier. Free tier keeps only the fastest model per
// provider (gpt-5.6-luna / claude-haiku-4-5); both the Balanced and Thinking
// tiers are paid. The picker shows them for everyone but locks them for
// free-tier users (UX only); the backend is the authoritative gate (see
// resolveEntitledModel + resolveBillingGates), and ONLY the chat + copilot
// surfaces route through that gate. The pinned worker models — doc/template fill
// (TEMPLATE_FILL_MODEL), template-question extraction, notes tidying — resolve
// via resolveModel with no entitlement check, so they keep running claude-sonnet-5
// for every tier regardless of what's premium here. Kept in contracts —
// dependency-free, alongside the id vocabulary — so both the frontend picker and
// the backend read one source of truth. The tier threshold lives on each side.
export const PREMIUM_AI_MODEL_IDS = [
    "claude-opus-4-8",
    "gpt-5.6-sol",
    "claude-sonnet-5",
    "gpt-5.6-terra"
];
export function isPremiumAiModelId(id) {
    return PREMIUM_AI_MODEL_IDS.includes(id);
}
