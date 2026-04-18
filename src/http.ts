import type {
  CopilotRedFlagItem,
  QualificationFieldState,
  SessionArtifactKind,
  TranscriptProviderMetadata,
  TranscriptSpeakerMetadata,
  TranscriptWord
} from "./ws.js";
import type {
  SessionCalendarEventLink
} from "./calendar.js";
import { PROTOCOL_VERSION, WEBSOCKET_PATH } from "./ws.js";

export const HEALTH_PATH = "/health";
export const READY_PATH = "/ready";
export const ME_PATH = "/me";
export const ME_WELCOME_PATH = "/me/welcome";
export const CALENDAR_PATH = "/calendar";
export const SESSION_ARTIFACTS_BASE_PATH = "/sessions";
export const SESSIONS_PATH = "/sessions";
export const RECALL_SDK_UPLOAD_PATH = "/recall/sdk-upload";
export const RECALL_WEBHOOK_PATH = "/webhooks/recall";

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
  calendarEvent: SessionCalendarEventLink | null;
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
  calendarEvent: SessionCalendarEventLink | null;
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
  eventId?: string;
  languageCode?: string | null;
  provider?: TranscriptProviderMetadata | null;
  providerTranscriptId?: string | null;
  receivedAt: string;
  role?: "user" | "counterpart";
  segmentEndNs?: string;
  segmentIndex: number;
  segmentStartNs?: string;
  speaker?: TranscriptSpeakerMetadata | null;
  text: string;
  words?: TranscriptWord[];
}

export interface UserProfile {
  actorId: string;
  email: string | null;
  fullName: string | null;
  pictureUrl: string | null;
  sendFollowUpEmails: boolean;
}

export interface SyncProfileRequest {
  email: string | null;
  fullName: string | null;
  pictureUrl: string | null;
}

export interface UpdateNotificationPreferencesRequest {
  sendFollowUpEmails: boolean;
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

export interface CreateRecallSdkUploadRequest {
  meetingWindow: {
    id: string;
    platform?: string | null;
    title?: string | null;
    url?: string | null;
  } | null;
  sessionId: string;
}

export interface CreateRecallSdkUploadResponse {
  sdkUploadId: string;
  uploadToken: string;
}

export const SEARCH_PATH = "/search";
export const CHAT_PATH = "/chat";

export const ORG_PATH = "/org";

export const BILLING_PATH = "/billing";
export const BILLING_PRICING_PATH = "/billing/pricing";
export const BILLING_CHECKOUT_PATH = "/billing/checkout";
export const BILLING_CHECKOUT_RESULT_PATH = "/billing/checkout-result";
export const BILLING_PORTAL_PATH = "/billing/portal";
export const STRIPE_WEBHOOK_PATH = "/webhooks/stripe";
export const WORKOS_WEBHOOK_PATH = "/webhooks/workos";

export type SubscriptionTier = "starter" | "personal" | "business" | "enterprise";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "unpaid"
  | "paused";

export type BillingInterval = "monthly" | "annual";

export interface BillingPriceInfo {
  amount: number;
  currency: string;
  interval: string;
}

export interface BillingTierPricing {
  monthly: BillingPriceInfo | null;
  annual: BillingPriceInfo | null;
}

export interface BillingPricing {
  personal: BillingTierPricing;
  business: BillingTierPricing;
}

export interface BillingState {
  tier: SubscriptionTier;
  status: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  quantity: number;
  // Set when the resolved billing customer belongs to an organization. Lets
  // clients display "Business · Acme Recruiting" without a separate /org call,
  // and lets desktop clients (whose tokens carry no org claim) still see the
  // plan their org is on, since the user's access tier is the org's tier.
  organizationId: string | null;
  organizationName: string | null;
  // Lifetime count of sessions started by this user, incremented on
  // session-start and never decremented. Drives the Starter-tier meeting
  // gate (client-side: block when >= 10). Also useful as a general usage
  // metric for paid users.
  sessionsStarted: number;
}

export interface CreateCheckoutSessionRequest {
  tier: "personal" | "business";
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  checkoutUrl: string;
}

export interface CreatePortalSessionRequest {
  returnUrl: string;
}

export interface CreatePortalSessionResponse {
  portalUrl: string;
}

export type CheckoutResultStatus = "succeeded" | "failed" | "expired";

export interface CheckoutResult {
  status: CheckoutResultStatus;
  tier: "personal" | "business" | null;
  message: string | null;
  createdAt: string;
}

export interface GetCheckoutResultResponse {
  result: CheckoutResult | null;
}

export interface CreateOrganizationRequest {
  name: string;
}

export interface CreateOrganizationResponse {
  organizationId: string;
  organizationName: string;
}

export interface SearchResultItem {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  templateId: string | null;
  fieldCount: number;
  capturedFieldCount: number;
  snippetText: string;
  snippetHighlights: Array<{
    start: number;
    end: number;
  }>;
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
