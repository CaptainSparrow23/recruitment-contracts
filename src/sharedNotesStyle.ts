// How a shared-notes page is dressed: the sharer picks a pattern + background
// in the Share modal, it's saved on the link, and the public page renders it.
// This module is the data contract only — the visual catalog (gradients, the
// grain SVG, dot CSS) lives in each frontend that renders it.

export const SHARED_NOTES_PATTERNS = ["none", "grain", "dots"] as const;
export type SharedNotesPattern = (typeof SHARED_NOTES_PATTERNS)[number];

export const SHARED_NOTES_BACKGROUNDS = [
  "paper",
  "beige",
  "sand",
  "grey",
  "blue",
  "sage",
  "blush"
] as const;
export type SharedNotesBackground = (typeof SHARED_NOTES_BACKGROUNDS)[number];

// Default look for a new share: plain (no pattern) on a clean near-white desk.
export const DEFAULT_SHARED_NOTES_PATTERN: SharedNotesPattern = "none";
export const DEFAULT_SHARED_NOTES_BACKGROUND: SharedNotesBackground = "paper";

export function coerceSharedNotesPattern(value: unknown): SharedNotesPattern {
  return SHARED_NOTES_PATTERNS.includes(value as SharedNotesPattern)
    ? (value as SharedNotesPattern)
    : DEFAULT_SHARED_NOTES_PATTERN;
}

export function coerceSharedNotesBackground(
  value: unknown
): SharedNotesBackground {
  return SHARED_NOTES_BACKGROUNDS.includes(value as SharedNotesBackground)
    ? (value as SharedNotesBackground)
    : DEFAULT_SHARED_NOTES_BACKGROUND;
}
