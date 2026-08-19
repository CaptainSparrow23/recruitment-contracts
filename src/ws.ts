import type { CalendarEvent } from "./calendar.js";
import type { TiptapNode } from "./http.js";
import { isAiModelId, type AiModelId } from "./aiModels.js";

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
} as const;

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
  COPILOT_NOTES_EDIT: "copilot:notes_edit"
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
  calendarContext?: CalendarEvent | null;
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
  // Optional: a connection-level keepalive carries no session; an in-call ping
  // echoes the active session id so the server can correlate it.
  sessionId?: string;
  sentAt: string;
}

// Sent by a reconnecting client to rebind to a still-live session that was
// orphaned (not yet finalized) after its socket dropped. The server replies
// with SESSION_STARTED on success, or SESSION_ERROR{code:"resume_unavailable"}
// if the grace window has already lapsed and the session was finalized.
export interface SessionResumeMessage {
  type: typeof CLIENT_MESSAGE_TYPES.SESSION_RESUME;
  sessionId: string;
  resumedAt: string;
}

export interface SessionRetryFinalizationMessage {
  type: typeof CLIENT_MESSAGE_TYPES.SESSION_RETRY_FINALIZATION;
  sessionId: string;
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

export type CopilotIntent = "ask" | "help";

// Hard cap on the inline screenshot payload (base64 characters). The WS server
// closes the WHOLE connection (1009) on frames over its 512KiB maxPayload —
// there is no per-message error for oversize frames — so the client must stay
// well under it and this cap is the server-side defense. 400K base64 chars
// (~300KB JPEG) leaves ~112KiB of headroom for the rest of the message.
export const COPILOT_PROMPT_IMAGE_MAX_BASE64_CHARS = 400_000;

// One screenshot of the user's screen, attached by the in-call composer's eye
// toggle. Raw base64 — no `data:` prefix, no newlines.
export interface CopilotPromptImage {
  mediaType: "image/jpeg";
  base64: string;
}

export interface CopilotPromptMessage {
  type: typeof CLIENT_MESSAGE_TYPES.COPILOT_PROMPT;
  sessionId: string;
  requestId: string;
  requestedAt: string;
  intent: CopilotIntent;
  question?: string;
  // Caller-selected model for this copilot request (from the model picker).
  // Optional for back-compat — the server validates + falls back to the copilot
  // default when absent/unknown.
  modelId?: AiModelId;
  // Screenshot riding this request.
  image?: CopilotPromptImage;
}

export type ClientMessage =
  | SessionStartMessage
  | TranscriptParticipantIngestMessage
  | TranscriptIngestPartialMessage
  | TranscriptIngestFinalMessage
  | CopilotPromptMessage
  | SessionStopMessage
  | SessionPingMessage
  | SessionResumeMessage
  | SessionRetryFinalizationMessage;

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
    | "invalid_response"
    // Starter tier exhausted its daily AI action allowance. Sent as a "failed"
    // status rather than a SESSION_ERROR frame so the client clears the pending
    // assistant bubble — SESSION_ERROR is filtered on sessionId and would leave
    // the bubble in flight, blocking every subsequent ask.
    | "ai_quota_exceeded";
  message?: string;
}

export interface CopilotAskResultPayload {
  kind: "ask";
  answer: string;
}

// The in-call Quick Help button — a one-tap "read the room and help me right
// now" with no typed question. Markdown answer, like ask.
export interface CopilotHelpResultPayload {
  kind: "help";
  answer: string;
}

export interface CopilotAskResultMessage {
  type: typeof SERVER_MESSAGE_TYPES.COPILOT_RESULT;
  sessionId: string;
  requestId: string;
  intent: "ask";
  generatedAt: string;
  basedOnSegmentIndexes: number[];
  result: CopilotAskResultPayload;
}

export interface CopilotHelpResultMessage {
  type: typeof SERVER_MESSAGE_TYPES.COPILOT_RESULT;
  sessionId: string;
  requestId: string;
  intent: "help";
  generatedAt: string;
  basedOnSegmentIndexes: number[];
  result: CopilotHelpResultPayload;
}

export type CopilotResultMessage =
  | CopilotAskResultMessage
  | CopilotHelpResultMessage;

export interface CopilotDeltaMessage {
  type: typeof SERVER_MESSAGE_TYPES.COPILOT_DELTA;
  sessionId: string;
  requestId: string;
  intent: CopilotIntent;
  delta: string;
}

// One resolved notes edit for the in-call notepad, produced by the copilot's
// edit_notes tool during an `ask`. Mirrors the backend's folded NoteBlockChange:
// per target block, at most one replace-or-delete plus inserted siblings. The
// server resolves ops against the prompt snapshot but persists NOTHING — the
// renderer's editor owns the doc and applies these by content match, so a block
// the user edited meanwhile is skipped, never clobbered (Tidy's posture).
export interface CopilotNotesEditChange {
  // The target's path in the prompt snapshot ([topIdx] or [topIdx, itemIdx]).
  // Null only for append, which targets nothing.
  path: number[] | null;
  // The block as the model saw it — the client's staleness check. Null = append.
  matchNode: TiptapNode | null;
  // What happens to the block itself: null = keep, [] = delete, nodes = replace.
  replaceWith: TiptapNode[] | null;
  // Nodes inserted after the block (or at the doc end for append), in op order.
  insertAfter: TiptapNode[];
}

export interface CopilotNotesEditMessage {
  type: typeof SERVER_MESSAGE_TYPES.COPILOT_NOTES_EDIT;
  sessionId: string;
  requestId: string;
  occurredAt: string;
  changes: CopilotNotesEditChange[];
}

export interface QualificationFieldEvidence {
  snapshotId: string;
  segmentIndex: number;
  speakerLabel: string | null;
  // Raw speaker id for the cited segment. On the manual path this is the audio
  // channel ("host"/"guest"), which the UI relabels to "You"/the candidate's
  // name. Optional: rows persisted before this field lack it.
  speakerId?: string | null;
  quote: string;
  receivedAt: string;
}

export interface QualificationFieldState {
  fieldId: string;
  question: string;
  value: string;
  status: QualificationFieldStatus;
  evidence: QualificationFieldEvidence[];
  lastUpdatedAt: string | null;
  // "ai" (the default) while the value is owned by the qualification engine;
  // "user" once a recruiter has manually overridden it. Absent on records
  // written before this field existed — read paths must treat missing as "ai".
  origin?: "ai" | "user";
}

export interface QualificationStateMessage {
  type: typeof SERVER_MESSAGE_TYPES.QUALIFICATION_STATE;
  sessionId: string;
  updatedAt: string;
  version: number;
  source: "primary" | "initialize";
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
  code:
    | "invalid_message"
    | "rate_limit_exceeded"
    | "session_conflict"
    | "session_evicted"
    | "no_active_session"
    | "resume_unavailable"
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
  // "values_ready" = the qualification VALUES are resolved + persisted (the sheet
  // can unlock) while the filled document is still rendering async in the worker.
  // The worker later emits "ready" (with `artifact`) or "failed" for the document.
  status: "pending" | "values_ready" | "ready" | "failed";
  artifact?: SessionArtifactRef;
  message?: string;
}

export interface SessionPongMessage {
  type: typeof SERVER_MESSAGE_TYPES.SESSION_PONG;
  // Present only when the ping carried a matching active session.
  sessionId?: string;
  receivedAt: string;
}

export type ServerMessage =
  | SessionStartedMessage
  | TranscriptPartialMessage
  | TranscriptFinalMessage
  | CopilotStatusMessage
  | CopilotResultMessage
  | CopilotDeltaMessage
  | CopilotNotesEditMessage
  | QualificationStateMessage
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
function isSessionPingMessage(value: Record<string, unknown>): boolean {
  if (typeof value.sentAt !== "string") {
    return false;
  }
  return value.sessionId === undefined || isUuidString(value.sessionId);
}

function isTimestampedSessionMessage(
  value: Record<string, unknown>,
  timeKey: "startedAt" | "endedAt" | "sentAt" | "resumedAt"
): boolean {
  if (!isUuidString(value.sessionId) || typeof value[timeKey] !== "string") {
    return false;
  }

  if (timeKey === "startedAt") {
    return (
      isCaptureConfig(value.captureConfig) &&
      isOptionalCalendarContext(value.calendarContext)
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
): value is CalendarEvent | null | undefined {
  return (
    typeof value === "undefined" || value === null || isCalendarEvent(value)
  );
}

function isCalendarEvent(value: unknown): value is CalendarEvent {
  return (
    isRecord(value) &&
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
    value.attendees.every(isCalendarAttendeePreview)
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

function isCalendarEventSource(value: unknown): boolean {
  return value === "google" || value === "microsoft" || value === "manual";
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

  if (typeof value.modelId !== "undefined" && !isAiModelId(value.modelId)) {
    return false;
  }

  if (typeof value.image !== "undefined" && !isCopilotPromptImage(value.image)) {
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

function isCopilotPromptImage(value: unknown): value is CopilotPromptImage {
  return (
    isRecord(value) &&
    value.mediaType === "image/jpeg" &&
    typeof value.base64 === "string" &&
    value.base64.length > 0 &&
    value.base64.length <= COPILOT_PROMPT_IMAGE_MAX_BASE64_CHARS &&
    // Single linear pass (~1ms at the cap); rejects data: prefixes, newlines,
    // and anything a provider would bounce, before a model call is spent on it.
    /^[A-Za-z0-9+/]+={0,2}$/.test(value.base64)
  );
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
  return value === "ask" || value === "help";
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
