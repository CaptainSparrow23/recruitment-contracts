import type { TranscriptSpeakerMetadata } from "./ws.js";
export declare function speakerLabel(speaker: TranscriptSpeakerMetadata | null | undefined): string | null;
export declare function relabelSpeakerChannel(input: {
    speakerId: string | null | undefined;
    counterpartName: string | null;
    fallback: string | null;
}): string | null;
export declare function renamedSpeaker(names: Record<string, string> | null | undefined, rawId: string | null | undefined, label: string | null | undefined): string | null;
export declare function normalizeSpeakerName(raw: string | null | undefined): string | null;
