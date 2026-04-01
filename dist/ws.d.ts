import type { SessionCalendarEventLink } from "./calendar.js";
export declare const PROTOCOL_VERSION = "2026-04-01";
export declare const WEBSOCKET_PATH = "/ws";
export declare const CLIENT_MESSAGE_TYPES: {
    readonly SESSION_START: "session:start";
    readonly TRANSCRIPT_PARTICIPANT_INGEST: "transcript_participant_ingest";
    readonly TRANSCRIPT_INGEST_PARTIAL: "transcript_ingest:partial";
    readonly TRANSCRIPT_INGEST_FINAL: "transcript_ingest:final";
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
    readonly SESSION_ARTIFACT_STATUS: "session:artifact_status";
    readonly SESSION_PONG: "session:pong";
    readonly COPILOT_DELTA: "copilot:delta";
    readonly RED_FLAGS_STATE: "red_flags:state";
};
export declare const AUDIO_STREAM_IDS: {
    readonly MIC: "mic";
    readonly SYSTEM_AUDIO: "system_audio";
};
export declare const CAPTURE_TRANSPORTS: {
    readonly RECALL_DESKTOP_SDK: "recall_desktop_sdk";
};
export type ClientMessageType = (typeof CLIENT_MESSAGE_TYPES)[keyof typeof CLIENT_MESSAGE_TYPES];
export type ServerMessageType = (typeof SERVER_MESSAGE_TYPES)[keyof typeof SERVER_MESSAGE_TYPES];
export interface SessionStartMessage {
    type: typeof CLIENT_MESSAGE_TYPES.SESSION_START;
    sessionId: string;
    startedAt: string;
    captureConfig: CaptureConfig;
    calendarContext?: SessionCalendarEventLink | null;
    jobDescriptionId?: string | null;
    candidateResumeId?: string | null;
}
export interface RecallDesktopSdkCaptureConfig {
    transport: typeof CAPTURE_TRANSPORTS.RECALL_DESKTOP_SDK;
}
export type CaptureConfig = RecallDesktopSdkCaptureConfig;
export type CaptureTransport = (typeof CAPTURE_TRANSPORTS)[keyof typeof CAPTURE_TRANSPORTS];
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
export interface TranscriptSpeakerMetadata {
    email?: string | null;
    id: string;
    isHost?: boolean;
    name?: string | null;
    platform?: string | null;
    extraData?: Record<string, unknown> | null;
}
export type RecallParticipantMetadata = TranscriptSpeakerMetadata;
export interface TranscriptWord {
    endRelativeSeconds?: number | null;
    startRelativeSeconds?: number | null;
    text: string;
}
export interface TranscriptProviderMetadata {
    eventType: string;
    name: "recall";
    rawPayload?: Record<string, unknown> | null;
}
interface TranscriptMessageBase {
    audioSource?: TranscriptAudioSource;
    eventId: string;
    languageCode?: string | null;
    provider?: TranscriptProviderMetadata | null;
    receivedAt: string;
    segmentEndNs?: string;
    segmentStartNs?: string;
    speaker?: TranscriptSpeakerMetadata | null;
    source: TranscriptSource;
    text: string;
    words?: TranscriptWord[];
}
interface TranscriptIngestMessageBase extends TranscriptMessageBase {
    sessionId: string;
}
export interface TranscriptIngestPartialMessage extends TranscriptIngestMessageBase {
    type: typeof CLIENT_MESSAGE_TYPES.TRANSCRIPT_INGEST_PARTIAL;
}
export interface TranscriptIngestFinalMessage extends TranscriptIngestMessageBase {
    type: typeof CLIENT_MESSAGE_TYPES.TRANSCRIPT_INGEST_FINAL;
}
export interface TranscriptParticipantIngestMessage {
    type: typeof CLIENT_MESSAGE_TYPES.TRANSCRIPT_PARTICIPANT_INGEST;
    eventId: string;
    participant: TranscriptSpeakerMetadata;
    present: boolean;
    provider?: TranscriptProviderMetadata | null;
    receivedAt: string;
    sessionId: string;
}
export type CopilotIntent = "say_next" | "ask" | "insights" | "what_to_answer";
export interface CopilotPromptMessage {
    type: typeof CLIENT_MESSAGE_TYPES.COPILOT_PROMPT;
    sessionId: string;
    requestId: string;
    requestedAt: string;
    intent: CopilotIntent;
    question?: string;
}
export type ClientMessage = SessionStartMessage | TranscriptParticipantIngestMessage | TranscriptIngestPartialMessage | TranscriptIngestFinalMessage | CopilotPromptMessage | SessionStopMessage | SessionPingMessage;
export interface SessionStartedMessage {
    type: typeof SERVER_MESSAGE_TYPES.SESSION_STARTED;
    sessionId: string;
    startedAt: string;
    protocolVersion: typeof PROTOCOL_VERSION;
}
export interface TranscriptFinalMessage extends TranscriptMessageBase {
    type: typeof SERVER_MESSAGE_TYPES.TRANSCRIPT_FINAL;
    sessionId: string;
    segmentIndex: number;
}
export interface TranscriptPartialMessage extends TranscriptMessageBase {
    type: typeof SERVER_MESSAGE_TYPES.TRANSCRIPT_PARTIAL;
    sessionId: string;
}
export type TranscriptSource = "input_audio" | "model_response";
export type TranscriptAudioSource = AudioStreamId | "unknown";
export type AudioStreamId = (typeof AUDIO_STREAM_IDS)[keyof typeof AUDIO_STREAM_IDS];
export type CopilotStatus = "started" | "in_progress" | "completed" | "failed";
export type CopilotConfidence = "low" | "medium" | "high";
export interface CopilotSource {
    title: string;
    url: string;
}
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
    bullets: [string, string];
}
export interface CopilotAskResultPayload {
    kind: "ask";
    answer: string;
    sources: CopilotSource[];
}
export interface CopilotRedFlagItem {
    id: string;
    claim?: string;
    label: string;
    severity: "low" | "medium" | "high";
    evidenceSegmentIndexes?: number[];
    sources?: CopilotSource[];
}
export interface CopilotRedFlagsResultPayload {
    kind: "red_flags";
    items: CopilotRedFlagItem[];
    sources: CopilotSource[];
}
export interface CopilotInsightsResultPayload {
    kind: "insights";
    items: Array<{
        topic: string;
        explanation: string;
        roleRelevance: string;
        factualContext: string[];
    }>;
    sources: CopilotSource[];
}
export interface CopilotWhatToAnswerResultPayload {
    kind: "what_to_answer";
    answer: string;
    sources: CopilotSource[];
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
export interface CopilotInsightsResultMessage {
    type: typeof SERVER_MESSAGE_TYPES.COPILOT_RESULT;
    sessionId: string;
    requestId: string;
    intent: "insights";
    generatedAt: string;
    basedOnSegmentIndexes: number[];
    confidence: CopilotConfidence;
    result: CopilotInsightsResultPayload;
}
export interface CopilotWhatToAnswerResultMessage {
    type: typeof SERVER_MESSAGE_TYPES.COPILOT_RESULT;
    sessionId: string;
    requestId: string;
    intent: "what_to_answer";
    generatedAt: string;
    basedOnSegmentIndexes: number[];
    confidence: CopilotConfidence;
    result: CopilotWhatToAnswerResultPayload;
}
export type CopilotResultMessage = CopilotSayNextResultMessage | CopilotAskResultMessage | CopilotInsightsResultMessage | CopilotWhatToAnswerResultMessage;
export type CopilotStreamableIntent = "what_to_answer" | "ask";
export interface CopilotDeltaMessage {
    type: typeof SERVER_MESSAGE_TYPES.COPILOT_DELTA;
    sessionId: string;
    requestId: string;
    intent: CopilotStreamableIntent;
    delta: string;
}
export interface QualificationFieldEvidence {
    snapshotId: string;
    segmentIndex: number;
    speakerLabel: string | null;
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
}
export interface QualificationStateMessage {
    type: typeof SERVER_MESSAGE_TYPES.QUALIFICATION_STATE;
    sessionId: string;
    updatedAt: string;
    version: number;
    source: "primary" | "initialize";
    fields: QualificationFieldState[];
}
export interface RedFlagsStateMessage {
    type: typeof SERVER_MESSAGE_TYPES.RED_FLAGS_STATE;
    sessionId: string;
    updatedAt: string;
    items: CopilotRedFlagItem[];
    basedOnSegmentIndexes: number[];
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
export type SessionArtifactKind = "filled_template";
export interface SessionArtifactRef {
    artifactId: string;
    kind: SessionArtifactKind;
    fileName: string;
}
export interface SessionEndedMessage {
    type: typeof SERVER_MESSAGE_TYPES.SESSION_ENDED;
    sessionId: string;
    endedAt: string;
    reason: "client_stop" | "socket_closed";
    templateArtifactStatus?: "not_requested" | "pending" | "ready" | "failed";
    artifacts?: SessionArtifactRef[];
}
export interface SessionArtifactStatusMessage {
    type: typeof SERVER_MESSAGE_TYPES.SESSION_ARTIFACT_STATUS;
    sessionId: string;
    occurredAt: string;
    status: "pending" | "ready" | "failed";
    artifact?: SessionArtifactRef;
    message?: string;
}
export interface SessionPongMessage {
    type: typeof SERVER_MESSAGE_TYPES.SESSION_PONG;
    sessionId: string;
    receivedAt: string;
}
export type ServerMessage = SessionStartedMessage | TranscriptPartialMessage | TranscriptFinalMessage | CopilotStatusMessage | CopilotResultMessage | CopilotDeltaMessage | QualificationStateMessage | RedFlagsStateMessage | SessionWarningMessage | SessionErrorMessage | SessionEndedMessage | SessionArtifactStatusMessage | SessionPongMessage;
export declare function isClientMessage(value: unknown): value is ClientMessage;
export {};
