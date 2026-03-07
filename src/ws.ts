export const PROTOCOL_VERSION = "2026-03-06";
export const WEBSOCKET_PATH = "/ws";

export const CLIENT_MESSAGE_TYPES = {
  SESSION_START: "session:start",
  AUDIO_CHUNK: "audio:chunk",
  MEDIA_AUDIO_CHUNK: "media:audio_chunk",
  MEDIA_VIDEO_CHUNK: "media:video_chunk",
  SESSION_STOP: "session:stop",
  SESSION_PING: "session:ping"
} as const;

export const SERVER_MESSAGE_TYPES = {
  SESSION_STARTED: "session:started",
  TRANSCRIPT_PARTIAL: "transcript:partial",
  TRANSCRIPT_FINAL: "transcript:final",
  SESSION_ERROR: "session:error",
  SESSION_ENDED: "session:ended",
  SESSION_PONG: "session:pong"
} as const;

export type ClientMessageType =
  (typeof CLIENT_MESSAGE_TYPES)[keyof typeof CLIENT_MESSAGE_TYPES];

export type ServerMessageType =
  (typeof SERVER_MESSAGE_TYPES)[keyof typeof SERVER_MESSAGE_TYPES];

export interface SessionStartMessage {
  type: typeof CLIENT_MESSAGE_TYPES.SESSION_START;
  sessionId: string;
  startedAt: string;
  captureConfig: CaptureConfig;
}

export interface CaptureConfig {
  audio: {
    channels: 1;
    format: "pcm_s16le";
    sampleRateHz: 16000 | 24000;
  };
  video: {
    fps: 24;
    height: 1080;
    width: 1920;
  };
}

export interface AudioChunkMessage {
  type: typeof CLIENT_MESSAGE_TYPES.AUDIO_CHUNK;
  sessionId: string;
  chunkId: number;
  mimeType: string;
  sentAt: string;
  dataBase64: string;
}

export interface MediaAudioChunkMessage {
  type: typeof CLIENT_MESSAGE_TYPES.MEDIA_AUDIO_CHUNK;
  sessionId: string;
  chunkId: number;
  timelineNs: string;
  durationMs: number;
  mimeType:
    | "audio/pcm;rate=16000;channels=1;format=s16le"
    | "audio/pcm;rate=24000;channels=1;format=s16le";
  dataBase64: string;
}

export interface MediaVideoChunkMessage {
  type: typeof CLIENT_MESSAGE_TYPES.MEDIA_VIDEO_CHUNK;
  sessionId: string;
  chunkId: number;
  timelineNs: string;
  durationMs: number;
  keyframe: boolean;
  width: number;
  height: number;
  mimeType: VideoChunkMimeType;
  dataBase64: string;
}

export type VideoChunkMimeType =
  | "video/mp4;codecs=avc1"
  | "image/jpeg"
  | "video/webm"
  | "video/webm;codecs=vp8"
  | "video/webm;codecs=vp9";

export interface SessionStopMessage {
  type: typeof CLIENT_MESSAGE_TYPES.SESSION_STOP;
  sessionId: string;
  endedAt: string;
  reason?: string;
}

export interface SessionPingMessage {
  type: typeof CLIENT_MESSAGE_TYPES.SESSION_PING;
  sessionId: string;
  sentAt: string;
}

export type ClientMessage =
  | SessionStartMessage
  | AudioChunkMessage
  | MediaAudioChunkMessage
  | MediaVideoChunkMessage
  | SessionStopMessage
  | SessionPingMessage;

export interface SessionStartedMessage {
  type: typeof SERVER_MESSAGE_TYPES.SESSION_STARTED;
  sessionId: string;
  startedAt: string;
  protocolVersion: typeof PROTOCOL_VERSION;
}

export interface TranscriptPartialMessage {
  type: typeof SERVER_MESSAGE_TYPES.TRANSCRIPT_PARTIAL;
  sessionId: string;
  eventId: string;
  segmentIndex: number;
  text: string;
  receivedAt: string;
}

export interface TranscriptFinalMessage {
  type: typeof SERVER_MESSAGE_TYPES.TRANSCRIPT_FINAL;
  sessionId: string;
  eventId: string;
  segmentIndex: number;
  text: string;
  receivedAt: string;
}

export interface SessionErrorMessage {
  type: typeof SERVER_MESSAGE_TYPES.SESSION_ERROR;
  sessionId?: string;
  code:
    | "invalid_message"
    | "malformed_media_chunk"
    | "media_chunk_too_large"
    | "session_conflict"
    | "no_active_session"
    | "unsupported_message";
  message: string;
}

export interface SessionEndedMessage {
  type: typeof SERVER_MESSAGE_TYPES.SESSION_ENDED;
  sessionId: string;
  endedAt: string;
  reason: "client_stop" | "socket_closed";
}

export interface SessionPongMessage {
  type: typeof SERVER_MESSAGE_TYPES.SESSION_PONG;
  sessionId: string;
  receivedAt: string;
}

export type ServerMessage =
  | SessionStartedMessage
  | TranscriptPartialMessage
  | TranscriptFinalMessage
  | SessionErrorMessage
  | SessionEndedMessage
  | SessionPongMessage;

export function isClientMessage(value: unknown): value is ClientMessage {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }

  switch (value.type) {
    case CLIENT_MESSAGE_TYPES.SESSION_START:
      return isTimestampedSessionMessage(value, "startedAt");
    case CLIENT_MESSAGE_TYPES.AUDIO_CHUNK:
      return (
        typeof value.sessionId === "string" &&
        typeof value.chunkId === "number" &&
        typeof value.mimeType === "string" &&
        typeof value.sentAt === "string" &&
        typeof value.dataBase64 === "string"
      );
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

function isTimestampedSessionMessage(
  value: Record<string, unknown>,
  timeKey: "startedAt" | "endedAt" | "sentAt"
): boolean {
  if (typeof value.sessionId !== "string" || typeof value[timeKey] !== "string") {
    return false;
  }

  if (timeKey === "startedAt") {
    return isCaptureConfig(value.captureConfig);
  }

  return true;
}

function isCaptureConfig(value: unknown): value is CaptureConfig {
  if (!isRecord(value)) {
    return false;
  }

  if (!isRecord(value.audio) || !isRecord(value.video)) {
    return false;
  }

  return (
    value.audio.format === "pcm_s16le" &&
    isSupportedAudioSampleRate(value.audio.sampleRateHz) &&
    value.audio.channels === 1 &&
    value.video.width === 1920 &&
    value.video.height === 1080 &&
    value.video.fps === 24
  );
}

function isMediaAudioChunkMessage(
  value: Record<string, unknown>
): boolean {
  return (
    typeof value.sessionId === "string" &&
    typeof value.chunkId === "number" &&
    typeof value.durationMs === "number" &&
    Number.isFinite(value.durationMs) &&
    value.durationMs > 0 &&
    typeof value.timelineNs === "string" &&
    /^\d+$/.test(value.timelineNs) &&
    isSupportedPcmAudioMimeType(value.mimeType) &&
    typeof value.dataBase64 === "string"
  );
}

function isSupportedAudioSampleRate(value: unknown): value is 16000 | 24000 {
  return value === 16000 || value === 24000;
}

function isSupportedPcmAudioMimeType(
  value: unknown
): value is
  | "audio/pcm;rate=16000;channels=1;format=s16le"
  | "audio/pcm;rate=24000;channels=1;format=s16le" {
  return (
    value === "audio/pcm;rate=16000;channels=1;format=s16le" ||
    value === "audio/pcm;rate=24000;channels=1;format=s16le"
  );
}

function isMediaVideoChunkMessage(
  value: Record<string, unknown>
): boolean {
  return (
    typeof value.sessionId === "string" &&
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
    typeof value.dataBase64 === "string"
  );
}

function isSupportedVideoChunkMimeType(value: unknown): value is VideoChunkMimeType {
  return (
    value === "video/mp4;codecs=avc1" ||
    value === "image/jpeg" ||
    value === "video/webm" ||
    value === "video/webm;codecs=vp8" ||
    value === "video/webm;codecs=vp9"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
