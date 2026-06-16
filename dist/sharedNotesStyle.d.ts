export declare const SHARED_NOTES_PATTERNS: readonly ["none", "grain", "dots"];
export type SharedNotesPattern = (typeof SHARED_NOTES_PATTERNS)[number];
export declare const SHARED_NOTES_BACKGROUNDS: readonly ["paper", "beige", "sand", "grey", "blue", "sage", "blush"];
export type SharedNotesBackground = (typeof SHARED_NOTES_BACKGROUNDS)[number];
export declare const DEFAULT_SHARED_NOTES_PATTERN: SharedNotesPattern;
export declare const DEFAULT_SHARED_NOTES_BACKGROUND: SharedNotesBackground;
export declare function coerceSharedNotesPattern(value: unknown): SharedNotesPattern;
export declare function coerceSharedNotesBackground(value: unknown): SharedNotesBackground;
