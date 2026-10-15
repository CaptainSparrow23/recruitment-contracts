// Shared speaker-label helpers. These were previously duplicated across the
// backend and the desktop client; they live here so both consumers share one
// implementation. Type-only import above keeps this module free of any runtime
// coupling to ws.ts (no import cycle).
// Job B — flatten a speaker object to a single display string: the first
// non-empty of name / email / id (each trimmed), else null.
export function speakerLabel(speaker) {
    if (!speaker) {
        return null;
    }
    const name = typeof speaker.name === "string" ? speaker.name.trim() : "";
    if (name) {
        return name;
    }
    const email = typeof speaker.email === "string" ? speaker.email.trim() : "";
    if (email) {
        return email;
    }
    const id = typeof speaker.id === "string" ? speaker.id.trim() : "";
    return id || null;
}
// Job C — relabel a manual ("Phone call") audio channel to a persona:
// "host" (the recruiter's mic) → "You", "guest" (the counterpart) → the
// candidate's name, falling back to "Them". Any other speaker id is left to
// the caller-provided `fallback` (e.g. a named meeting participant's label).
export function relabelSpeakerChannel(input) {
    const channel = input.speakerId?.trim().toLowerCase();
    if (channel === "host") {
        return "You";
    }
    if (channel === "guest") {
        return input.counterpartName ?? "Them";
    }
    return input.fallback;
}
// The user's name for a transcript speaker, or null when none is set. Keyed on
// the raw id (the label only stands in for rows that never had one), and read
// as an own property so a key like "constructor" cannot leak a prototype value.
export function renamedSpeaker(names, rawId, label) {
    if (!names) {
        return null;
    }
    const key = rawId?.trim() || label?.trim() || "";
    if (!key || !Object.prototype.hasOwnProperty.call(names, key)) {
        return null;
    }
    const name = names[key];
    return typeof name === "string" && name.length > 0 ? name : null;
}
// Names land inside "[seg:N | name | time]" lines, so the delimiters and
// control characters become spaces; empty after trimming means "clear".
export function normalizeSpeakerName(raw) {
    if (typeof raw !== "string") {
        return null;
    }
    const cleaned = raw
        .replace(/[\u0000-\u001f\u007f|[\]]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    return cleaned.length > 0 ? cleaned : null;
}
