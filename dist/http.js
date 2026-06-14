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
// The attribute key under which NoteBlockEvidence[] rides on a Tiptap block
// node's attrs. Shared so the backend writer and the frontend extension agree.
export const NOTE_EVIDENCE_ATTR = "evidence";
export const USER_MEETING_TITLE_MAX_LENGTH = 200;
export const USER_NOTES_MAX_BYTES = 256 * 1024;
export const QUALIFICATION_FIELD_VALUE_MAX_LENGTH = 4000;
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
// Recent panel page size — kept small so the chat landing stays compact (paged
// with prev/next arrows, not a growing scrollable list). The client fetches the
// whole list once and slices it into pages of this size locally.
export const CHAT_SESSIONS_PAGE_SIZE = 5;
// Upper bound on how many sessions the list endpoint returns in one response
// (and its default when no `limit` is given). Caps the "fetch all" payload.
export const CHAT_SESSIONS_MAX_LIMIT = 500;
