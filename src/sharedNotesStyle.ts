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

// What a share link exposes: the notes, the filled qualification sheet, or both.
// Saved on the link so the sharer's choice drives the public page.
export const SHARE_SCOPES = ["notes", "qualification", "both"] as const;
export type ShareScope = (typeof SHARE_SCOPES)[number];

// Default look for a new share: plain (no pattern) on a clean near-white desk.
export const DEFAULT_SHARED_NOTES_PATTERN: SharedNotesPattern = "none";
export const DEFAULT_SHARED_NOTES_BACKGROUND: SharedNotesBackground = "paper";
// New shares default to notes-only — today's behavior for existing links.
export const DEFAULT_SHARE_SCOPE: ShareScope = "notes";

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

export function coerceShareScope(value: unknown): ShareScope {
  return SHARE_SCOPES.includes(value as ShareScope)
    ? (value as ShareScope)
    : DEFAULT_SHARE_SCOPE;
}
