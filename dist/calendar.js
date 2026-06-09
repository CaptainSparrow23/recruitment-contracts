// Shared decorative tint palette: the colour a user picks for a manual event
// (the coloured bar in the agenda) AND the auto-assigned meeting-avatar tints
// (Recruitment_Copilot avatarColor.ts hashes into this same list). One source of
// truth so events and avatars stay visually consistent. Saturated enough to read
// as the thin agenda bar; ordered by hue. Provider events have no stored colour
// and fall back to a hashed tint from this list.
export const MANUAL_EVENT_COLORS = [
    "#d06b5a", // coral red
    "#c97b54", // terracotta
    "#e0b24a", // gold
    "#9aa84e", // olive
    "#6fae6f", // green
    "#4a9d8e", // teal
    "#5a8bc2", // blue
    "#8b7fd6", // lavender
    "#b56fbf", // orchid
    "#d67b9c", // rose
];
export const MANUAL_EVENT_TITLE_MAX_LENGTH = 200;
