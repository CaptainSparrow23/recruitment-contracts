export const HEALTH_PATH = "/health";
export const READY_PATH = "/ready";
export const ME_PATH = "/me";
export const ME_WELCOME_PATH = "/me/welcome";
export const ME_ONBOARDING_COMPLETE_PATH = "/me/onboarding/complete";
export const CALENDAR_PATH = "/calendar";
export const CALENDAR_MANUAL_EVENTS_PATH = "/calendar/manual-events";
// GET /calendar/events?allowPartial=1: a failing provider comes back in
// `failedProviders` instead of failing the whole request with a 502.
export const CALENDAR_EVENTS_ALLOW_PARTIAL_PARAM = "allowPartial";
export const SESSION_ARTIFACTS_BASE_PATH = "/sessions";
export const SESSIONS_PATH = "/sessions";
export const RECALL_SDK_UPLOAD_PATH = "/recall/sdk-upload";
export const RECALL_WEBHOOK_PATH = "/webhooks/recall";
// Public, unauthenticated read of a meeting's shared notes by share token.
export const SHARED_NOTES_PATH = "/shared-notes";
// The attribute key under which NoteBlockEvidence[] rides on a Tiptap block
// node's attrs. Shared so the backend writer and the frontend extension agree.
export const NOTE_EVIDENCE_ATTR = "evidence";
export const USER_MEETING_TITLE_MAX_LENGTH = 200;
export const SPEAKER_NAME_MAX_LENGTH = 100;
export const USER_NOTES_MAX_BYTES = 256 * 1024;
export const QUALIFICATION_FIELD_VALUE_MAX_LENGTH = 4000;
// ─── Sharing a meeting with teammates ───
// View-only access for people in the meeting's workspace. Only the owner can
// share, list or remove recipients.
export const WORKSPACE_MEMBERS_PATH = "/workspace/members";
export const SHARED_WITH_ME_PATH = "/shared-with-me";
// Characters, not words: about 80-100 words. The note is stored on every
// recipient's row and sent in each notification.
export const MEETING_SHARE_NOTE_MAX_LENGTH = 500;
export const MEETING_SHARE_MAX_RECIPIENTS = 50;
// New email addresses one person may share to in 24 hours.
export const MEETING_SHARE_EMAILS_PER_DAY = 20;
// How long a share to an address with no account waits for a sign-up.
export const MEETING_SHARE_WAIT_DAYS = 90;
// ─── Notifications (the bell) ───
// Read from where each piece of news already lives, so a line goes when what
// it's about does (a share removed, a meeting taken out, you off a folder).
// Shares stay on GET /shared-with-me; the app merges the two.
export const NOTIFICATIONS_PATH = "/notifications";
// How far back the bell looks.
export const NOTIFICATIONS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
// ─── Folders ───
// Lightweight, per-account groupings for organizing sessions; a note can be in
// many. A folder owns no data: deleting one takes its notes out of it rather
// than deleting them.
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
// The most people one PATCH /folders/:folderId/people may add or remove.
export const FOLDER_PEOPLE_MAX = 200;
export const SEARCH_PATH = "/search";
export const CHAT_PATH = "/chat";
// Persisted chat conversations ("Recent" history). A child path of CHAT_PATH so
// it inherits auth; the AI rate limiter is POST-only so these GETs are exempt.
export const CHAT_SESSIONS_PATH = "/chat/sessions";
// Max length of a conversation title (model-generated on the first turn, or
// derived from the first user message).
export const CHAT_TITLE_MAX_LENGTH = 100;
// Max length of ChatRequest.displayText (the short user-visible stand-in for a
// longer instruction — see ChatRequest).
export const CHAT_DISPLAY_TEXT_MAX_LENGTH = 200;
// The persisted user turn of an in-call Quick Help tap. The server's help
// ladder reads earlier "Help me" turns as "that help missed, go deeper", so the
// stored text must be exactly this on every backend and client.
export const CHAT_QUICK_HELP_DISPLAY_TEXT = "Help me";
// ─── Files added to a chat ───
// Uploaded on their own (multipart, field "file") as soon as they're added; the
// turn that carries them sends only their ids. A child of CHAT_PATH, so it
// inherits auth.
export const CHAT_FILES_PATH = "/chat/files";
export const CHAT_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const CHAT_FILES_PER_MESSAGE = 5;
// Per chat, because every file is sent to the AI again on each later turn.
export const CHAT_FILES_MAX_PAGES = 100;
// Pictures and PDFs go to the AI as themselves; other files as the text read
// from them.
export const CHAT_FILE_KINDS_SENT_WHOLE = ["image", "pdf"];
export function chatFileSentWhole(kind) {
    return CHAT_FILE_KINDS_SENT_WHOLE.includes(kind);
}
// Per chat, for the files sent whole: each turn reads them back from storage,
// and they cost the server many times their size in memory while it runs. The
// others weigh nothing there and count by their pages alone. One PDF or picture
// can be no bigger than this either.
export const CHAT_FILES_MAX_PICTURE_PDF_BYTES = 8 * 1024 * 1024;
export const CHAT_FILE_TEXT_CHARS_PER_PAGE = 3000;
// The app redraws pictures to at most this many pixels on the long side.
export const CHAT_FILE_IMAGE_MAX_EDGE = 2000;
// The files a chat accepts, by extension.
export const CHAT_FILE_TYPES = {
    png: { kind: "image", mediaType: "image/png" },
    jpg: { kind: "image", mediaType: "image/jpeg" },
    jpeg: { kind: "image", mediaType: "image/jpeg" },
    webp: { kind: "image", mediaType: "image/webp" },
    gif: { kind: "image", mediaType: "image/gif" },
    pdf: { kind: "pdf", mediaType: "application/pdf" },
    docx: {
        kind: "docx",
        mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    },
    xlsx: {
        kind: "xlsx",
        mediaType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    },
    pptx: {
        kind: "pptx",
        mediaType: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    },
    csv: { kind: "csv", mediaType: "text/csv" },
    txt: { kind: "text", mediaType: "text/plain" },
    md: { kind: "text", mediaType: "text/markdown" }
};
// By extension first; the media type only for a name without a known one.
export function chatFileTypeFor(name, mediaType) {
    const extension = /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase();
    if (extension && CHAT_FILE_TYPES[extension]) {
        return CHAT_FILE_TYPES[extension];
    }
    const media = mediaType?.toLowerCase();
    return Object.values(CHAT_FILE_TYPES).find((type) => type.mediaType === media) ?? null;
}
export const ORG_PATH = "/org";
export const BILLING_PATH = "/billing";
export const BILLING_PRICING_PATH = "/billing/pricing";
export const BILLING_CHECKOUT_PATH = "/billing/checkout";
export const BILLING_CHECKOUT_RESULT_PATH = "/billing/checkout-result";
export const BILLING_PORTAL_PATH = "/billing/portal";
export const BILLING_DETAILS_PATH = "/billing/details";
export const STRIPE_WEBHOOK_PATH = "/webhooks/stripe";
export const WORKOS_WEBHOOK_PATH = "/webhooks/workos";
export const WORKSPACE_INVITE_MAX = 50;
// Recent panel page size — kept small so the chat landing stays compact (paged
// with prev/next arrows, not a growing scrollable list). The client fetches the
// whole list once and slices it into pages of this size locally.
export const CHAT_SESSIONS_PAGE_SIZE = 5;
// Upper bound on how many sessions the list endpoint returns in one response
// (and its default when no `limit` is given). Caps the "fetch all" payload.
export const CHAT_SESSIONS_MAX_LIMIT = 500;
// ─── Issue reports ───────────────────────────────────────────────────────────
// In-app "Report an issue" surface (Microsoft Store policy 11.16: users must be
// able to report inappropriate AI content to the developer). Reports are emailed
// to the team inbox — there is no DB record in v1.
export const ISSUE_REPORTS_PATH = "/issue-reports";
// Free-text `details` cap (matches the marketing contact form).
export const ISSUE_REPORT_DETAILS_MAX_LENGTH = 4000;
// Cap on the reported assistant message body. Clients slice to this before
// sending; the server rejects anything longer.
export const ISSUE_REPORT_MESSAGE_MAX_LENGTH = 20_000;
// Why a chat assistant message was thumbed down. Runtime arrays so the app
// renders the same options the backend validates against.
export const CHAT_MESSAGE_ISSUE_REASONS = [
    "not_accurate",
    "wrong_meeting_context",
    "incomplete",
    "inappropriate",
    "other"
];
export function isChatMessageIssueReason(value) {
    return CHAT_MESSAGE_ISSUE_REASONS.includes(value);
}
// Reasons for the general "Report an issue" form (Help modal).
export const GENERAL_ISSUE_REASONS = [
    "bug",
    "recording_transcript",
    "inappropriate_ai_content",
    "billing_account",
    "other"
];
export function isGeneralIssueReason(value) {
    return GENERAL_ISSUE_REASONS.includes(value);
}
