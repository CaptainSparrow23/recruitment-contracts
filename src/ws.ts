export const PROTOCOL_VERSION = "2026-03-10";
export const WEBSOCKET_PATH = "/ws";

export const CLIENT_MESSAGE_TYPES = {
  SESSION_START: "session:start",
  MEDIA_VIDEO_CHUNK: "media:video_chunk",
  COPILOT_PROMPT: "copilot:prompt",
  SESSION_STOP: "session:stop",
  SESSION_PING: "session:ping"
} as const;

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
  SESSION_PONG: "session:pong",
  COPILOT_DELTA: "copilot:delta",
  RED_FLAGS_STATE: "red_flags:state"
} as const;

export const BINARY_MEDIA_AUDIO_CHUNK_TYPE = "media:audio_chunk_binary" as const;
export const AUDIO_STREAM_IDS = {
  MIC: "mic",
  SYSTEM_AUDIO: "system_audio"
} as const;

const BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES = 4;
const binaryFrameEncoder = new TextEncoder();
const binaryFrameDecoder = new TextDecoder();
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
    streams: AudioStreamId[];
  };
  video: {
    fps: 24;
    height: 1080;
    width: 1920;
  };
}

export type SupportedPcmAudioMimeType =
  | "audio/pcm;rate=16000;channels=1;format=s16le"
  | "audio/pcm;rate=24000;channels=1;format=s16le";

export interface BinaryMediaAudioChunkHeader {
  type: typeof BINARY_MEDIA_AUDIO_CHUNK_TYPE;
  sessionId: string;
  streamId: AudioStreamId;
  chunkId: number;
  timelineNs: string;
  durationMs: number;
  mimeType: SupportedPcmAudioMimeType;
}

export interface BinaryMediaAudioChunkPayload
  extends Omit<BinaryMediaAudioChunkHeader, "type"> {
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

export type VideoChunkMimeType =
  | "video/mp4;codecs=avc1"
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

export type CopilotIntent =
  | "say_next"
  | "ask"
  | "insights"
  | "what_to_answer";

export interface CopilotPromptMessage {
  type: typeof CLIENT_MESSAGE_TYPES.COPILOT_PROMPT;
  sessionId: string;
  requestId: string;
  requestedAt: string;
  intent: CopilotIntent;
  question?: string;
}

export type ClientMessage =
  | SessionStartMessage
  | MediaVideoChunkMessage
  | CopilotPromptMessage
  | SessionStopMessage
  | SessionPingMessage;

export interface SessionStartedMessage {
  type: typeof SERVER_MESSAGE_TYPES.SESSION_STARTED;
  sessionId: string;
  startedAt: string;
  protocolVersion: typeof PROTOCOL_VERSION;
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
export interface CopilotSource {
  title: string;
  url: string;
}
export type QualificationFieldStatus =
  | "missing"
  | "partial"
  | "confirmed"
  | "not_applicable";

export interface CopilotStatusMessage {
  type: typeof SERVER_MESSAGE_TYPES.COPILOT_STATUS;
  sessionId: string;
  requestId: string;
  intent: CopilotIntent;
  status: CopilotStatus;
  occurredAt: string;
  errorCode?:
    | "no_active_session"
    | "request_in_flight"
    | "invalid_prompt"
    | "provider_timeout"
    | "provider_error"
    | "invalid_response";
  message?: string;
}

export interface CopilotSayNextResultPayload {
  kind: "say_next";
  bullets: [string, string, string];
}

export interface CopilotAskResultPayload {
  kind: "ask";
  answer: string;
}

export interface CopilotRedFlagItem {
  id: string;
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

export type CopilotResultMessage =
  | CopilotSayNextResultMessage
  | CopilotAskResultMessage
  | CopilotInsightsResultMessage
  | CopilotWhatToAnswerResultMessage;

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
  code:
    | "invalid_message"
    | "malformed_media_chunk"
    | "media_chunk_too_large"
    | "session_conflict"
    | "no_active_session"
    | "unsupported_message";
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

export type ServerMessage =
  | SessionStartedMessage
  | TranscriptFinalMessage
  | CopilotStatusMessage
  | CopilotResultMessage
  | CopilotDeltaMessage
  | QualificationStateMessage
  | RedFlagsStateMessage
  | SessionWarningMessage
  | SessionErrorMessage
  | SessionEndedMessage
  | SessionArtifactStatusMessage
  | SessionPongMessage;

export function isClientMessage(value: unknown): value is ClientMessage {
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

export function encodeBinaryMediaAudioChunkFrame(
  payload: BinaryMediaAudioChunkPayload
): Uint8Array {
  if (!isBinaryMediaAudioChunkPayload(payload)) {
    throw new Error("Binary media audio chunk payload is invalid.");
  }

  const header: BinaryMediaAudioChunkHeader = {
    type: BINARY_MEDIA_AUDIO_CHUNK_TYPE,
    sessionId: payload.sessionId,
    streamId: payload.streamId,
    chunkId: payload.chunkId,
    timelineNs: payload.timelineNs,
    durationMs: payload.durationMs,
    mimeType: payload.mimeType
  };
  const headerBytes = binaryFrameEncoder.encode(JSON.stringify(header));
  const frame = new Uint8Array(
    BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES +
      headerBytes.length +
      payload.bytes.length
  );
  const view = new DataView(frame.buffer, frame.byteOffset, frame.byteLength);

  view.setUint32(0, headerBytes.length);
  frame.set(headerBytes, BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES);
  frame.set(
    payload.bytes,
    BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES + headerBytes.length
  );

  return frame;
}

export function decodeBinaryMediaAudioChunkFrame(
  frame: ArrayBuffer | Uint8Array
): {
  header: BinaryMediaAudioChunkHeader;
  bytes: Uint8Array;
} {
  const frameBytes =
    frame instanceof Uint8Array ? frame : new Uint8Array(frame);

  if (frameBytes.byteLength <= BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES) {
    throw new Error("Binary media audio chunk frame is too short.");
  }

  const view = new DataView(
    frameBytes.buffer,
    frameBytes.byteOffset,
    frameBytes.byteLength
  );
  const headerLength = view.getUint32(0);

  if (
    headerLength <= 0 ||
    headerLength >=
      frameBytes.byteLength - BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES
  ) {
    throw new Error(
      headerLength <= 0
        ? "Binary media audio chunk header length is invalid."
        : "Binary media audio chunk frame has no audio payload after the header."
    );
  }

  const payloadOffset = BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES + headerLength;

  let parsedHeader: unknown;

  try {
    parsedHeader = JSON.parse(
      binaryFrameDecoder.decode(
        frameBytes.subarray(
          BINARY_MEDIA_AUDIO_HEADER_LENGTH_BYTES,
          payloadOffset
        )
      )
    );
  } catch {
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

function isTimestampedSessionMessage(
  value: Record<string, unknown>,
  timeKey: "startedAt" | "endedAt" | "sentAt"
): boolean {
  if (!isUuidString(value.sessionId) || typeof value[timeKey] !== "string") {
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
    isSupportedAudioStreams(value.audio.streams) &&
    value.video.width === 1920 &&
    value.video.height === 1080 &&
    value.video.fps === 24
  );
}

function isCopilotPromptMessage(
  value: unknown
): value is CopilotPromptMessage {
  if (!isRecord(value)) {
    return false;
  }

  if (
    !isUuidString(value.sessionId) ||
    !isUuidString(value.requestId) ||
    typeof value.requestedAt !== "string" ||
    value.requestedAt.trim().length === 0 ||
    !isCopilotIntent(value.intent)
  ) {
    return false;
  }

  if (value.intent === "ask") {
    return (
      typeof value.question === "string" && value.question.trim().length > 0
    );
  }

  if (typeof value.question === "undefined") {
    return true;
  }

  return typeof value.question === "string";
}

function isCopilotIntent(value: unknown): value is CopilotIntent {
  return (
    value === "say_next" ||
    value === "ask" ||
    value === "insights" ||
    value === "what_to_answer"
  );
}

function isBinaryMediaAudioChunkPayload(
  value: unknown
): value is BinaryMediaAudioChunkPayload {
  return (
    isRecord(value) &&
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
    value.bytes.length > 0
  );
}

function isBinaryMediaAudioChunkHeader(
  value: unknown
): value is BinaryMediaAudioChunkHeader {
  return (
    isRecord(value) &&
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
    isSupportedPcmAudioMimeType(value.mimeType)
  );
}

function isSupportedAudioSampleRate(value: unknown): value is 16000 | 24000 {
  return value === 16000 || value === 24000;
}

function isSupportedPcmAudioMimeType(
  value: unknown
): value is SupportedPcmAudioMimeType {
  return (
    value === "audio/pcm;rate=16000;channels=1;format=s16le" ||
    value === "audio/pcm;rate=24000;channels=1;format=s16le"
  );
}

function isAudioStreamId(value: unknown): value is AudioStreamId {
  return value === AUDIO_STREAM_IDS.MIC || value === AUDIO_STREAM_IDS.SYSTEM_AUDIO;
}

function isSupportedAudioStreams(value: unknown): value is AudioStreamId[] {
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

function isMediaVideoChunkMessage(
  value: Record<string, unknown>
): boolean {
  return (
    isUuidString(value.sessionId) &&
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
    value === "video/webm" ||
    value === "video/webm;codecs=vp8" ||
    value === "video/webm;codecs=vp9"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUuidString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return UUID_PATTERN.test(value.trim());
}
