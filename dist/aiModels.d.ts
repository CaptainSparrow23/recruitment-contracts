export declare const AI_MODEL_IDS: readonly ["gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna", "gpt-5.5", "gpt-5.4", "gpt-5.4-mini", "gpt-5.4-nano", "claude-opus-4-8", "claude-sonnet-5", "claude-haiku-4-5-20251001"];
export type AiModelId = (typeof AI_MODEL_IDS)[number];
export declare function isAiModelId(value: unknown): value is AiModelId;
export declare const PREMIUM_AI_MODEL_IDS: readonly ["claude-opus-4-8", "gpt-5.6-sol"];
export declare function isPremiumAiModelId(id: AiModelId): boolean;
