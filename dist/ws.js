import { isAiModelId } from "./aiModels.js";
export const PROTOCOL_VERSION = "2026-04-01";
export const WEBSOCKET_PATH = "/ws";
export const CLIENT_MESSAGE_TYPES = {
    SESSION_START: "session:start",
    TRANSCRIPT_PARTICIPANT_INGEST: "transcript_participant_ingest",
    TRANSCRIPT_INGEST_PARTIAL: "transcript_ingest:partial",
    TRANSCRIPT_INGEST_FINAL: "transcript_ingest:final",
    COPILOT_PROMPT: "copilot:prompt",
    SESSION_STOP: "session:stop",
    SESSION_PING: "session:ping",
    SESSION_RESUME: "session:resume",
    SESSION_RETRY_FINALIZATION: "session:retry_finalization"
};
export const SERVER_MESSAGE_TYPES = {
    SESSION_STARTED: "session:started",
    TRANSCRIPT_PARTIAL: "transcript:partial",
    TRANSCRIPT_FINAL: "transcript:final",
    COPILOT_STATUS: "copilot:status",
    COPILOT_DEBUG_CONTEXT: "copilot:debug_context",
    COPILOT_RESULT: "copilot:result",
    QUALIFICATION_STATE: "qualification:state",
    SESSION_WARNING: "session:warning",
    SESSION_ERROR: "session:error",
    SESSION_ENDED: "session:ended",
    SESSION_ARTIFACT_STATUS: "session:artifact_status",
    SESSION_PONG: "session:pong",
    COPILOT_DELTA: "copilot:delta",
    COPILOT_NOTES_EDIT: "copilot:notes_edit",
    COPILOT_TIDY_NOTES: "copilot:tidy_notes"
};
export const AUDIO_STREAM_IDS = {
    MIC: "mic",
    SYSTEM_AUDIO: "system_audio"
};
export const CAPTURE_TRANSPORTS = {
    RECALL_DESKTOP_SDK: "recall_desktop_sdk"
};
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Hard cap on the inline screenshot payload (base64 characters). The WS server
// closes the WHOLE connection (1009) on frames over its 512KiB maxPayload —
// there is no per-message error for oversize frames — so the client must stay
// well under it and this cap is the server-side defense. 400K base64 chars
// (~300KB JPEG) leaves ~112KiB of headroom for the rest of the message.
export const COPILOT_PROMPT_IMAGE_MAX_BASE64_CHARS = 400_000;
export function isClientMessage(value) {
    if (!isRecord(value) || typeof value.type !== "string") {
        return false;
    }
    switch (value.type) {
        case CLIENT_MESSAGE_TYPES.SESSION_START:
            return isTimestampedSessionMessage(value, "startedAt");
        case CLIENT_MESSAGE_TYPES.TRANSCRIPT_PARTICIPANT_INGEST:
            return isTranscriptParticipantIngestMessage(value);
        case CLIENT_MESSAGE_TYPES.TRANSCRIPT_INGEST_PARTIAL:
        case CLIENT_MESSAGE_TYPES.TRANSCRIPT_INGEST_FINAL:
            return isTranscriptIngestMessage(value);
        case CLIENT_MESSAGE_TYPES.COPILOT_PROMPT:
            return isCopilotPromptMessage(value);
        case CLIENT_MESSAGE_TYPES.SESSION_STOP:
            return isTimestampedSessionMessage(value, "endedAt");
        case CLIENT_MESSAGE_TYPES.SESSION_PING:
            return isSessionPingMessage(value);
        case CLIENT_MESSAGE_TYPES.SESSION_RESUME:
            return isTimestampedSessionMessage(value, "resumedAt");
        case CLIENT_MESSAGE_TYPES.SESSION_RETRY_FINALIZATION:
            return typeof value.sessionId === "string";
        default:
            return false;
    }
}
// SESSION_PING is a connection-level keepalive: `sessionId` is optional (omitted
// when idle, a matching active session's id when in a call), `sentAt` required.
function isSessionPingMessage(value) {
    if (typeof value.sentAt !== "string") {
        return false;
    }
    return value.sessionId === undefined || isUuidString(value.sessionId);
}
function isTimestampedSessionMessage(value, timeKey) {
    if (!isUuidString(value.sessionId) || typeof value[timeKey] !== "string") {
        return false;
    }
    if (timeKey === "startedAt") {
        return (isCaptureConfig(value.captureConfig) &&
            isOptionalCalendarContext(value.calendarContext));
    }
    return true;
}
function isCaptureConfig(value) {
    return (isRecord(value) &&
        value.transport === CAPTURE_TRANSPORTS.RECALL_DESKTOP_SDK &&
        Object.keys(value).length === 1);
}
function isOptionalCalendarContext(value) {
    return (typeof value === "undefined" || value === null || isCalendarEvent(value));
}
function isCalendarEvent(value) {
    return (isRecord(value) &&
        typeof value.id === "string" &&
        value.id.trim().length > 0 &&
        isCalendarEventSource(value.source) &&
        (value.title === null ||
            (typeof value.title === "string" && value.title.trim().length > 0)) &&
        typeof value.startsAt === "string" &&
        value.startsAt.trim().length > 0 &&
        typeof value.endsAt === "string" &&
        value.endsAt.trim().length > 0 &&
        (value.timeZone === null ||
            (typeof value.timeZone === "string" &&
                value.timeZone.trim().length > 0)) &&
        Array.isArray(value.attendees) &&
        value.attendees.every(isCalendarAttendeePreview));
}
function isCalendarAttendeePreview(value) {
    return (isRecord(value) &&
        (value.displayName === null ||
            (typeof value.displayName === "string" &&
                value.displayName.trim().length > 0)) &&
        (value.email === null ||
            (typeof value.email === "string" && value.email.trim().length > 0)));
}
function isCalendarEventSource(value) {
    return value === "google" || value === "microsoft" || value === "manual";
}
function isCopilotPromptMessage(value) {
    if (!isRecord(value)) {
        return false;
    }
    if (!isUuidString(value.sessionId) ||
        !isUuidString(value.requestId) ||
        typeof value.requestedAt !== "string" ||
        value.requestedAt.trim().length === 0 ||
        !isCopilotIntent(value.intent)) {
        return false;
    }
    if (typeof value.modelId !== "undefined" && !isAiModelId(value.modelId)) {
        return false;
    }
    if (typeof value.image !== "undefined") {
        if ((value.intent !== "ask" && value.intent !== "help") ||
            !isCopilotPromptImage(value.image)) {
            return false;
        }
    }
    if (value.intent === "ask") {
        return (typeof value.question === "string" && value.question.trim().length > 0);
    }
    if (typeof value.question === "undefined") {
        return true;
    }
    return typeof value.question === "string";
}
function isCopilotPromptImage(value) {
    return (isRecord(value) &&
        value.mediaType === "image/jpeg" &&
        typeof value.base64 === "string" &&
        value.base64.length > 0 &&
        value.base64.length <= COPILOT_PROMPT_IMAGE_MAX_BASE64_CHARS &&
        // Single linear pass (~1ms at the cap); rejects data: prefixes, newlines,
        // and anything a provider would bounce, before a model call is spent on it.
        /^[A-Za-z0-9+/]+={0,2}$/.test(value.base64));
}
function isTranscriptIngestMessage(value) {
    if (!isRecord(value)) {
        return false;
    }
    return (isUuidString(value.sessionId) &&
        typeof value.eventId === "string" &&
        value.eventId.trim().length > 0 &&
        typeof value.receivedAt === "string" &&
        value.receivedAt.trim().length > 0 &&
        isTranscriptSource(value.source) &&
        typeof value.text === "string" &&
        value.text.trim().length > 0 &&
        isOptionalTimelineNs(value.segmentStartNs) &&
        isOptionalTimelineNs(value.segmentEndNs) &&
        isOptionalTranscriptSpeakerMetadata(value.speaker) &&
        isOptionalTranscriptWords(value.words) &&
        isOptionalTranscriptLanguageCode(value.languageCode) &&
        isOptionalTranscriptProviderMetadata(value.provider));
}
function isTranscriptParticipantIngestMessage(value) {
    if (!isRecord(value)) {
        return false;
    }
    return (isUuidString(value.sessionId) &&
        typeof value.eventId === "string" &&
        value.eventId.trim().length > 0 &&
        typeof value.receivedAt === "string" &&
        value.receivedAt.trim().length > 0 &&
        isTranscriptSpeakerMetadata(value.participant) &&
        typeof value.present === "boolean" &&
        isOptionalTranscriptProviderMetadata(value.provider));
}
function isOptionalTranscriptSpeakerMetadata(value) {
    return (typeof value === "undefined" ||
        value === null ||
        isTranscriptSpeakerMetadata(value));
}
function isTranscriptSpeakerMetadata(value) {
    return (isRecord(value) &&
        typeof value.id === "string" &&
        value.id.trim().length > 0 &&
        (typeof value.name === "undefined" ||
            value.name === null ||
            (typeof value.name === "string" && value.name.trim().length > 0)) &&
        (typeof value.email === "undefined" ||
            value.email === null ||
            (typeof value.email === "string" && value.email.trim().length > 0)) &&
        (typeof value.platform === "undefined" ||
            value.platform === null ||
            (typeof value.platform === "string" &&
                value.platform.trim().length > 0)) &&
        (typeof value.isHost === "undefined" || typeof value.isHost === "boolean") &&
        (typeof value.extraData === "undefined" ||
            value.extraData === null ||
            isRecord(value.extraData)));
}
function isTranscriptSource(value) {
    return value === "input_audio" || value === "model_response";
}
function isOptionalTranscriptWords(value) {
    return typeof value === "undefined" || (Array.isArray(value) && value.every(isTranscriptWord));
}
function isTranscriptWord(value) {
    return (isRecord(value) &&
        typeof value.text === "string" &&
        value.text.trim().length > 0 &&
        isOptionalFiniteNumber(value.startRelativeSeconds) &&
        isOptionalFiniteNumber(value.endRelativeSeconds));
}
function isOptionalTranscriptLanguageCode(value) {
    return (typeof value === "undefined" ||
        value === null ||
        (typeof value === "string" && value.trim().length > 0));
}
function isOptionalProviderTranscriptId(value) {
    return (typeof value === "undefined" ||
        value === null ||
        (typeof value === "string" && value.trim().length > 0));
}
function isOptionalTranscriptProviderMetadata(value) {
    return (typeof value === "undefined" ||
        value === null ||
        isTranscriptProviderMetadata(value));
}
function isTranscriptProviderMetadata(value) {
    return (isRecord(value) &&
        value.name === "recall" &&
        typeof value.eventType === "string" &&
        value.eventType.trim().length > 0 &&
        (typeof value.rawPayload === "undefined" ||
            value.rawPayload === null ||
            isRecord(value.rawPayload)));
}
function isOptionalFiniteNumber(value) {
    return (typeof value === "undefined" ||
        value === null ||
        (typeof value === "number" && Number.isFinite(value)));
}
function isOptionalTimelineNs(value) {
    return (typeof value === "undefined" ||
        (typeof value === "string" && /^\d+$/.test(value)));
}
function isCopilotIntent(value) {
    return (value === "say_next" ||
        value === "ask" ||
        value === "what_to_answer" ||
        value === "help");
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isUuidString(value) {
    if (typeof value !== "string") {
        return false;
    }
    return UUID_PATTERN.test(value.trim());
}
