// Canonical set of selectable AI model ids, shared across the picker UI, the
// chat/copilot wire, and the backend provider layer — one source of truth for
// the allowlist. The backend registry keys its capability table off these ids;
// the frontend picker derives its options from them. Provider/capability detail
// deliberately lives on each side (frontend UI metadata, backend modelRegistry),
// not here — this module is just the id vocabulary + a runtime guard.
// Retired picker ids stay listed: installed older apps still send them, and the
// copilot message validator rejects an unknown id outright.
export const AI_MODEL_IDS = [
    "gpt-6.1-sol",
    "gpt-6-luna",
    "gpt-5.6-sol",
    "gpt-5.6-terra",
    "gpt-5.6-luna",
    "gpt-5.5",
    "gpt-5.4",
    "gpt-5.4-mini",
    "gpt-5.4-nano",
    "claude-opus-5-5",
    "claude-sonnet-5-5",
    "claude-haiku-5-5",
    "claude-opus-5",
    "claude-sonnet-5",
    "claude-haiku-4-5-20251001"
];
export function isAiModelId(value) {
    return (typeof value === "string" &&
        AI_MODEL_IDS.includes(value));
}
