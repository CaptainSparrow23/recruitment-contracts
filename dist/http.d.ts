import type { CopilotNotesEditChange, CopilotPromptImage, QualificationFieldState, QualificationFieldStatus, SessionArtifactKind, TranscriptProviderMetadata, TranscriptSpeakerMetadata, TranscriptWord } from "./ws.js";
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
export declare const CALENDAR_EVENTS_ALLOW_PARTIAL_PARAM = "allowPartial";
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
export type SessionFinalizationStatus = "pending" | "ready" | "failed" | "draft";
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
    folderIds?: string[];
    finalizationStatus?: SessionFinalizationStatus;
    finalizationErrorMessage?: string | null;
    hasLiveFillJob?: boolean;
    participants?: SessionParticipant[];
    introAvatar?: "founder" | "welcome";
    access?: "owner" | "viewer";
    owner?: {
        name: string | null;
    };
}
export interface SessionDetail {
    id: string;
    startedAt: string;
    endedAt: string;
    templateId: string | null;
    templateHasDocument?: boolean;
    templateDocumentFormat?: "pdf" | "docx" | null;
    qualificationState: QualificationFieldState[];
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
    folderIds?: string[];
    finalizationStatus?: SessionFinalizationStatus;
    finalizationErrorMessage?: string | null;
    inPerson?: boolean;
    documentRenderFailed?: boolean;
    hasRecording?: boolean;
    activeFillJob?: {
        jobId: string;
        startedAt: string;
    } | null;
    isManualAudio: boolean;
    participants?: SessionParticipant[];
    speakerNames?: Record<string, string>;
    isIntro?: boolean;
    introAvatar?: "founder" | "welcome";
    access?: "owner" | "viewer";
    owner?: {
        name: string | null;
    };
}
export declare const USER_MEETING_TITLE_MAX_LENGTH = 200;
export interface RenameSessionRequest {
    userMeetingTitle: string | null;
}
export interface RenameSessionResponse {
    userMeetingTitle: string | null;
}
export declare const SPEAKER_NAME_MAX_LENGTH = 100;
export interface RenameSpeakerRequest {
    speakerId: string;
    name: string | null;
}
export interface RenameSpeakerResponse {
    speakerNames: Record<string, string>;
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
export interface CreateSessionNoteRequest {
    calendarEvent?: CalendarEvent | null;
    inPerson?: boolean;
    timeZone?: string;
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
export interface RestoreQualificationFieldsRequest {
    fields: QualificationFieldState[];
}
export interface RestoreQualificationFieldsResponse {
    fields: QualificationFieldState[];
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
    firstDocumentDownloadedAt: string | null;
    userContext: string | null;
    userRole: string | null;
    workspaceId?: string | null;
    defaultWorkspaceId?: string | null;
}
export interface SyncProfileRequest {
    email: string | null;
    fullName: string | null;
    pictureUrl: string | null;
    language?: string;
}
export interface UpdateProfilePreferencesRequest {
    sendFollowUpEmails?: boolean;
    hideInCallFromScreenShare?: boolean;
    userContext?: string | null;
    userRole?: string | null;
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
export interface SessionMediaResponse {
    video: {
        url: string;
    } | null;
    audio: {
        url: string;
    } | null;
    processing?: boolean;
}
export declare const WORKSPACE_MEMBERS_PATH = "/workspace/members";
export declare const SHARED_WITH_ME_PATH = "/shared-with-me";
export declare const MEETING_SHARE_NOTE_MAX_LENGTH = 500;
export declare const MEETING_SHARE_MAX_RECIPIENTS = 50;
export declare const MEETING_SHARE_EMAILS_PER_DAY = 20;
export declare const MEETING_SHARE_WAIT_DAYS = 90;
export interface WorkspaceMember {
    actorId: string;
    name: string | null;
    email: string | null;
    pictureUrl: string | null;
    isAdmin?: boolean;
}
export interface WorkspaceMembersResponse {
    members: WorkspaceMember[];
}
export interface ShareMeetingRequest {
    actorIds: string[];
    emails?: string[];
    note?: string | null;
}
export interface MeetingShareRecipient {
    actorId: string;
    sharedAt: string;
    email?: string;
    name?: string | null;
    pictureUrl?: string | null;
}
export interface MeetingSharesResponse {
    recipients: MeetingShareRecipient[];
}
export interface SharedMeetingSummary {
    sessionId: string;
    title: string;
    startedAt: string;
    endedAt: string | null;
    sharedBy: {
        name: string | null;
        email?: string | null;
    };
    note: string | null;
    sharedAt: string;
    unread: boolean;
    userNotes?: TiptapDoc | null;
    userNotesTidied?: TiptapDoc | null;
    folderId?: string | null;
    folderIds?: string[];
}
export interface SharedWithMeResponse {
    meetings: SharedMeetingSummary[];
}
export declare const NOTIFICATIONS_PATH = "/notifications";
export declare const NOTIFICATIONS_WINDOW_MS: number;
export type AppNotification = {
    kind: "added_to_folder";
    at: string;
    by: {
        actorId: string;
        name: string | null;
    };
    folder: {
        id: string;
        name: string;
    };
} | {
    kind: "meeting_added";
    at: string;
    by: {
        actorId: string;
        name: string | null;
    };
    folder: {
        id: string;
        name: string;
    };
    meeting: {
        sessionId: string;
        title: string;
    };
} | {
    kind: "document_ready";
    at: string;
    meeting: {
        sessionId: string;
        title: string;
    };
    template: {
        name: string;
    };
};
export interface NotificationsResponse {
    notifications: AppNotification[];
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
    isShared?: boolean;
    isOwn?: boolean;
    ownerId?: string;
    people?: string[];
}
export interface FolderListResponse {
    folders: Folder[];
}
export declare const FOLDER_PEOPLE_MAX = 200;
export interface SetFolderSharingRequest {
    isShared: false;
}
export interface SetFolderSharingResponse {
    folder: Folder | null;
}
export interface UpdateFolderPeopleRequest {
    add?: string[];
    remove?: string[];
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
export type SessionCaptureMode = "supported_app" | "system_audio";
export interface CreateRecallSdkUploadRequest {
    captureMode?: SessionCaptureMode | null;
    meetingWindow: {
        id: string;
        platform?: string | null;
        title?: string | null;
        url?: string | null;
    } | null;
    sessionId: string;
    video?: boolean | null;
    inPerson?: boolean | null;
}
export interface CreateRecallSdkUploadResponse {
    sdkUploadId: string;
    uploadToken: string;
}
export declare const SEARCH_PATH = "/search";
export declare const CHAT_PATH = "/chat";
export declare const CHAT_SESSIONS_PATH = "/chat/sessions";
export declare const CHAT_TITLE_MAX_LENGTH = 100;
export declare const CHAT_DISPLAY_TEXT_MAX_LENGTH = 200;
export declare const CHAT_QUICK_HELP_DISPLAY_TEXT = "Help me";
export declare const CHAT_FILES_PATH = "/chat/files";
export type ChatFileKind = "image" | "pdf" | "docx" | "xlsx" | "pptx" | "csv" | "text";
export interface ChatFile {
    id: string;
    name: string;
    kind: ChatFileKind;
    mediaType: string;
    sizeBytes: number;
    pages: number;
}
export interface ChatFileUploadResponse {
    file: ChatFile;
}
export type ChatFileErrorCode = "unsupported_format" | "file_too_large" | "file_too_long" | "unreadable_file" | "chat_files_full" | "chat_file_unavailable";
export declare const CHAT_FILE_MAX_BYTES: number;
export declare const CHAT_FILES_PER_MESSAGE = 5;
export declare const CHAT_FILES_MAX_PAGES = 100;
export declare const CHAT_FILE_KINDS_SENT_WHOLE: readonly ChatFileKind[];
export declare function chatFileSentWhole(kind: ChatFileKind): boolean;
export declare const CHAT_FILES_MAX_PICTURE_PDF_BYTES: number;
export declare const CHAT_FILE_TEXT_CHARS_PER_PAGE = 3000;
export declare const CHAT_FILE_IMAGE_MAX_EDGE = 2000;
export declare const CHAT_FILE_TYPES: Readonly<Record<string, {
    kind: ChatFileKind;
    mediaType: string;
}>>;
export declare function chatFileTypeFor(name: string, mediaType?: string): {
    kind: ChatFileKind;
    mediaType: string;
} | null;
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
    interval?: BillingInterval;
    organizationId: string | null;
    organizationName: string | null;
    sessionsStarted: number;
    documentDownloadsRemaining: number | null;
    aiActionsRemaining: number | null;
    aiActionsResetAt: string | null;
    purchaseRefusals?: Record<"personal" | "business", CheckoutRefusalReason | null>;
    templateCallsRemaining?: number | null;
    templateCallsResetAt?: string | null;
    newSharingAllowed?: boolean;
}
/** Why the backend won't start a purchase. */
export type CheckoutRefusalReason = "workspace_on_business" | "teammate_already_pays" | "personal_is_for_one_person";
/** The checkout's 422 reply. */
export interface CheckoutRefusedResponse {
    error: CheckoutRefusalReason;
    /** The sentence for the buyer, in English. */
    message: string;
    /** For clients that word the refusal themselves; null when we can't name it. */
    workspaceName: string | null;
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
/** What Stripe will charge next for a paid plan, in Stripe's own numbers.
 *  Amounts are in the currency's smallest unit. */
export interface BillingNextCharge {
    /** What Stripe will charge: its amount due, after any credit the customer holds. */
    amount: number;
    /** ISO 4217 code, lower-case as Stripe returns it. */
    currency: string;
    /** ISO timestamp of the day Stripe charges it. */
    date: string;
    /** How many members the plan is billed for; 1 on Personal. */
    members: number;
    /** One member for one period. */
    unitAmount: number;
    /** members × unitAmount, worked out by the server so no client multiplies. */
    planAmount: number;
    interval: BillingInterval;
    /** The part of `amount` that is for members who joined or left since the last
     *  bill: above zero for joiners, below zero for leavers, 0 when there are none. */
    memberChangesAmount: number;
    /** Credit the customer already held that Stripe takes off this bill; 0 when
     *  there is none. `amount` is planAmount + memberChangesAmount − this. */
    creditApplied: number;
    /** The card Stripe will charge. Null when it has none, or holds something
     *  that is not a card. */
    card: {
        brand: string;
        last4: string;
    } | null;
}
/** The one bill a plan that is set to end is still charged: what is waiting for
 *  members who joined since its last bill. */
export interface BillingLastCharge {
    /** What Stripe will charge, in the currency's smallest unit. Above zero. */
    amount: number;
    currency: string;
    /** ISO timestamp of the day the plan ends and Stripe charges it. */
    date: string;
    /** The card Stripe will charge; null as on `BillingNextCharge`. */
    card: {
        brand: string;
        last4: string;
    } | null;
}
/** A bill Stripe tried to collect and could not, and that is still owed. */
export interface BillingOverduePayment {
    /** What is still owed on it, in the currency's smallest unit. */
    amount: number;
    currency: string;
    /** ISO timestamp of the day Stripe first tried to collect it. */
    date: string;
    /** ISO timestamp of Stripe's next try. Null when it has none planned, which
     *  is the case after a decline it won't retry until the card is changed. */
    nextAttempt: string | null;
}
export interface BillingDetails {
    paymentMethod: BillingPaymentMethod | null;
    invoices: BillingInvoice[];
    /** Left out when there is no paid plan, when the plan is set to end, in a
     *  trial or overdue, when Stripe's preview can't be read, and by older servers. */
    nextCharge?: BillingNextCharge;
    /** Sent in place of `nextCharge` for a plan that is set to end and still has
     *  something to pay. */
    lastCharge?: BillingLastCharge;
    /** Sent in place of `nextCharge` while Stripe is retrying a failed payment. */
    overduePayment?: BillingOverduePayment;
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
export declare const WORKSPACE_INVITE_MAX = 50;
export interface CreateOrganizationRequest {
    name: string;
    invite?: string[];
}
export interface CreateOrganizationResponse {
    organizationId: string;
    organizationName: string;
    invitesFailed?: string[];
}
export interface SearchSnippetHighlight {
    start: number;
    end: number;
}
export type SearchResultType = "session" | "template";
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
    sharedBy?: {
        name: string | null;
    };
}
export interface TemplateSearchResult extends SearchResultBase {
    type: "template";
}
export type SearchResultItem = SessionSearchResult | TemplateSearchResult;
export interface SearchResponse {
    results: SearchResultItem[];
}
export interface ChatRequest {
    message?: string;
    messages?: Array<{
        role: "user" | "assistant";
        content: string;
    }>;
    chatSessionId?: string;
    anchorSessionId?: string;
    anchorFolderId?: string;
    modelId?: AiModelId;
    displayText?: string;
    timeZone?: string;
    quickHelp?: boolean;
    image?: CopilotPromptImage;
    fileIds?: string[];
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
    type: "chat_session";
    chatSessionId: string;
    hasImage?: boolean;
} | {
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
    target?: "original" | "enhanced";
    changes?: CopilotNotesEditChange[];
} | {
    type: "qualification_updated";
    sessionId: string;
    updatedFields: QualificationFieldState[];
    changedFieldIds: string[];
    updatedAt: string;
} | {
    type: "answer_reset";
} | {
    type: "template_created";
    templateId: string;
    name: string;
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
    anchor?: {
        sessionId: string;
        title: string;
    };
    files?: ChatFile[];
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
export declare const ISSUE_REPORTS_PATH = "/issue-reports";
export declare const ISSUE_REPORT_DETAILS_MAX_LENGTH = 4000;
export declare const ISSUE_REPORT_MESSAGE_MAX_LENGTH = 20000;
export declare const CHAT_MESSAGE_ISSUE_REASONS: readonly ["not_accurate", "wrong_meeting_context", "incomplete", "inappropriate", "other"];
export type ChatMessageIssueReason = (typeof CHAT_MESSAGE_ISSUE_REASONS)[number];
export declare function isChatMessageIssueReason(value: unknown): value is ChatMessageIssueReason;
export declare const GENERAL_ISSUE_REASONS: readonly ["bug", "recording_transcript", "inappropriate_ai_content", "billing_account", "other"];
export type GeneralIssueReason = (typeof GENERAL_ISSUE_REASONS)[number];
export declare function isGeneralIssueReason(value: unknown): value is GeneralIssueReason;
export interface IssueReportClient {
    appVersion: string;
    platform: string;
}
export type IssueReportKind = IssueReportRequest["kind"];
export type IssueReportRequest = {
    kind: "chat_message";
    chatSessionId?: string;
    messageContent: string;
    reason?: ChatMessageIssueReason;
    details?: string;
    client?: IssueReportClient;
} | {
    kind: "general";
    reason?: GeneralIssueReason;
    details: string;
    client?: IssueReportClient;
};
export interface IssueReportResponse {
    ok: true;
}
export {};
