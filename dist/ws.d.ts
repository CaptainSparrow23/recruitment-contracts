export declare const PROTOCOL_VERSION = "2026-03-10";
export declare const WEBSOCKET_PATH = "/ws";
export declare const CLIENT_MESSAGE_TYPES: {
    readonly SESSION_START: "session:start";
    readonly MEDIA_VIDEO_CHUNK: "media:video_chunk";
    readonly COPILOT_PROMPT: "copilot:prompt";
    readonly SESSION_STOP: "session:stop";
    readonly SESSION_PING: "session:ping";
};
export declare const SERVER_MESSAGE_TYPES: {
    readonly SESSION_STARTED: "session:started";
    readonly TRANSCRIPT_PARTIAL: "transcript:partial";
    readonly TRANSCRIPT_FINAL: "transcript:final";
    readonly COPILOT_STATUS: "copilot:status";
    readonly COPILOT_RESULT: "copilot:result";
    readonly QUALIFICATION_STATE: "qualification:state";
    readonly SESSION_WARNING: "session:warning";
    readonly SESSION_ERROR: "session:error";
    readonly SESSION_ENDED: "session:ended";
    readonly SESSION_PONG: "session:pong";
};
export declare const BINARY_MEDIA_AUDIO_CHUNK_TYPE: "media:audio_chunk_binary";
export declare const AUDIO_STREAM_IDS: {
    readonly MIC: "mic";
    readonly SYSTEM_AUDIO: "system_audio";
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
        streams: AudioStreamId[];
    };
    video: {
        fps: 24;
        height: 1080;
        width: 1920;
    };
}
export type SupportedPcmAudioMimeType = "audio/pcm;rate=16000;channels=1;format=s16le" | "audio/pcm;rate=24000;channels=1;format=s16le";
export interface BinaryMediaAudioChunkHeader {
    type: typeof BINARY_MEDIA_AUDIO_CHUNK_TYPE;
    sessionId: string;
    streamId: AudioStreamId;
    chunkId: number;
    timelineNs: string;
    durationMs: number;
    mimeType: SupportedPcmAudioMimeType;
}
export interface BinaryMediaAudioChunkPayload extends Omit<BinaryMediaAudioChunkHeader, "type"> {
    bytes: Uint8Array;
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
export type VideoChunkMimeType = "video/mp4;codecs=avc1" | "video/webm" | "video/webm;codecs=vp8" | "video/webm;codecs=vp9";
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
export type CopilotIntent = "say_next" | "context_now" | "ask";
export interface CopilotPromptMessage {
    type: typeof CLIENT_MESSAGE_TYPES.COPILOT_PROMPT;
    sessionId: string;
    requestId: string;
    requestedAt: string;
    intent: CopilotIntent;
    question?: string;
}
export type ClientMessage = SessionStartMessage | MediaVideoChunkMessage | CopilotPromptMessage | SessionStopMessage | SessionPingMessage;
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
    source: TranscriptSource;
    audioSource: TranscriptAudioSource;
    segmentStartNs?: string;
    segmentEndNs?: string;
    text: string;
    receivedAt: string;
}
export interface TranscriptFinalMessage {
    type: typeof SERVER_MESSAGE_TYPES.TRANSCRIPT_FINAL;
    sessionId: string;
    eventId: string;
    segmentIndex: number;
    source: TranscriptSource;
    audioSource: TranscriptAudioSource;
    segmentStartNs?: string;
    segmentEndNs?: string;
    text: string;
    receivedAt: string;
}
export type TranscriptSource = "input_audio" | "model_response";
export type TranscriptAudioSource = AudioStreamId | "unknown";
export type AudioStreamId = (typeof AUDIO_STREAM_IDS)[keyof typeof AUDIO_STREAM_IDS];
export type CopilotStatus = "started" | "completed" | "failed";
export type CopilotConfidence = "low" | "medium" | "high";
export type QualificationFieldStatus = "missing" | "partial" | "confirmed" | "not_applicable";
export interface CopilotStatusMessage {
    type: typeof SERVER_MESSAGE_TYPES.COPILOT_STATUS;
    sessionId: string;
    requestId: string;
    intent: CopilotIntent;
    status: CopilotStatus;
    occurredAt: string;
    errorCode?: "no_active_session" | "request_in_flight" | "invalid_prompt" | "provider_timeout" | "provider_error" | "invalid_response";
    message?: string;
}
export interface CopilotSayNextResultPayload {
    kind: "say_next";
    bullets: [string, string, string];
}
export interface CopilotContextNowResultPayload {
    kind: "context_now";
    bullets: [string, string, string];
}
export interface CopilotAskResultPayload {
    kind: "ask";
    answer: string;
    followUps: string[];
}
export interface CopilotSayNextResultMessage {
    type: typeof SERVER_MESSAGE_TYPES.COPILOT_RESULT;
    sessionId: string;
    requestId: string;
    intent: "say_next";
    generatedAt: string;
    basedOnSegmentIndexes: number[];
    confidence: CopilotConfidence;
    result: CopilotSayNextResultPayload;
}
export interface CopilotContextNowResultMessage {
    type: typeof SERVER_MESSAGE_TYPES.COPILOT_RESULT;
    sessionId: string;
    requestId: string;
    intent: "context_now";
    generatedAt: string;
    basedOnSegmentIndexes: number[];
    confidence: CopilotConfidence;
    result: CopilotContextNowResultPayload;
}
export interface CopilotAskResultMessage {
    type: typeof SERVER_MESSAGE_TYPES.COPILOT_RESULT;
    sessionId: string;
    requestId: string;
    intent: "ask";
    generatedAt: string;
    basedOnSegmentIndexes: number[];
    confidence: CopilotConfidence;
    result: CopilotAskResultPayload;
}
export type CopilotResultMessage = CopilotSayNextResultMessage | CopilotContextNowResultMessage | CopilotAskResultMessage;
export interface QualificationFieldEvidence {
    snapshotId: string;
    segmentIndex: number;
    role: "user" | "counterpart";
    quote: string;
    receivedAt: string;
}
export interface QualificationFieldState {
    fieldId: string;
    question: string;
    value: string;
    status: QualificationFieldStatus;
    hasConflict: boolean;
    confidenceScore: number;
    confidence: CopilotConfidence;
    evidence: QualificationFieldEvidence[];
    lastUpdatedAt: string | null;
    followUpRequired: boolean;
    followUpQuestion: string | null;
}
export interface QualificationStateMessage {
    type: typeof SERVER_MESSAGE_TYPES.QUALIFICATION_STATE;
    sessionId: string;
    updatedAt: string;
    version: number;
    source: "primary" | "reconcile" | "initialize";
    fields: QualificationFieldState[];
}
export interface SessionWarningMessage {
    type: typeof SERVER_MESSAGE_TYPES.SESSION_WARNING;
    sessionId: string;
    eventId: string;
    warningCode: "system_audio_unavailable" | "system_audio_resumed";
    message: string;
    occurredAt: string;
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
export type ServerMessage = SessionStartedMessage | TranscriptPartialMessage | TranscriptFinalMessage | CopilotStatusMessage | CopilotResultMessage | QualificationStateMessage | SessionWarningMessage | SessionErrorMessage | SessionEndedMessage | SessionPongMessage;
export declare function isClientMessage(value: unknown): value is ClientMessage;
export declare function encodeBinaryMediaAudioChunkFrame(payload: BinaryMediaAudioChunkPayload): Uint8Array;
export declare function decodeBinaryMediaAudioChunkFrame(frame: ArrayBuffer | Uint8Array): {
    header: BinaryMediaAudioChunkHeader;
    bytes: Uint8Array;
};
