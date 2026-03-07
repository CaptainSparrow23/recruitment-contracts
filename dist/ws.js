export const PROTOCOL_VERSION = "2026-03-06";
export const WEBSOCKET_PATH = "/ws";
export const CLIENT_MESSAGE_TYPES = {
    SESSION_START: "session:start",
    AUDIO_CHUNK: "audio:chunk",
    MEDIA_AUDIO_CHUNK: "media:audio_chunk",
    MEDIA_VIDEO_CHUNK: "media:video_chunk",
    SESSION_STOP: "session:stop",
    SESSION_PING: "session:ping"
};
export const SERVER_MESSAGE_TYPES = {
    SESSION_STARTED: "session:started",
    TRANSCRIPT_PARTIAL: "transcript:partial",
    TRANSCRIPT_FINAL: "transcript:final",
    SESSION_ERROR: "session:error",
    SESSION_ENDED: "session:ended",
    SESSION_PONG: "session:pong"
};
export function isClientMessage(value) {
    if (!isRecord(value) || typeof value.type !== "string") {
        return false;
    }
    switch (value.type) {
        case CLIENT_MESSAGE_TYPES.SESSION_START:
            return isTimestampedSessionMessage(value, "startedAt");
        case CLIENT_MESSAGE_TYPES.AUDIO_CHUNK:
            return (typeof value.sessionId === "string" &&
                typeof value.chunkId === "number" &&
                typeof value.mimeType === "string" &&
                typeof value.sentAt === "string" &&
                typeof value.dataBase64 === "string");
        case CLIENT_MESSAGE_TYPES.MEDIA_AUDIO_CHUNK:
            return isMediaAudioChunkMessage(value);
        case CLIENT_MESSAGE_TYPES.MEDIA_VIDEO_CHUNK:
            return isMediaVideoChunkMessage(value);
        case CLIENT_MESSAGE_TYPES.SESSION_STOP:
            return isTimestampedSessionMessage(value, "endedAt");
        case CLIENT_MESSAGE_TYPES.SESSION_PING:
            return isTimestampedSessionMessage(value, "sentAt");
        default:
            return false;
    }
}
function isTimestampedSessionMessage(value, timeKey) {
    if (typeof value.sessionId !== "string" || typeof value[timeKey] !== "string") {
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
        value.video.width === 1920 &&
        value.video.height === 1080 &&
        value.video.fps === 24);
}
function isMediaAudioChunkMessage(value) {
    return (typeof value.sessionId === "string" &&
        typeof value.chunkId === "number" &&
        typeof value.durationMs === "number" &&
        Number.isFinite(value.durationMs) &&
        value.durationMs > 0 &&
        typeof value.timelineNs === "string" &&
        /^\d+$/.test(value.timelineNs) &&
        isSupportedPcmAudioMimeType(value.mimeType) &&
        typeof value.dataBase64 === "string");
}
function isSupportedAudioSampleRate(value) {
    return value === 16000 || value === 24000;
}
function isSupportedPcmAudioMimeType(value) {
    return (value === "audio/pcm;rate=16000;channels=1;format=s16le" ||
        value === "audio/pcm;rate=24000;channels=1;format=s16le");
}
function isMediaVideoChunkMessage(value) {
    return (typeof value.sessionId === "string" &&
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
        value === "image/jpeg" ||
        value === "video/webm" ||
        value === "video/webm;codecs=vp8" ||
        value === "video/webm;codecs=vp9");
}
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
