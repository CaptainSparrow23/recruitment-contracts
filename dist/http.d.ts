import type { CopilotRedFlagItem, QualificationFieldState, QualificationFieldStatus, SessionArtifactKind, TranscriptProviderMetadata, TranscriptSpeakerMetadata, TranscriptWord } from "./ws.js";
import type { CalendarEvent } from "./calendar.js";
import type { AiModelId } from "./aiModels.js";
import type { SharedNotesBackground, SharedNotesPattern, ShareScope } from "./sharedNotesStyle.js";
import { PROTOCOL_VERSION, WEBSOCKET_PATH } from "./ws.js";
export declare const HEALTH_PATH = "/health";
export declare const READY_PATH = "/ready";
export declare const ME_PATH = "/me";
export declare const ME_WELCOME_PATH = "/me/welcome";
export declare const ME_ONBOARDING_COMPLETE_PATH = "/me/onboarding/complete";
export declare const CALENDAR_PATH = "/calendar";
export declare const CALENDAR_MANUAL_EVENTS_PATH = "/calendar/manual-events";
export declare const SESSION_ARTIFACTS_BASE_PATH = "/sessions";
export declare const SESSIONS_PATH = "/sessions";
export declare const RECALL_SDK_UPLOAD_PATH = "/recall/sdk-upload";
export declare const RECALL_WEBHOOK_PATH = "/webhooks/recall";
export declare const SHARED_NOTES_PATH = "/shared-notes";
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
export type NoteBlockEvidence = {
    segmentIndex: number;
    quote: string;
};
export declare const NOTE_EVIDENCE_ATTR = "evidence";
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
    userNotesTidied: TiptapDoc | null;
    calendarEvent: CalendarEvent | null;
    createdAt: string;
    folderId: string | null;
    finalizationStatus?: SessionFinalizationStatus;
    finalizationErrorMessage?: string | null;
    participants?: SessionParticipant[];
}
export interface SessionDetail {
    id: string;
    startedAt: string;
    endedAt: string;
    templateId: string | null;
    templateHasDocument?: boolean;
    templateDocumentFormat?: "pdf" | "docx" | null;
    qualificationState: QualificationFieldState[];
    redFlags: CopilotRedFlagItem[];
    summarizedRedFlags: SummarizedRedFlag[];
    counterpartName: string | null;
    meetingTitle: string | null;
    userMeetingTitle: string | null;
    userNotes: TiptapDoc | null;
    userNotesTidied: TiptapDoc | null;
    userNotesUpdatedAt: string | null;
    userNotesTidiedAt: string | null;
    calendarEvent: CalendarEvent | null;
    artifacts: SessionArtifactDetail[];
    qualificationStates: QualificationStateSummary[];
    createdAt: string;
    folderId: string | null;
    finalizationStatus?: SessionFinalizationStatus;
    finalizationErrorMessage?: string | null;
    documentRenderFailed?: boolean;
    isManualAudio: boolean;
    participants?: SessionParticipant[];
}
export declare const USER_MEETING_TITLE_MAX_LENGTH = 200;
export interface RenameSessionRequest {
    userMeetingTitle: string | null;
}
export interface RenameSessionResponse {
    userMeetingTitle: string | null;
}
export declare const USER_NOTES_MAX_BYTES: number;
export interface UpdateSessionNotesRequest {
    userNotes?: TiptapDoc | null;
    userNotesTidied?: TiptapDoc | null;
}
export interface UpdateSessionNotesResponse {
    userNotes: TiptapDoc | null;
    userNotesTidied: TiptapDoc | null;
}
export interface CreateSessionShareLinkRequest {
    pattern?: SharedNotesPattern;
    background?: SharedNotesBackground;
    scope?: ShareScope;
}
export interface CreateSessionShareLinkResponse {
    shareUrl: string;
    shareToken: string;
    createdAt: string;
    expiresAt: string | null;
    pattern: SharedNotesPattern;
    background: SharedNotesBackground;
    scope: ShareScope;
}
export interface GetSessionShareLinkResponse {
    shareLink: CreateSessionShareLinkResponse | null;
}
export interface RevokeSessionShareLinkResponse {
    revoked: boolean;
}
export interface SharedQualificationField {
    question: string;
    value: string;
    status?: QualificationFieldStatus;
}
export interface SharedNotesResponse {
    title: string;
    markdown: string;
    createdAt: string;
    pattern: SharedNotesPattern;
    background: SharedNotesBackground;
    qualification?: SharedQualificationField[];
}
export declare const QUALIFICATION_FIELD_VALUE_MAX_LENGTH = 4000;
export interface UpdateQualificationFieldRequest {
    value: string;
    status?: QualificationFieldStatus;
}
export interface UpdateQualificationFieldResponse {
    field: QualificationFieldState;
}
export interface QualificationStateSummary {
    templateId: string | null;
    capturedFieldCount: number;
    totalFieldCount: number;
    updatedAt: string;
}
export interface SwitchSessionTemplateRequest {
    templateId: string | null;
    regenerate?: boolean;
}
export type SwitchSessionTemplateResponse = {
    status: "activated";
    templateId: string | null;
    artifact: SessionArtifactDetail | null;
} | {
    status: "pending";
    job: SessionTemplateFillJobDetail;
};
export interface RefillTemplateDocumentResponse {
    job: SessionTemplateFillJobDetail;
}
export interface TidySessionNotesBlock {
    path: number[];
    node: TiptapNode;
}
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
export interface EnhanceSessionNotesResponse {
    userNotesTidied: TiptapDoc | null;
}
export interface SessionArtifactDetail {
    artifactId: string;
    kind: SessionArtifactKind;
    fileName: string;
    contentType: string;
    createdAt: string;
    templateId: string | null;
}
export type SessionTemplateFillJobStatus = "pending" | "processing" | "completed" | "failed";
export interface SessionTemplateFillJobDetail {
    jobId: string;
    sessionId: string;
    templateId: string;
    status: SessionTemplateFillJobStatus;
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
export declare const FOLDERS_PATH = "/folders";
export declare const FOLDER_NAME_MAX_LENGTH = 100;
export declare const FOLDER_ICON_MAX_LENGTH = 24;
export declare const FOLDER_COLOR_MAX_LENGTH = 9;
export declare const FOLDER_ICON_IMAGE_MAX_LENGTH = 200000;
export declare const SESSIONS_FOLDER_QUERY_PARAM = "folderId";
export declare const UNFILED_FOLDER_SENTINEL = "unfiled";
export interface Folder {
    id: string;
    name: string;
    icon: string | null;
    iconImage: string | null;
    color: string | null;
    isDefault: boolean;
    position: number;
    createdAt: string;
    updatedAt: string;
    sessionCount?: number;
}
export interface FolderListResponse {
    folders: Folder[];
}
export interface CreateFolderRequest {
    name: string;
    icon?: string | null;
    iconImage?: string | null;
    color?: string | null;
}
export interface CreateFolderResponse {
    folder: Folder;
}
export interface RenameFolderRequest {
    name: string;
    icon?: string | null;
    iconImage?: string | null;
    color?: string | null;
}
export interface RenameFolderResponse {
    folder: Folder;
}
export interface DeleteFolderResponse {
    deleted: boolean;
}
export interface ReorderFoldersRequest {
    orderedIds: string[];
}
export interface UpdateSessionFolderRequest {
    folderId: string | null;
}
export interface UpdateSessionFolderResponse {
    folderId: string | null;
}
export interface SessionTemplateFillJobResponse {
    job: SessionTemplateFillJobDetail;
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
export declare const SEARCH_PATH = "/search";
export declare const CHAT_PATH = "/chat";
export declare const CHAT_SESSIONS_PATH = "/chat/sessions";
export declare const CHAT_TITLE_MAX_LENGTH = 100;
export declare const ORG_PATH = "/org";
export declare const BILLING_PATH = "/billing";
export declare const BILLING_PRICING_PATH = "/billing/pricing";
export declare const BILLING_CHECKOUT_PATH = "/billing/checkout";
export declare const BILLING_CHECKOUT_RESULT_PATH = "/billing/checkout-result";
export declare const BILLING_PORTAL_PATH = "/billing/portal";
export declare const BILLING_DETAILS_PATH = "/billing/details";
export declare const STRIPE_WEBHOOK_PATH = "/webhooks/stripe";
export declare const WORKOS_WEBHOOK_PATH = "/webhooks/workos";
export type SubscriptionTier = "starter" | "personal" | "business" | "enterprise";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "trialing" | "unpaid" | "paused";
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
    organizationId: string | null;
    organizationName: string | null;
    sessionsStarted: number;
    documentDownloadsRemaining: number | null;
}
/** Stripe billing-portal deep-link flows we expose. */
export type BillingPortalFlow = "payment_method_update" | "subscription_cancel";
export interface BillingPaymentMethod {
    /** Card network, e.g. "visa", "mastercard". */
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
}
export type BillingInvoiceStatus = "draft" | "open" | "paid" | "uncollectible" | "void";
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
export type SearchResultType = "session" | "jobDescription" | "resume" | "template";
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
export type SearchResultItem = SessionSearchResult | JobDescriptionSearchResult | ResumeSearchResult | TemplateSearchResult;
export interface SearchResponse {
    results: SearchResultItem[];
}
export interface ChatRequest {
    messages: Array<{
        role: "user" | "assistant";
        content: string;
    }>;
    chatSessionId?: string;
    anchorSessionId?: string;
    modelId?: AiModelId;
}
export type ChatSource = {
    kind: "session";
    sessionId: string;
    startedAt: string;
    endedAt: string;
    snippet: string;
} | {
    kind: "web";
    url: string;
    title: string;
};
export type ChatStreamEvent = {
    type: "delta";
    content: string;
} | {
    type: "status";
    message: string;
} | ({
    type: "source";
} & ChatSource) | {
    type: "done";
    sources: ChatSource[];
    chatSessionId: string;
} | {
    type: "error";
    message: string;
} | {
    type: "notes_updated";
    sessionId: string;
    doc: TiptapDoc | null;
    tidiedAt: string;
    changedBlocks: number[][];
} | {
    type: "answer_reset";
};
export interface ChatSessionSummary {
    id: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface PersistedChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: ChatSource[];
    createdAt: string;
}
export declare const CHAT_SESSIONS_PAGE_SIZE = 5;
export declare const CHAT_SESSIONS_MAX_LIMIT = 500;
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
export interface RenameChatSessionRequest {
    title: string;
}
export interface RenameChatSessionResponse {
    title: string;
}
export {};
