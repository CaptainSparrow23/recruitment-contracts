import type {
  CopilotRedFlagItem,
  QualificationFieldState,
  SessionArtifactKind
} from "./ws.js";
import { PROTOCOL_VERSION, WEBSOCKET_PATH } from "./ws.js";

export const HEALTH_PATH = "/health";
export const READY_PATH = "/ready";
export const ME_PATH = "/me";
export const SESSION_ARTIFACTS_BASE_PATH = "/sessions";
export const SESSIONS_PATH = "/sessions";

export interface HealthResponse {
  status: "ok";
  service: "recruitment-backend";
  protocolVersion: typeof PROTOCOL_VERSION;
  timestamp: string;
  uptimeSeconds: number;
  websocketPath: typeof WEBSOCKET_PATH;
}

export interface ReadinessResponse {
  status: "ready" | "not_ready";
  service: "recruitment-backend";
  timestamp: string;
  dependencies: {
    database: "ready" | "not_ready";
    objectStore: "ready" | "not_ready";
  };
}

export interface SummarizedRedFlag {
  id: string;
  summary: string;
  detail: string;
  severity: "low" | "medium" | "high";
  evidenceSegmentIndexes: number[];
  mergedFromIds: string[];
}

export type SessionFinalizationStatus = "pending" | "ready" | "failed";

export interface SessionSummary {
  id: string;
  startedAt: string;
  endedAt: string;
  templateId: string | null;
  fieldCount: number;
  capturedFieldCount: number;
  counterpartName: string | null;
  meetingTitle: string | null;
  createdAt: string;
  finalizationStatus?: SessionFinalizationStatus;
  finalizationErrorMessage?: string | null;
}

export interface SessionDetail {
  id: string;
  startedAt: string;
  endedAt: string;
  templateId: string | null;
  qualificationState: QualificationFieldState[];
  redFlags: CopilotRedFlagItem[];
  summarizedRedFlags: SummarizedRedFlag[];
  counterpartName: string | null;
  meetingTitle: string | null;
  artifacts: SessionArtifactDetail[];
  createdAt: string;
  finalizationStatus?: SessionFinalizationStatus;
  finalizationErrorMessage?: string | null;
}

export interface SessionArtifactDetail {
  artifactId: string;
  kind: SessionArtifactKind;
  fileName: string;
  contentType: string;
  createdAt: string;
}

export type SessionTemplateBackfillJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface SessionTemplateBackfillJobDetail {
  jobId: string;
  sessionId: string;
  templateId: string;
  status: SessionTemplateBackfillJobStatus;
  createdAt: string;
  updatedAt: string;
  artifact: SessionArtifactDetail | null;
  errorMessage: string | null;
}

export interface SessionTranscriptEntry {
  role: "user" | "counterpart";
  text: string;
  receivedAt: string;
  segmentIndex: number;
}

export interface UserProfile {
  actorId: string;
  email: string | null;
  fullName: string | null;
  pictureUrl: string | null;
}

export interface SyncProfileRequest {
  email: string | null;
  fullName: string | null;
  pictureUrl: string | null;
}

export interface SessionListResponse {
  sessions: SessionSummary[];
}

export interface SessionDetailResponse {
  session: SessionDetail;
}

export interface SessionTranscriptResponse {
  entries: SessionTranscriptEntry[];
}

export interface TriggerSessionTemplateBackfillRequest {
  templateId: string;
}

export interface TriggerSessionTemplateBackfillResponse {
  job: SessionTemplateBackfillJobDetail;
}

export interface SessionTemplateBackfillJobResponse {
  job: SessionTemplateBackfillJobDetail;
}

export const SEARCH_PATH = "/search";
export const CHAT_PATH = "/chat";

export interface SearchResultItem {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  templateId: string | null;
  fieldCount: number;
  capturedFieldCount: number;
  snippetHtml: string;
  relevance: number;
}

export interface SearchResponse {
  results: SearchResultItem[];
}

export interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

export type ChatStreamEvent =
  | { type: "delta"; content: string }
  | { type: "status"; message: string }
  | {
      type: "source";
      sessionId: string;
      startedAt: string;
      endedAt: string;
      snippet: string;
    }
  | {
      type: "done";
      sources: Array<{
        sessionId: string;
        startedAt: string;
        endedAt: string;
        snippet: string;
      }>;
    };
