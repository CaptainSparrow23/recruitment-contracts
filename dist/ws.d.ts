export declare const PROTOCOL_VERSION = "2026-03-06";
export declare const WEBSOCKET_PATH = "/ws";
export declare const CLIENT_MESSAGE_TYPES: {
    readonly SESSION_START: "session:start";
    readonly AUDIO_CHUNK: "audio:chunk";
    readonly MEDIA_AUDIO_CHUNK: "media:audio_chunk";
    readonly MEDIA_VIDEO_CHUNK: "media:video_chunk";
    readonly SESSION_STOP: "session:stop";
    readonly SESSION_PING: "session:ping";
};
export declare const SERVER_MESSAGE_TYPES: {
    readonly SESSION_STARTED: "session:started";
    readonly TRANSCRIPT_PARTIAL: "transcript:partial";
    readonly TRANSCRIPT_FINAL: "transcript:final";
    readonly SESSION_ERROR: "session:error";
    readonly SESSION_ENDED: "session:ended";
    readonly SESSION_PONG: "session:pong";
};
export type ClientMessageType = (typeof CLIENT_MESSAGE_TYPES)[keyof typeof CLIENT_MESSAGE_TYPES];
export type ServerMessageType = (typeof SERVER_MESSAGE_TYPES)[keyof typeof SERVER_MESSAGE_TYPES];
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
    mimeType: "audio/pcm;rate=16000;channels=1;format=s16le" | "audio/pcm;rate=24000;channels=1;format=s16le";
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
export type VideoChunkMimeType = "video/mp4;codecs=avc1" | "image/jpeg" | "video/webm" | "video/webm;codecs=vp8" | "video/webm;codecs=vp9";
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
export type ClientMessage = SessionStartMessage | AudioChunkMessage | MediaAudioChunkMessage | MediaVideoChunkMessage | SessionStopMessage | SessionPingMessage;
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
    code: "invalid_message" | "malformed_media_chunk" | "media_chunk_too_large" | "session_conflict" | "no_active_session" | "unsupported_message";
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
export type ServerMessage = SessionStartedMessage | TranscriptPartialMessage | TranscriptFinalMessage | SessionErrorMessage | SessionEndedMessage | SessionPongMessage;
export declare function isClientMessage(value: unknown): value is ClientMessage;
