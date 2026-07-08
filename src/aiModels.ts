// Canonical set of selectable AI model ids, shared across the picker UI, the
// chat/copilot wire, and the backend provider layer — one source of truth for
// the allowlist. The backend registry keys its capability table off these ids;
// the frontend picker derives its options from them. Provider/capability detail
// deliberately lives on each side (frontend UI metadata, backend modelRegistry),
// not here — this module is just the id vocabulary + a runtime guard.
export const AI_MODEL_IDS = [
  "gpt-5.5",
  "gpt-5.4",
  "gpt-5.4-mini",
  "gpt-5.4-nano",
  "claude-opus-4-8",
  "claude-sonnet-5",
  "claude-haiku-4-5-20251001"
] as const;

export type AiModelId = (typeof AI_MODEL_IDS)[number];

export function isAiModelId(value: unknown): value is AiModelId {
  return (
    typeof value === "string" &&
    (AI_MODEL_IDS as readonly string[]).includes(value)
  );
}
