import type {
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
import type { AiModelId } from "./aiModels.js";
import type {
  SharedNotesBackground,
  SharedNotesPattern,
  ShareScope
} from "./sharedNotesStyle.js";
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
// Public, unauthenticated read of a meeting's shared notes by share token.
export const SHARED_NOTES_PATH = "/shared-notes";

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
// jumps to the cited segment. Lean by design — the magnifier shows no speaker;
// the transcript drawer it opens labels each row (the cited one included) from
// the loaded transcript by segmentIndex.
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
  // "Known to be the local Sorinai user." True ONLY on system-audio captures,
  // where Recall labels by audio source and the mic channel is the user.
  //
  // Supported-app captures always report false — not because the user isn't
  // present, but because Recall's is_host there means the MEETING PLATFORM's host
  // (whoever owns the Zoom/Meet/Teams meeting), which is a different question and
  // frequently a different person. That value is deliberately not propagated, so
  // this flag never changes meaning between rows.
  //
  // Therefore: `true` ⇒ this is the user. `false` ⇒ not the user, OR unknown.
  // On supported-app sessions, identifying the user is name matching, client-side.
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
  // Enhanced (AI-tidied) notes once finalization has produced them; the grid
  // prefers these for the card preview and falls back to userNotes.
  userNotesTidied: TiptapDoc | null;
  calendarEvent: CalendarEvent | null;
  createdAt: string;
  folderId: string | null;
  finalizationStatus?: SessionFinalizationStatus;
  finalizationErrorMessage?: string | null;
  // A template fill job is running for this meeting: the automatic post-meeting
  // document render, or a switch/refill the user started. Lets a row show that work
  // is still happening after `finalizationStatus` has already flipped to "ready" —
  // the two cover DISJOINT windows (values first, then the render).
  //
  // NOTE the deliberate asymmetry with `SessionDetail.activeFillJob` below, which
  // EXCLUDES finalization-mode jobs. That field makes a page present a template
  // operation in progress and lock the qualification sheet, so it may only reflect
  // work the user started. This one drives an ambient spinner on a list row, where
  // the automatic render is exactly what you want to see. Do not "fix" one to match
  // the other — the difference is the point.
  //
  // Sent explicitly false rather than omitted: the sessions list is persisted to
  // localStorage, so a positive false is what overwrites a stale true after a cold
  // relaunch.
  hasLiveFillJob?: boolean;
  // Real attendee roster (recruiter included). Optional: old/phone sessions omit it.
  participants?: SessionParticipant[];
  // For the two seeded intro meetings only: which Sorinai mark the row/drag-ghost
  // avatar shows instead of a title initial ("welcome" → dark tile, "founder" →
  // light tile). Derived from the seed title server-side; absent for real meetings
  // (and for a renamed intro meeting, which falls back to the initial).
  introAvatar?: "founder" | "welcome";
}

export interface SessionDetail {
  id: string;
  startedAt: string;
  endedAt: string;
  templateId: string | null;
  // Whether the active template has a fillable document (so the sheet can offer
  // a download/re-fill). False/absent for the Default sheet and any
  // document-less (fields-only) template.
  templateHasDocument?: boolean;
  // The active template's document format ("pdf" | "docx"), or null for the
  // Default sheet / any document-less template. Present even before the filled
  // artifact exists (during the async render window, when there's no artifact
  // `contentType` to read) so the download button can label "Filling out your
  // PDF/Word doc".
  templateDocumentFormat?: "pdf" | "docx" | null;
  qualificationState: QualificationFieldState[];
  counterpartName: string | null;
  meetingTitle: string | null;
  userMeetingTitle: string | null;
  userNotes: TiptapDoc | null;
  userNotesTidied: TiptapDoc | null;
  // Last-write timestamps for the notes staleness signal: the Enhanced doc is
  // stale when userNotesUpdatedAt > userNotesTidiedAt. Null until first written.
  userNotesUpdatedAt: string | null;
  userNotesTidiedAt: string | null;
  calendarEvent: CalendarEvent | null;
  artifacts: SessionArtifactDetail[];
  // Saved qualification states for OTHER templates (the "shelf"). The active
  // state is `qualificationState` above; `templateId` is the active template.
  qualificationStates: QualificationStateSummary[];
  createdAt: string;
  folderId: string | null;
  finalizationStatus?: SessionFinalizationStatus;
  finalizationErrorMessage?: string | null;
  // The async document render for the active template terminally FAILED (the fill
  // worker gave up after all attempts) and hasn't since been regenerated. Durable
  // (derived from the persisted fill job) so the download button can offer a
  // regenerate across reloads/navigation instead of a stuck "Generating…". Absent =
  // no terminal failure (still rendering, succeeded, or no document template).
  documentRenderFailed?: boolean;
  // A template operation is running for this session right now — a switch resolving
  // a new template's values, or a document being (re)rendered. Present for as long as
  // the job is live; null once it completes or terminally fails.
  //
  // This is a RESUME TOKEN, not a progress predicate. In-flight progress is client
  // state (it starts before any response comes back), but that state dies with the
  // view that owns it and with the app itself — so on load a client re-attaches to
  // whatever this points at instead of showing an idle button over running work.
  // `startedAt` is the job's creation time, for the elapsed caption.
  //
  // Only work the USER STARTED appears here. The automatic post-meeting render is
  // excluded: it runs after every call, and re-attaching to it made the client lock
  // the qualification sheet the user had just opened to read — for the length of the
  // render, while finalizationStatus already said "ready". That render reports itself
  // through the document's own pending state, not through this field.
  activeFillJob?: { jobId: string; startedAt: string } | null;
  isManualAudio: boolean;
  // Real attendee roster, rendered as the people label on the detail header
  // (and, via SessionSummary, the recent-meetings rows). Optional: old/phone
  // sessions omit it.
  participants?: SessionParticipant[];
  // The seeded one-time intro/"Welcome to sorinai" meeting. The detail view hides
  // the My-notes/Enhanced sub-tab pill and locks to Enhanced for it (only the
  // Enhanced doc has content). Absent/false for real sessions.
  isIntro?: boolean;
  // For the two seeded intro meetings only: which note it is ("welcome" |
  // "founder"), so opening one can be attributed in analytics. Derived from the
  // seed title server-side; absent for real meetings and renamed intro notes.
  introAvatar?: "founder" | "welcome";
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

// POST /sessions/:sessionId/share-link — mints (or returns the existing)
// reusable public link for a meeting's notes. The optional style picks how the
// public page is dressed; re-posting an existing link with a new style updates
// it (same URL). Omitted fields fall back to the defaults.
export interface CreateSessionShareLinkRequest {
  pattern?: SharedNotesPattern;
  background?: SharedNotesBackground;
  // What the public page exposes: notes, the qualification sheet, or both.
  // Omitted falls back to "notes" (today's behavior).
  scope?: ShareScope;
}

export interface CreateSessionShareLinkResponse {
  // Full public URL, e.g. "https://<site>/n/<token>" — the backend composes it.
  shareUrl: string;
  // The opaque token alone (the URL's secret), for client-side use if needed.
  shareToken: string;
  createdAt: string;
  // When the link stops working (ISO). null only for legacy links minted before
  // expiry existed; all new links get a 30-day window.
  expiresAt: string | null;
  // The saved look, echoed back so the modal can reflect what's stored.
  pattern: SharedNotesPattern;
  background: SharedNotesBackground;
  // The saved scope, echoed back so the modal reflects what's stored.
  scope: ShareScope;
}

// GET /sessions/:sessionId/share-link — authed read of the session's current
// active link so the Share modal can rehydrate on open (and edits then persist to
// the live link). `shareLink` is null when the meeting has no active link — a
// valid 200 result, NOT a 404, since the client throws on any non-2xx.
export interface GetSessionShareLinkResponse {
  shareLink: CreateSessionShareLinkResponse | null;
}

// DELETE /sessions/:sessionId/share-link — revokes the meeting's active link
// (sets revoked_at). `revoked` is false when there was no active link to kill.
export interface RevokeSessionShareLinkResponse {
  revoked: boolean;
}

// One qualification field as exposed on the PUBLIC page: the question and the
// candidate's answer only. Deliberately omits `evidence` (verbatim transcript
// quotes + speaker identity), `origin`, and internal ids — the server strips
// them before this ever leaves the backend, mirroring the notes evidence rule.
export interface SharedQualificationField {
  question: string;
  // Plain text; "N/A" for a not-applicable field with no captured value.
  value: string;
  status?: QualificationFieldStatus;
}

// GET /shared-notes/:token — the public (no-auth) payload rendered by the
// website. Notes are pre-serialized to markdown server-side (evidence stripped).
// `markdown` is empty when the share scope excludes notes; `qualification` is
// present only when the scope includes the sheet.
export interface SharedNotesResponse {
  title: string;
  markdown: string;
  createdAt: string;
  // The sharer-chosen look the public page renders.
  pattern: SharedNotesPattern;
  background: SharedNotesBackground;
  qualification?: SharedQualificationField[];
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

// Overwrite a set of qualification fields wholesale (matched by fieldId),
// preserving each field's evidence + origin. Used by the chat review's Undo to
// restore the pre-edit state that the agent's edit_qualification replaced — the
// per-field PUT can't do this (it forces origin:"user" and drops evidence).
export interface RestoreQualificationFieldsRequest {
  fields: QualificationFieldState[];
}

export interface RestoreQualificationFieldsResponse {
  fields: QualificationFieldState[];
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
// explicit Regenerate action) forces a fresh fill even when a saved state
// exists; default false reactivates a saved state or fills a new one.
export interface SwitchSessionTemplateRequest {
  templateId: string | null;
  regenerate?: boolean;
}

export type SwitchSessionTemplateResponse =
  // `artifact` is the reactivated template's current filled doc (null for a
  // document-less/Default template) — lets a caller preview the reused doc
  // without waiting for a separate refetch.
  | {
      status: "activated";
      templateId: string | null;
      artifact: SessionArtifactDetail | null;
    }
  | { status: "pending"; job: SessionTemplateFillJobDetail };

// Re-fill the active template's document from the CURRENT field values
// (preserving manual edits) — no transcript re-extraction. Always async.
export interface RefillTemplateDocumentResponse {
  job: SessionTemplateFillJobDetail;
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

// POST /sessions/:sessionId/notes/enhance — user-triggered whole-doc enhance.
// Empty request body; the notes source is the server-side stored userNotes.
export interface EnhanceSessionNotesResponse {
  userNotesTidied: TiptapDoc | null;
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

export type SessionTemplateFillJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface SessionTemplateFillJobDetail {
  jobId: string;
  sessionId: string;
  templateId: string;
  status: SessionTemplateFillJobStatus;
  // Renders attempted so far. Needed to read `status` correctly: "failed" is the
  // RETRY state, not an outcome — the worker gives up only once this reaches its
  // cap. A client that settles on "failed" alone reports a permanent failure over a
  // job that is about to be retried and usually succeeds.
  attemptCount: number;
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
  hideInCallFromScreenShare: boolean;
  onboardingCompletedAt: string | null;
}

export interface SyncProfileRequest {
  email: string | null;
  fullName: string | null;
  pictureUrl: string | null;
}

export interface UpdateProfilePreferencesRequest {
  sendFollowUpEmails?: boolean;
  hideInCallFromScreenShare?: boolean;
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
// `icon` holds EITHER a Lucide icon key (kebab-case ASCII, e.g. "briefcase") for
// folders created/edited since the icon revamp, OR a legacy emoji glyph for older
// folders not yet re-saved. The two are told apart at render time: an all-ASCII
// `[a-z0-9-]` value is an icon key, anything else (i.e. containing an emoji) is a
// glyph. The cap is generous to allow legacy ZWJ emoji sequences; icon keys are
// far shorter.
export const FOLDER_ICON_MAX_LENGTH = 24;
// `color` is a hex string ("#rrggbb") from the client's curated tint palette,
// used to tint the icon chip. Capped just past a 7-char hex for a little slack.
export const FOLDER_COLOR_MAX_LENGTH = 9;
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
  // The folder's icon: a Lucide icon key (kebab-case) or a legacy emoji glyph.
  // See FOLDER_ICON_MAX_LENGTH for how the two are distinguished.
  icon: string | null;
  // Optional uploaded picture, as a `data:image/...` URL. Mutually exclusive
  // with `icon` — setting one clears the other. Renders in place of the icon.
  iconImage: string | null;
  // Hex tint ("#rrggbb") applied to the icon chip. Only meaningful for icon-key
  // icons; null for legacy emoji, uploaded pictures, and un-iconed folders.
  color: string | null;
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
  // A Lucide icon key or a legacy emoji glyph.
  icon?: string | null;
  // A `data:image/...` URL to use as the icon instead of an icon/emoji.
  iconImage?: string | null;
  // Hex tint for the icon chip ("#rrggbb"), or null.
  color?: string | null;
}

export interface CreateFolderResponse {
  folder: Folder;
}

export interface RenameFolderRequest {
  name: string;
  // A Lucide icon key or a legacy emoji glyph. Omit the key to leave the
  // existing icon untouched; pass null to clear it.
  icon?: string | null;
  // A `data:image/...` URL to use as the icon instead of an icon/emoji. Omit the
  // key to leave the existing icon untouched; pass null to clear it.
  iconImage?: string | null;
  // Hex tint for the icon chip ("#rrggbb"). Omit to leave unchanged; null clears.
  color?: string | null;
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

export interface SessionTemplateFillJobResponse {
  job: SessionTemplateFillJobDetail;
}

// How the desktop app captured this session's audio. Selects which Recall
// diarization strategy the backend asks for:
//   supported_app → the detected meeting window itself is recorded, so Recall's
//                   speaker-timeline diarization (the meeting platform's own
//                   active-speaker events) labels every segment with a REAL
//                   participant.
//   system_audio  → the synthetic whole-desktop "adhoc" window: one mic channel
//                   plus one loopback channel and no participants at all, so the
//                   transcription provider's machine diarization is the only
//                   thing that can separate voices.
// Deliberately NOT inferred from `meetingWindow.platform`: a meeting can be
// detected while the user starts the note some other way (which captures system
// audio), and `platform` is optional, so a detected-but-unclassified meeting
// would silently get the wrong strategy.
export type SessionCaptureMode = "supported_app" | "system_audio";

export interface CreateRecallSdkUploadRequest {
  // Optional on the wire: a client that doesn't send it is treated as
  // system_audio, i.e. exactly the behaviour that shipped before this existed.
  captureMode?: SessionCaptureMode | null;
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
  // session-start and never decremented. A pure usage metric — NOT currently
  // gated: an earlier Starter-tier "10 meetings" cap was never wired end to
  // end, so nothing reads this to block a session. Kept as a monotonic usage
  // signal (and the template the document-download quota counter follows).
  sessionsStarted: number;
  // Filled-template downloads the current tier has left this calendar month;
  // null means unlimited (paid tiers). Computed server-side in getBillingState
  // from a per-month counter — the limit value and period logic stay on the
  // backend (internal policy, not a wire contract); only this derived remaining
  // count crosses the wire, so client display + pre-check can't drift.
  documentDownloadsRemaining: number | null;
  // AI actions (chat turns + Copilot prompts, one shared allowance) the current
  // tier has left TODAY; null means unlimited (paid tiers). Daily rather than
  // monthly so a user who exhausts it is unblocked tomorrow instead of for the
  // rest of the month. Same convention as documentDownloadsRemaining: the limit
  // and the period key stay backend-only, only this derived count crosses.
  aiActionsRemaining: number | null;
  // ISO instant when aiActionsRemaining refills; null when unlimited. Sent
  // rather than derived client-side because deriving it would require the
  // client to know the period is daily-and-UTC — exactly the internal policy
  // this convention keeps on the backend.
  aiActionsResetAt: string | null;
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
  /** Server-stamped checkout-start instant. The client polls for a
   *  checkout-result row created after this, so a server-sourced value keeps the
   *  poll immune to client clock skew. */
  startedAt: string;
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

export type SearchResultType = "session" | "jobDescription" | "template";

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

export interface TemplateSearchResult extends SearchResultBase {
  type: "template";
}

export type SearchResultItem =
  | SessionSearchResult
  | JobDescriptionSearchResult
  | TemplateSearchResult;

export interface SearchResponse {
  results: SearchResultItem[];
}

export interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  // Append to an existing conversation. Omit to start a new one — the server
  // creates it lazily and returns its id on the "done" event.
  chatSessionId?: string;
  // Anchor the conversation to a specific INTERVIEW/meeting session (the id of a
  // SessionDetail / session_records row). When set, the assistant treats that
  // interview as the subject and answers from it by default, while keeping full
  // access to the rest of the corpus for comparison questions. This is the
  // interview id — NOT the conversation id (`chatSessionId`) nor a cited source
  // (`ChatSource.sessionId`).
  anchorSessionId?: string;
  // Caller-selected model for this turn (from the model picker). Optional for
  // back-compat — the server validates it against its registry and falls back to
  // the chat default when absent/unknown.
  modelId?: AiModelId;
}

// A cited source attached to a persisted assistant turn. Mirrors the live
// "source" stream event shape so persisted and streamed sources are identical.
// Discriminated on `kind`: a "session" source references one of the recruiter's
// own interview transcripts (the original shape); a "web" source is a page
// consulted via web search. Persisted rows written before `kind` existed have no
// discriminant — readers MUST treat a missing `kind` as "session".
export type ChatSource =
  | {
      kind: "session";
      sessionId: string;
      startedAt: string;
      endedAt: string;
      snippet: string;
    }
  | {
      kind: "web";
      url: string;
      title: string;
    };

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
  | { type: "error"; message: string }
  // The agent used the edit_notes tool to change the anchored meeting's Enhanced
  // notes. Carries the freshly persisted doc (null when the edit emptied it) so
  // the notepad adopts it live via applyUserNotesTidiedOverride. Not terminal —
  // the stream continues; tidiedAt is the persisted timestamp.
  | {
      type: "notes_updated";
      sessionId: string;
      doc: TiptapDoc | null;
      tidiedAt: string;
      // Paths of the blocks this edit produced (replaced/inserted), in the new
      // doc's enumeration — [topIdx] or [topIdx, listItemIdx]. The notepad sweeps
      // exactly these. Empty when the edit only removed blocks or emptied the doc.
      changedBlocks: number[][];
    }
  // The agent used edit_qualification to change the anchored meeting's
  // qualification sheet answers. Carries the full new state of each changed field
  // (value/status/evidence/origin) so the sheet adopts them live via
  // applyQualificationFieldOverride and can snapshot the prior values for Undo.
  // Not terminal — the stream continues; updatedAt is the persisted timestamp.
  | {
      type: "qualification_updated";
      sessionId: string;
      // The fields the merge engine actually changed, in full. Empty when the
      // model's operations produced no net change (e.g. every quote was dropped).
      updatedFields: QualificationFieldState[];
      // Ids of those fields, so the sheet knows exactly which rows to sweep.
      changedFieldIds: string[];
      updatedAt: string;
    }
  // The answer streamed so far this iteration is being retracted: the model
  // emitted submit_answer alongside other pending tools, so its answer is
  // deferred and re-streams cleanly next iteration. The client resets the
  // accumulated answer text so it isn't duplicated.
  | { type: "answer_reset" };

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
