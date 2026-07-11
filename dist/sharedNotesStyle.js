// How a shared-notes page is dressed: the sharer picks a pattern + background
// in the Share modal, it's saved on the link, and the public page renders it.
// This module is the data contract only — the visual catalog (gradients, the
// grain SVG, dot CSS) lives in each frontend that renders it.
export const SHARED_NOTES_PATTERNS = ["none", "grain", "dots"];
export const SHARED_NOTES_BACKGROUNDS = [
    "paper",
    "beige",
    "sand",
    "grey",
    "blue",
    "sage",
    "blush"
];
// What a share link exposes: the notes, the filled qualification sheet, or both.
// Saved on the link so the sharer's choice drives the public page.
export const SHARE_SCOPES = ["notes", "qualification", "both"];
// Default look for a new share: plain (no pattern) on a clean near-white desk.
export const DEFAULT_SHARED_NOTES_PATTERN = "none";
export const DEFAULT_SHARED_NOTES_BACKGROUND = "paper";
// New shares default to notes-only — today's behavior for existing links.
export const DEFAULT_SHARE_SCOPE = "notes";
export function coerceSharedNotesPattern(value) {
    return SHARED_NOTES_PATTERNS.includes(value)
        ? value
        : DEFAULT_SHARED_NOTES_PATTERN;
}
export function coerceSharedNotesBackground(value) {
    return SHARED_NOTES_BACKGROUNDS.includes(value)
        ? value
        : DEFAULT_SHARED_NOTES_BACKGROUND;
}
export function coerceShareScope(value) {
    return SHARE_SCOPES.includes(value)
        ? value
        : DEFAULT_SHARE_SCOPE;
}
