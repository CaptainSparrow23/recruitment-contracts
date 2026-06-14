import type {
  CopilotRedFlagItem,
  QualificationFieldState,
  QualificationFieldStatus,
  SessionArtifactKind,
  TranscriptProviderMetadata,
  TranscriptSpeakerMetadata,
  TranscriptWord
} from "./ws.js";
import type {
  CalendarEvent
} from "./calendar.js";
import { PROTOCOL_VERSION, WEBSOCKET_PATH } from "./ws.js";

export const HEALTH_PATH = "/health";
export const READY_PATH = "/ready";
export const ME_PATH = "/me";
export const ME_WELCOME_PATH = "/me/welcome";
export const ME_ONBOARDING_COMPLETE_PATH = "/me/onboarding/complete";
export const CALENDAR_PATH = "/calendar";
export const CALENDAR_MANUAL_EVENTS_PATH = "/calendar/manual-events";
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

export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: unknown[];
  marks?: unknown[];
  text?: string;
};

export type TiptapDoc = {
  type: "doc";
  content?: unknown[];
};

// A transcript citation attached to an enhanced-notes block, carried on the
// node's `attrs.evidence`. The notes-tidying model cites the segment(s) that
// justify a detail it pulled from the call; the UI renders a magnifier that
// jumps to the cited segment. Lean by design — speaker is resolved at render
// time from the loaded transcript by segmentIndex (see TranscriptDrawer).
export type NoteBlockEvidence = {
  segmentIndex: number;
  quote: string;
};

// The attribute key under which NoteBlockEvidence[] rides on a Tiptap block
// node's attrs. Shared so the backend writer and the frontend extension agree.
export const NOTE_EVIDENCE_ATTR = "evidence";

// A real attendee on the call (recruiter included). From the Recall roster captured
// at finalization; absent for phone/manual_audio and pre-feature sessions. Recall
// exposes no profile photos, so this is just identity for the "and N more" subtitle.
export interface SessionParticipant {
  id: string;
  name: string | null;
  email: string | null;
  isHost: boolean;
}

export interface SessionSummary {
  id: string;
  startedAt: string;
  endedAt: string;
  templateId: string | null;
  fieldCount: number;
  capturedFieldCount: number;
  counterpartName: string | null;
  meetingTitle: string | null;
  userMeetingTitle: string | null;
  userNotes: TiptapDoc | null;
  calendarEvent: CalendarEvent | null;
  createdAt: string;
  folderId: string | null;
  finalizationStatus?: SessionFinalizationStatus;
  finalizationErrorMessage?: string | null;
  // Real attendee roster (recruiter included). Optional: old/phone sessions omit it.
  participants?: SessionParticipant[];
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
  userMeetingTitle: string | null;
  userNotes: TiptapDoc | null;
  userNotesTidied: TiptapDoc | null;
  calendarEvent: CalendarEvent | null;
  artifacts: SessionArtifactDetail[];
  // Saved qualification states for OTHER templates (the "shelf"). The active
  // state is `qualificationState` above; `templateId` is the active template.
  qualificationStates: QualificationStateSummary[];
  createdAt: string;
  folderId: string | null;
  finalizationStatus?: SessionFinalizationStatus;
  finalizationErrorMessage?: string | null;
  isManualAudio: boolean;
  ownSpeakerLabel: string | null;
  speakerMappingResolved: boolean;
  // Contract symmetry with SessionSummary; not rendered on the detail view yet.
  participants?: SessionParticipant[];
}

export interface UpdateSpeakerMappingRequest {
  ownSpeakerLabel: string | null;
  speakerMappingResolved: boolean;
}

export interface UpdateSpeakerMappingResponse {
  ownSpeakerLabel: string | null;
  speakerMappingResolved: boolean;
}

export const USER_MEETING_TITLE_MAX_LENGTH = 200;

export interface RenameSessionRequest {
  userMeetingTitle: string | null;
}

export interface RenameSessionResponse {
  userMeetingTitle: string | null;
}

export const USER_NOTES_MAX_BYTES = 256 * 1024;

export interface UpdateSessionNotesRequest {
  userNotes?: TiptapDoc | null;
  userNotesTidied?: TiptapDoc | null;
}

export interface UpdateSessionNotesResponse {
  userNotes: TiptapDoc | null;
  userNotesTidied: TiptapDoc | null;
}

export const QUALIFICATION_FIELD_VALUE_MAX_LENGTH = 4000;

// A recruiter override of a single qualification field. Asserting a value
// implicitly confirms the field, so `status` is optional and defaults to
// "confirmed" server-side when omitted.
export interface UpdateQualificationFieldRequest {
  value: string;
  status?: QualificationFieldStatus;
}

export interface UpdateQualificationFieldResponse {
  field: QualificationFieldState;
}

// A saved qualification state for one template (the "shelf"). `templateId` is
// null for the built-in "Default" (no-document) state.
export interface QualificationStateSummary {
  templateId: string | null;
  capturedFieldCount: number;
  totalFieldCount: number;
  updatedAt: string;
}

// Switch the session's active template. `regenerate: true` (only sent by the
// explicit Regenerate action) forces a fresh backfill even when a saved state
// exists; default false reactivates a saved state or backfills a new one.
export interface SwitchSessionTemplateRequest {
  templateId: string | null;
  regenerate?: boolean;
}

export type SwitchSessionTemplateResponse =
  | { status: "activated"; templateId: string | null }
  | { status: "pending"; job: SessionTemplateBackfillJobDetail };

// Re-fill the active template's document from the CURRENT field values
// (preserving manual edits) — no transcript re-extraction. Always async.
export interface RefillTemplateDocumentResponse {
  job: SessionTemplateBackfillJobDetail;
}

// Request: the frontend sends exactly one node per dirty block.
export interface TidySessionNotesBlock {
  path: number[];
  node: TiptapNode;
}

// Response: a single dirty block can tidy to 0..N nodes. A paragraph authored
// with Shift+Enter soft breaks that contains a blank line round-trips through
// markdown to multiple paragraphs, so the tidied form is an array of nodes.
export interface TidiedNotesBlock {
  path: number[];
  nodes: TiptapNode[];
}

export interface TidySessionNotesRequest {
  dirtyBlocks: TidySessionNotesBlock[];
}

export interface TidySessionNotesResponse {
  tidiedBlocks: TidiedNotesBlock[];
}

export interface SessionArtifactDetail {
  artifactId: string;
  kind: SessionArtifactKind;
  fileName: string;
  contentType: string;
  createdAt: string;
  // The template this document was generated for. Null on legacy rows written
  // before artifacts were attributed to a template.
  templateId: string | null;
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
  onboardingCompletedAt: string | null;
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

// ─── Folders ───
// Lightweight, per-account groupings for organizing sessions. A folder owns no
// data: deleting one unfiles its sessions (folder_id -> NULL) rather than
// deleting them.
export const FOLDERS_PATH = "/folders";
export const FOLDER_NAME_MAX_LENGTH = 100;
// A single emoji/glyph; generous to allow ZWJ emoji sequences.
export const FOLDER_ICON_MAX_LENGTH = 24;
// A space icon can instead be an uploaded picture, stored inline as a small
// `data:image/...` URL (the client resizes to ~128px before upload). The cap
// bounds a resized icon and rejects unresized full-size uploads.
export const FOLDER_ICON_IMAGE_MAX_LENGTH = 200_000;

// GET /sessions folder filter. Omit the param to get every session; pass a
// folder uuid to scope to it; pass UNFILED_FOLDER_SENTINEL for sessions with
// no folder.
export const SESSIONS_FOLDER_QUERY_PARAM = "folderId";
export const UNFILED_FOLDER_SENTINEL = "unfiled";

export interface Folder {
  id: string;
  name: string;
  // Optional emoji/glyph shown next to the folder (Granola-style "Spaces").
  icon: string | null;
  // Optional uploaded picture, as a `data:image/...` URL. Mutually exclusive
  // with `icon` — setting one clears the other. Renders in place of the emoji.
  iconImage: string | null;
  // The seeded "My notes" space every account owns. It's a normal folder
  // except it can't be deleted (new notes fall back to it). At most one per
  // account.
  isDefault: boolean;
  // User-controlled sort order in the sidebar (ascending). Set by dragging
  // spaces to reorder them; every folder has one (lower = higher in the list).
  position: number;
  createdAt: string;
  updatedAt: string;
  // Number of sessions filed under this folder. Populated by GET /folders; may
  // be omitted on create/rename responses (clients re-list to refresh counts).
  sessionCount?: number;
}

export interface FolderListResponse {
  folders: Folder[];
}

export interface CreateFolderRequest {
  name: string;
  icon?: string | null;
  // A `data:image/...` URL to use as the icon instead of an emoji.
  iconImage?: string | null;
}

export interface CreateFolderResponse {
  folder: Folder;
}

export interface RenameFolderRequest {
  name: string;
  icon?: string | null;
  // A `data:image/...` URL to use as the icon instead of an emoji. Omit the key
  // to leave the existing icon untouched; pass null to clear it.
  iconImage?: string | null;
}

export interface RenameFolderResponse {
  folder: Folder;
}

export interface DeleteFolderResponse {
  deleted: boolean;
}

// Reorder this account's spaces. `orderedIds` is the full list of folder ids in
// their new top-to-bottom order; the server writes each folder's `position` to
// its index. Returns the re-sorted folders (a FolderListResponse).
export interface ReorderFoldersRequest {
  orderedIds: string[];
}

// Move a session into a folder, or unfile it (folderId: null).
export interface UpdateSessionFolderRequest {
  folderId: string | null;
}

export interface UpdateSessionFolderResponse {
  folderId: string | null;
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
// Persisted chat conversations ("Recent" history). A child path of CHAT_PATH so
// it inherits auth; the AI rate limiter is POST-only so these GETs are exempt.
export const CHAT_SESSIONS_PATH = "/chat/sessions";
// Max length of a conversation title (model-generated on the first turn, or
// derived from the first user message).
export const CHAT_TITLE_MAX_LENGTH = 100;

export const ORG_PATH = "/org";

export const BILLING_PATH = "/billing";
export const BILLING_PRICING_PATH = "/billing/pricing";
export const BILLING_CHECKOUT_PATH = "/billing/checkout";
export const BILLING_CHECKOUT_RESULT_PATH = "/billing/checkout-result";
export const BILLING_PORTAL_PATH = "/billing/portal";
export const BILLING_DETAILS_PATH = "/billing/details";
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

// ── Billing details (payment method + invoices) ──
// Fetched on-demand from Stripe and rendered; never persisted on our side.

/** Stripe billing-portal deep-link flows we expose. */
export type BillingPortalFlow = "payment_method_update" | "subscription_cancel";

export interface BillingPaymentMethod {
  /** Card network, e.g. "visa", "mastercard". */
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export type BillingInvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "uncollectible"
  | "void";

export interface BillingInvoice {
  id: string;
  /** ISO timestamp of the invoice date (Stripe `created`). */
  date: string;
  /** Total in the smallest currency unit (e.g. pence). */
  total: number;
  /** ISO 4217 code, lower-case as Stripe returns it (e.g. "gbp"). */
  currency: string;
  status: BillingInvoiceStatus | null;
  /** Stripe-hosted invoice page; null when Stripe didn't provide one. */
  hostedInvoiceUrl: string | null;
}

export interface BillingDetails {
  paymentMethod: BillingPaymentMethod | null;
  invoices: BillingInvoice[];
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
  returnUrl?: string;
  /** Optional deep-link so the portal opens straight on a specific flow. */
  flow?: BillingPortalFlow;
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

export interface SearchSnippetHighlight {
  start: number;
  end: number;
}

export type SearchResultType =
  | "session"
  | "jobDescription"
  | "resume"
  | "template";

// Shared shape across every result kind. The server always supplies a
// display-ready `title` (never null) and an empty `snippetText` when a result
// has no body excerpt to highlight.
interface SearchResultBase {
  id: string;
  title: string;
  subtitle: string | null;
  timestamp: string | null;
  snippetText: string;
  snippetHighlights: SearchSnippetHighlight[];
  relevance: number;
}

export interface SessionSearchResult extends SearchResultBase {
  type: "session";
}

export interface JobDescriptionSearchResult extends SearchResultBase {
  type: "jobDescription";
}

export interface ResumeSearchResult extends SearchResultBase {
  type: "resume";
}

export interface TemplateSearchResult extends SearchResultBase {
  type: "template";
}

export type SearchResultItem =
  | SessionSearchResult
  | JobDescriptionSearchResult
  | ResumeSearchResult
  | TemplateSearchResult;

export interface SearchResponse {
  results: SearchResultItem[];
}

export interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  // Append to an existing conversation. Omit to start a new one — the server
  // creates it lazily and returns its id on the "done" event.
  chatSessionId?: string;
}

// A cited source attached to a persisted assistant turn. Mirrors the live
// "source" stream event shape so persisted and streamed sources are identical.
export interface ChatSource {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  snippet: string;
}

export type ChatStreamEvent =
  | { type: "delta"; content: string }
  | { type: "status"; message: string }
  | ({ type: "source" } & ChatSource)
  | {
      type: "done";
      sources: ChatSource[];
      // Id of the conversation these turns were persisted to. Lets the client
      // adopt the id of a newly (lazily) created conversation.
      chatSessionId: string;
    }
  // Terminal failure mid-stream — the server closes the stream after this
  // without a "done", so the client must finalize the message itself.
  | { type: "error"; message: string };

// ─── Chat session history ───
// One persisted conversation. Drives the "Recent" list.
export interface ChatSessionSummary {
  id: string;
  // Null until the first turn's title is generated; clients fall back to a
  // placeholder ("New chat").
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

// One persisted turn within a conversation.
export interface PersistedChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  // Present only on assistant turns that cited sessions.
  sources?: ChatSource[];
  createdAt: string;
}

// Recent panel page size — kept small so the chat landing stays compact (paged
// with prev/next arrows, not a growing scrollable list). The client fetches the
// whole list once and slices it into pages of this size locally.
export const CHAT_SESSIONS_PAGE_SIZE = 5;

// Upper bound on how many sessions the list endpoint returns in one response
// (and its default when no `limit` is given). Caps the "fetch all" payload.
export const CHAT_SESSIONS_MAX_LIMIT = 500;

export interface ChatSessionListResponse {
  chats: ChatSessionSummary[];
}

export interface ChatSessionDetailResponse {
  chat: ChatSessionSummary;
  messages: PersistedChatMessage[];
}

export interface DeleteChatSessionResponse {
  deleted: boolean;
}

// User-initiated rename of a conversation. Unlike sessions (which keep a
// separate AI/user title pair) a chat has a single `title`, so rename always
// sets a non-empty value — never clears it back to the "New chat" placeholder.
export interface RenameChatSessionRequest {
  title: string;
}

export interface RenameChatSessionResponse {
  title: string;
}
