import type { TranscriptSpeakerMetadata } from "./ws.js";

// Shared speaker-label helpers. These were previously duplicated across the
// backend and the desktop client; they live here so both consumers share one
// implementation. Type-only import above keeps this module free of any runtime
// coupling to ws.ts (no import cycle).

// Job B — flatten a speaker object to a single display string: the first
// non-empty of name / email / id (each trimmed), else null.
export function speakerLabel(
  speaker: TranscriptSpeakerMetadata | null | undefined
): string | null {
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
export function relabelSpeakerChannel(input: {
  speakerId: string | null | undefined;
  counterpartName: string | null;
  fallback: string | null;
}): string | null {
  const channel = input.speakerId?.trim().toLowerCase();
  if (channel === "host") {
    return "You";
  }
  if (channel === "guest") {
    return input.counterpartName ?? "Them";
  }
  return input.fallback;
}
