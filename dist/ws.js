export const PROTOCOL_VERSION = "2026-03-10";
export const WEBSOCKET_PATH = "/ws";
export const CLIENT_MESSAGE_TYPES = {
    SESSION_START: "session:start",
    MEDIA_VIDEO_CHUNK: "media:video_chunk",
    COPILOT_PROMPT: "copilot:prompt",
    SESSION_STOP: "session:stop",
    SESSION_PING: "session:ping"
};
export const SERVER_MESSAGE_TYPES = {
    SESSION_STARTED: "session:started",
    TRANSCRIPT_FINAL: "transcript:final",
    COPILOT_STATUS: "copilot:status",
    COPILOT_RESULT: "copilot:result",
    QUALIFICATION_STATE: "qualification:state",
    SESSION_WARNING: "session:warning",
    SESSION_ERROR: "session:error",
    SESSION_ENDED: "session:ended",
    SESSION_ARTIFACT_STATUS: "session:artifact_status",
    SESSION_PONG: "session:pong"
};
export const BINARY_MEDIA_AUDIO_CHUNK_TYPE = "media:audio_chunk_binary";
export const AUDIO_STREAM_IDS = {
    MIC: "mic",
    SYSTEM_AUDIO: "system_audio"
};
const BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES = 4;
const binaryFrameEncoder = new TextEncoder();
const binaryFrameDecoder = new TextDecoder();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isClientMessage(value) {
    if (!isRecord(value) || typeof value.type !== "string") {
        return false;
    }
    switch (value.type) {
        case CLIENT_MESSAGE_TYPES.SESSION_START:
            return isTimestampedSessionMessage(value, "startedAt");
        case CLIENT_MESSAGE_TYPES.MEDIA_VIDEO_CHUNK:
            return isMediaVideoChunkMessage(value);
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
export function encodeBinaryMediaAudioChunkFrame(payload) {
    if (!isBinaryMediaAudioChunkPayload(payload)) {
        throw new Error("Binary media audio chunk payload is invalid.");
    }
    const header = {
        type: BINARY_MEDIA_AUDIO_CHUNK_TYPE,
        sessionId: payload.sessionId,
        streamId: payload.streamId,
        chunkId: payload.chunkId,
        timelineNs: payload.timelineNs,
        durationMs: payload.durationMs,
        mimeType: payload.mimeType
    };
    const headerBytes = binaryFrameEncoder.encode(JSON.stringify(header));
    const frame = new Uint8Array(BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES +
        headerBytes.length +
        payload.bytes.length);
    const view = new DataView(frame.buffer, frame.byteOffset, frame.byteLength);
    view.setUint32(0, headerBytes.length);
    frame.set(headerBytes, BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES);
    frame.set(payload.bytes, BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES + headerBytes.length);
    return frame;
}
export function decodeBinaryMediaAudioChunkFrame(frame) {
    const frameBytes = frame instanceof Uint8Array ? frame : new Uint8Array(frame);
    if (frameBytes.byteLength <= BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES) {
        throw new Error("Binary media audio chunk frame is too short.");
    }
    const view = new DataView(frameBytes.buffer, frameBytes.byteOffset, frameBytes.byteLength);
    const headerLength = view.getUint32(0);
    if (headerLength <= 0 ||
        headerLength >=
            frameBytes.byteLength - BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES) {
        throw new Error(headerLength <= 0
            ? "Binary media audio chunk header length is invalid."
            : "Binary media audio chunk frame has no audio payload after the header.");
    }
    const payloadOffset = BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES + headerLength;
    let parsedHeader;
    try {
        parsedHeader = JSON.parse(binaryFrameDecoder.decode(frameBytes.subarray(BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES, payloadOffset)));
    }
    catch {
        throw new Error("Binary media audio chunk header must be valid JSON.");
    }
    if (!isBinaryMediaAudioChunkHeader(parsedHeader)) {
        throw new Error("Binary media audio chunk header is invalid.");
    }
    return {
        header: parsedHeader,
        bytes: frameBytes.subarray(payloadOffset)
    };
}
function isTimestampedSessionMessage(value, timeKey) {
    if (!isUuidString(value.sessionId) || typeof value[timeKey] !== "string") {
        return false;
    }
    if (timeKey === "startedAt") {
        return isCaptureConfig(value.captureConfig);
    }
    return true;
}
function isCaptureConfig(value) {
    if (!isRecord(value)) {
        return false;
    }
    if (!isRecord(value.audio) || !isRecord(value.video)) {
        return false;
    }
    return (value.audio.format === "pcm_s16le" &&
        isSupportedAudioSampleRate(value.audio.sampleRateHz) &&
        value.audio.channels === 1 &&
        isSupportedAudioStreams(value.audio.streams) &&
        value.video.width === 1920 &&
        value.video.height === 1080 &&
        value.video.fps === 24);
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
function isCopilotIntent(value) {
    return (value === "say_next" ||
        value === "ask" ||
        value === "red_flags" ||
        value === "insights" ||
        value === "what_to_answer");
}
function isBinaryMediaAudioChunkPayload(value) {
    return (isRecord(value) &&
        isUuidString(value.sessionId) &&
        isAudioStreamId(value.streamId) &&
        typeof value.chunkId === "number" &&
        Number.isFinite(value.chunkId) &&
        value.chunkId > 0 &&
        typeof value.durationMs === "number" &&
        Number.isFinite(value.durationMs) &&
        value.durationMs > 0 &&
        typeof value.timelineNs === "string" &&
        /^\d+$/.test(value.timelineNs) &&
        isSupportedPcmAudioMimeType(value.mimeType) &&
        value.bytes instanceof Uint8Array &&
        value.bytes.length > 0);
}
function isBinaryMediaAudioChunkHeader(value) {
    return (isRecord(value) &&
        value.type === BINARY_MEDIA_AUDIO_CHUNK_TYPE &&
        isUuidString(value.sessionId) &&
        isAudioStreamId(value.streamId) &&
        typeof value.chunkId === "number" &&
        Number.isFinite(value.chunkId) &&
        value.chunkId > 0 &&
        typeof value.durationMs === "number" &&
        Number.isFinite(value.durationMs) &&
        value.durationMs > 0 &&
        typeof value.timelineNs === "string" &&
        /^\d+$/.test(value.timelineNs) &&
        isSupportedPcmAudioMimeType(value.mimeType));
}
function isSupportedAudioSampleRate(value) {
    return value === 16000 || value === 24000;
}
function isSupportedPcmAudioMimeType(value) {
    return (value === "audio/pcm;rate=16000;channels=1;format=s16le" ||
        value === "audio/pcm;rate=24000;channels=1;format=s16le");
}
function isAudioStreamId(value) {
    return value === AUDIO_STREAM_IDS.MIC || value === AUDIO_STREAM_IDS.SYSTEM_AUDIO;
}
function isSupportedAudioStreams(value) {
    if (!Array.isArray(value) || value.length === 0) {
        return false;
    }
    const unique = new Set(value);
    if (!unique.has(AUDIO_STREAM_IDS.MIC)) {
        return false;
    }
    for (const streamId of unique) {
        if (!isAudioStreamId(streamId)) {
            return false;
        }
    }
    return true;
}
function isMediaVideoChunkMessage(value) {
    return (isUuidString(value.sessionId) &&
        typeof value.chunkId === "number" &&
        typeof value.durationMs === "number" &&
        Number.isFinite(value.durationMs) &&
        value.durationMs > 0 &&
        typeof value.timelineNs === "string" &&
        /^\d+$/.test(value.timelineNs) &&
        typeof value.keyframe === "boolean" &&
        typeof value.width === "number" &&
        typeof value.height === "number" &&
        value.width > 0 &&
        value.height > 0 &&
        isSupportedVideoChunkMimeType(value.mimeType) &&
        typeof value.dataBase64 === "string");
}
function isSupportedVideoChunkMimeType(value) {
    return (value === "video/mp4;codecs=avc1" ||
        value === "video/webm" ||
        value === "video/webm;codecs=vp8" ||
        value === "video/webm;codecs=vp9");
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
