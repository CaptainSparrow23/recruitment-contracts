import type { SessionCalendarEventLink } from "./calendar.js";

export const PROTOCOL_VERSION = "2026-04-01";
export const WEBSOCKET_PATH = "/ws";

export const CLIENT_MESSAGE_TYPES = {
  SESSION_START: "session:start",
  TRANSCRIPT_PARTICIPANT_INGEST: "transcript_participant_ingest",
  TRANSCRIPT_INGEST_PARTIAL: "transcript_ingest:partial",
  TRANSCRIPT_INGEST_FINAL: "transcript_ingest:final",
  TRANSCRIPT_PROVIDER_DATA_INGEST: "transcript_provider_data_ingest",
  COPILOT_PROMPT: "copilot:prompt",
  SESSION_STOP: "session:stop",
  SESSION_PING: "session:ping"
} as const;

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
  RED_FLAGS_STATE: "red_flags:state"
} as const;

export const AUDIO_STREAM_IDS = {
  MIC: "mic",
  SYSTEM_AUDIO: "system_audio"
} as const;
export const CAPTURE_TRANSPORTS = {
  RECALL_DESKTOP_SDK: "recall_desktop_sdk"
} as const;

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
  calendarContext?: SessionCalendarEventLink | null;
  jobDescriptionId?: string | null;
  candidateResumeId?: string | null;
}

export interface RecallDesktopSdkCaptureConfig {
  transport: typeof CAPTURE_TRANSPORTS.RECALL_DESKTOP_SDK;
}

export type CaptureConfig = RecallDesktopSdkCaptureConfig;
export type CaptureTransport =
  (typeof CAPTURE_TRANSPORTS)[keyof typeof CAPTURE_TRANSPORTS];

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
  providerTranscriptId?: string | null;
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

export interface TranscriptIngestPartialMessage
  extends TranscriptIngestMessageBase {
  type: typeof CLIENT_MESSAGE_TYPES.TRANSCRIPT_INGEST_PARTIAL;
}

export interface TranscriptIngestFinalMessage
  extends TranscriptIngestMessageBase {
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

export interface TranscriptProviderDataIngestMessage {
  type: typeof CLIENT_MESSAGE_TYPES.TRANSCRIPT_PROVIDER_DATA_INGEST;
  eventId: string;
  provider?: TranscriptProviderMetadata | null;
  providerTranscriptId?: string | null;
  receivedAt: string;
  segmentEndNs?: string;
  segmentStartNs?: string;
  sessionId: string;
  speaker?: TranscriptSpeakerMetadata | null;
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
  | TranscriptParticipantIngestMessage
  | TranscriptIngestPartialMessage
  | TranscriptIngestFinalMessage
  | TranscriptProviderDataIngestMessage
  | CopilotPromptMessage
  | SessionStopMessage
  | SessionPingMessage;

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

export interface CopilotDebugContextEntry {
  providerTranscriptId?: string | null;
  receivedAt: string;
  segmentIndex?: number;
  speakerLabel: string | null;
  text: string;
}

export interface CopilotDebugContextMessage {
  type: typeof SERVER_MESSAGE_TYPES.COPILOT_DEBUG_CONTEXT;
  sessionId: string;
  requestId: string;
  intent: CopilotIntent;
  occurredAt: string;
  basedOnSegmentIndexes: number[];
  cacheBypassedReason: "live_partial_context_present" | null;
  finalEntries: CopilotDebugContextEntry[];
  partialEntries: CopilotDebugContextEntry[];
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
  | TranscriptPartialMessage
  | TranscriptFinalMessage
  | CopilotStatusMessage
  | CopilotDebugContextMessage
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
    case CLIENT_MESSAGE_TYPES.TRANSCRIPT_PARTICIPANT_INGEST:
      return isTranscriptParticipantIngestMessage(value);
    case CLIENT_MESSAGE_TYPES.TRANSCRIPT_PROVIDER_DATA_INGEST:
      return isTranscriptProviderDataIngestMessage(value);
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

function isTimestampedSessionMessage(
  value: Record<string, unknown>,
  timeKey: "startedAt" | "endedAt" | "sentAt"
): boolean {
  if (!isUuidString(value.sessionId) || typeof value[timeKey] !== "string") {
    return false;
  }

  if (timeKey === "startedAt") {
    return (
      isCaptureConfig(value.captureConfig) &&
      isOptionalCalendarContext(value.calendarContext) &&
      isOptionalUuidOrNull(value.jobDescriptionId) &&
      isOptionalUuidOrNull(value.candidateResumeId)
    );
  }

  return true;
}

function isCaptureConfig(value: unknown): value is CaptureConfig {
  return (
    isRecord(value) &&
    value.transport === CAPTURE_TRANSPORTS.RECALL_DESKTOP_SDK &&
    Object.keys(value).length === 1
  );
}

function isOptionalCalendarContext(
  value: unknown
): value is SessionCalendarEventLink | null | undefined {
  return (
    typeof value === "undefined" ||
    value === null ||
    isSessionCalendarEventLink(value)
  );
}

function isSessionCalendarEventLink(
  value: unknown
): value is SessionCalendarEventLink {
  return (
    isRecord(value) &&
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
        value.meetingUrl.trim().length > 0))
  );
}

function isCalendarAttendeePreview(value: unknown): boolean {
  return (
    isRecord(value) &&
    (value.displayName === null ||
      (typeof value.displayName === "string" &&
        value.displayName.trim().length > 0)) &&
    (value.email === null ||
      (typeof value.email === "string" && value.email.trim().length > 0))
  );
}

function isCalendarProvider(value: unknown): boolean {
  return value === "google" || value === "microsoft";
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

function isTranscriptIngestMessage(
  value: unknown
): value is TranscriptIngestFinalMessage | TranscriptIngestPartialMessage {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isUuidString(value.sessionId) &&
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
    isOptionalTranscriptProviderMetadata(value.provider)
  );
}

function isTranscriptParticipantIngestMessage(
  value: unknown
): value is TranscriptParticipantIngestMessage {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isUuidString(value.sessionId) &&
    typeof value.eventId === "string" &&
    value.eventId.trim().length > 0 &&
    typeof value.receivedAt === "string" &&
    value.receivedAt.trim().length > 0 &&
    isTranscriptSpeakerMetadata(value.participant) &&
    typeof value.present === "boolean" &&
    isOptionalTranscriptProviderMetadata(value.provider)
  );
}

function isTranscriptProviderDataIngestMessage(
  value: unknown
): value is TranscriptProviderDataIngestMessage {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isUuidString(value.sessionId) &&
    typeof value.eventId === "string" &&
    value.eventId.trim().length > 0 &&
    typeof value.receivedAt === "string" &&
    value.receivedAt.trim().length > 0 &&
    isOptionalTranscriptProviderMetadata(value.provider) &&
    isOptionalProviderTranscriptId(value.providerTranscriptId) &&
    isOptionalTimelineNs(value.segmentStartNs) &&
    isOptionalTimelineNs(value.segmentEndNs) &&
    isOptionalTranscriptSpeakerMetadata(value.speaker)
  );
}

function isOptionalTranscriptSpeakerMetadata(
  value: unknown
): value is TranscriptSpeakerMetadata | null | undefined {
  return (
    typeof value === "undefined" ||
    value === null ||
    isTranscriptSpeakerMetadata(value)
  );
}

function isTranscriptSpeakerMetadata(
  value: unknown
): value is TranscriptSpeakerMetadata {
  return (
    isRecord(value) &&
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
      isRecord(value.extraData))
  );
}

function isTranscriptSource(value: unknown): value is TranscriptSource {
  return value === "input_audio" || value === "model_response";
}

function isOptionalTranscriptWords(value: unknown): value is TranscriptWord[] | undefined {
  return typeof value === "undefined" || (Array.isArray(value) && value.every(isTranscriptWord));
}

function isTranscriptWord(value: unknown): value is TranscriptWord {
  return (
    isRecord(value) &&
    typeof value.text === "string" &&
    value.text.trim().length > 0 &&
    isOptionalFiniteNumber(value.startRelativeSeconds) &&
    isOptionalFiniteNumber(value.endRelativeSeconds)
  );
}

function isOptionalTranscriptLanguageCode(
  value: unknown
): value is string | null | undefined {
  return (
    typeof value === "undefined" ||
    value === null ||
    (typeof value === "string" && value.trim().length > 0)
  );
}

function isOptionalProviderTranscriptId(
  value: unknown
): value is string | null | undefined {
  return (
    typeof value === "undefined" ||
    value === null ||
    (typeof value === "string" && value.trim().length > 0)
  );
}

function isOptionalTranscriptProviderMetadata(
  value: unknown
): value is TranscriptProviderMetadata | null | undefined {
  return (
    typeof value === "undefined" ||
    value === null ||
    isTranscriptProviderMetadata(value)
  );
}

function isTranscriptProviderMetadata(
  value: unknown
): value is TranscriptProviderMetadata {
  return (
    isRecord(value) &&
    value.name === "recall" &&
    typeof value.eventType === "string" &&
    value.eventType.trim().length > 0 &&
    (typeof value.rawPayload === "undefined" ||
      value.rawPayload === null ||
      isRecord(value.rawPayload))
  );
}

function isOptionalFiniteNumber(value: unknown): boolean {
  return (
    typeof value === "undefined" ||
    value === null ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function isOptionalTimelineNs(value: unknown): boolean {
  return (
    typeof value === "undefined" ||
    (typeof value === "string" && /^\d+$/.test(value))
  );
}

function isCopilotIntent(value: unknown): value is CopilotIntent {
  return (
    value === "say_next" ||
    value === "ask" ||
    value === "insights" ||
    value === "what_to_answer"
  );
}

function isOptionalUuidOrNull(value: unknown): boolean {
  return typeof value === "undefined" || value === null || isUuidString(value);
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
