// Shared decorative tint palette: the colour a user picks for a manual event
// (the coloured bar in the agenda) AND the auto-assigned meeting-avatar tints
// (Recruitment_Copilot avatarColor.ts hashes into this same list). One source of
// truth so events and avatars stay visually consistent. Provider events have no
// stored colour and fall back to a hashed tint from this list.
export const MANUAL_EVENT_COLORS = [
    "#e9a8b3", // rose
    "#ec9f86", // coral
    "#ebc485", // amber
    "#c9d488", // chartreuse
    "#a9cf94", // green
    "#8ccabf", // teal
    "#9db9e3", // blue
    "#aaa9e0", // indigo
    "#c5a9e2", // lilac
    "#dba6d4", // orchid
];
export const MANUAL_EVENT_TITLE_MAX_LENGTH = 200;
