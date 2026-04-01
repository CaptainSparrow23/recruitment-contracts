export const PROTOCOL_VERSION = "2026-04-01";
export const WEBSOCKET_PATH = "/ws";
export const CLIENT_MESSAGE_TYPES = {
    SESSION_START: "session:start",
    TRANSCRIPT_INGEST_PARTIAL: "transcript_ingest:partial",
    TRANSCRIPT_INGEST_FINAL: "transcript_ingest:final",
    COPILOT_PROMPT: "copilot:prompt",
    SESSION_STOP: "session:stop",
    SESSION_PING: "session:ping"
};
export const SERVER_MESSAGE_TYPES = {
    SESSION_STARTED: "session:started",
    TRANSCRIPT_PARTIAL: "transcript:partial",
    TRANSCRIPT_FINAL: "transcript:final",
    COPILOT_STATUS: "copilot:status",
    COPILOT_RESULT: "copilot:result",
    QUALIFICATION_STATE: "qualification:state",
    SESSION_WARNING: "session:warning",
    SESSION_ERROR: "session:error",
    SESSION_ENDED: "session:ended",
    SESSION_ARTIFACT_STATUS: "session:artifact_status",
    SESSION_PONG: "session:pong",
    COPILOT_DELTA: "copilot:delta",
    RED_FLAGS_STATE: "red_flags:state"
};
export const AUDIO_STREAM_IDS = {
    MIC: "mic",
    SYSTEM_AUDIO: "system_audio"
};
export const CAPTURE_TRANSPORTS = {
    RECALL_DESKTOP_SDK: "recall_desktop_sdk"
};
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isClientMessage(value) {
    if (!isRecord(value) || typeof value.type !== "string") {
        return false;
    }
    switch (value.type) {
        case CLIENT_MESSAGE_TYPES.SESSION_START:
            return isTimestampedSessionMessage(value, "startedAt");
        case CLIENT_MESSAGE_TYPES.TRANSCRIPT_INGEST_PARTIAL:
        case CLIENT_MESSAGE_TYPES.TRANSCRIPT_INGEST_FINAL:
            return isTranscriptIngestMessage(value);
        case CLIENT_MESSAGE_TYPES.COPILOT_PROMPT:
            return isCopilotPromptMessage(value);
        case CLIENT_MESSAGE_TYPES.SESSION_STOP:
            return isTimestampedSessionMessage(value, "endedAt");
        case CLIENT_MESSAGE_TYPES.SESSION_PING:
            return isTimestampedSessionMessage(value, "sentAt");
        default:
            return false;
    }
}
function isTimestampedSessionMessage(value, timeKey) {
    if (!isUuidString(value.sessionId) || typeof value[timeKey] !== "string") {
        return false;
    }
    if (timeKey === "startedAt") {
        return (isCaptureConfig(value.captureConfig) &&
            isOptionalCalendarContext(value.calendarContext) &&
            isOptionalUuidOrNull(value.jobDescriptionId) &&
            isOptionalUuidOrNull(value.candidateResumeId));
    }
    return true;
}
function isCaptureConfig(value) {
    return (isRecord(value) &&
        value.transport === CAPTURE_TRANSPORTS.RECALL_DESKTOP_SDK &&
        Object.keys(value).length === 1);
}
function isOptionalCalendarContext(value) {
    return (typeof value === "undefined" ||
        value === null ||
        isSessionCalendarEventLink(value));
}
function isSessionCalendarEventLink(value) {
    return (isRecord(value) &&
        isCalendarProvider(value.provider) &&
        typeof value.providerEventId === "string" &&
        value.providerEventId.trim().length > 0 &&
        (value.iCalUid === null ||
            (typeof value.iCalUid === "string" && value.iCalUid.trim().length > 0)) &&
        typeof value.calendarId === "string" &&
        value.calendarId.trim().length > 0 &&
        typeof value.calendarName === "string" &&
        value.calendarName.trim().length > 0 &&
        (value.title === null ||
            (typeof value.title === "string" && value.title.trim().length > 0)) &&
        typeof value.startsAt === "string" &&
        value.startsAt.trim().length > 0 &&
        typeof value.endsAt === "string" &&
        value.endsAt.trim().length > 0 &&
        (value.sourceTimeZone === null ||
            (typeof value.sourceTimeZone === "string" &&
                value.sourceTimeZone.trim().length > 0)) &&
        Array.isArray(value.attendees) &&
        value.attendees.every(isCalendarAttendeePreview) &&
        (value.meetingUrl === null ||
            (typeof value.meetingUrl === "string" &&
                value.meetingUrl.trim().length > 0)));
}
function isCalendarAttendeePreview(value) {
    return (isRecord(value) &&
        (value.displayName === null ||
            (typeof value.displayName === "string" &&
                value.displayName.trim().length > 0)) &&
        (value.email === null ||
            (typeof value.email === "string" && value.email.trim().length > 0)));
}
function isCalendarProvider(value) {
    return value === "google" || value === "microsoft";
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
    if (value.intent === "ask") {
        return (typeof value.question === "string" && value.question.trim().length > 0);
    }
    if (typeof value.question === "undefined") {
        return true;
    }
    return typeof value.question === "string";
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
        isTranscriptAudioSource(value.audioSource) &&
        typeof value.text === "string" &&
        value.text.trim().length > 0 &&
        isOptionalTimelineNs(value.segmentStartNs) &&
        isOptionalTimelineNs(value.segmentEndNs) &&
        isOptionalRecallParticipantMetadata(value.participant));
}
function isOptionalRecallParticipantMetadata(value) {
    return (typeof value === "undefined" ||
        value === null ||
        isRecallParticipantMetadata(value));
}
function isRecallParticipantMetadata(value) {
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
        (typeof value.isHost === "undefined" || typeof value.isHost === "boolean"));
}
function isTranscriptSource(value) {
    return value === "input_audio" || value === "model_response";
}
function isTranscriptAudioSource(value) {
    return isAudioStreamId(value) || value === "unknown";
}
function isOptionalTimelineNs(value) {
    return (typeof value === "undefined" ||
        (typeof value === "string" && /^\d+$/.test(value)));
}
function isCopilotIntent(value) {
    return (value === "say_next" ||
        value === "ask" ||
        value === "insights" ||
        value === "what_to_answer");
}
function isAudioStreamId(value) {
    return value === AUDIO_STREAM_IDS.MIC || value === AUDIO_STREAM_IDS.SYSTEM_AUDIO;
}
function isOptionalUuidOrNull(value) {
    return typeof value === "undefined" || value === null || isUuidString(value);
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
