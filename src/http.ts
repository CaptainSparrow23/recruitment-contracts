import type { QualificationFieldState, SessionArtifactKind } from "./ws.js";
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

export interface SessionSummary {
  id: string;
  startedAt: string;
  endedAt: string;
  templateId: string | null;
  fieldCount: number;
  capturedFieldCount: number;
  createdAt: string;
}

export interface SessionDetail {
  id: string;
  startedAt: string;
  endedAt: string;
  templateId: string | null;
  qualificationState: QualificationFieldState[];
  artifacts: SessionArtifactDetail[];
  createdAt: string;
}

export interface SessionArtifactDetail {
  artifactId: string;
  kind: SessionArtifactKind;
  fileName: string;
  contentType: string;
  createdAt: string;
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
