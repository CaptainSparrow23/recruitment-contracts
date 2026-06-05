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
export const USER_MEETING_TITLE_MAX_LENGTH = 200;
export const USER_NOTES_MAX_BYTES = 256 * 1024;
// ─── Folders ───
// Lightweight, per-account groupings for organizing sessions. A folder owns no
// data: deleting one unfiles its sessions (folder_id -> NULL) rather than
// deleting them.
export const FOLDERS_PATH = "/folders";
export const FOLDER_NAME_MAX_LENGTH = 100;
// A single emoji/glyph; generous to allow ZWJ emoji sequences.
export const FOLDER_ICON_MAX_LENGTH = 24;
// GET /sessions folder filter. Omit the param to get every session; pass a
// folder uuid to scope to it; pass UNFILED_FOLDER_SENTINEL for sessions with
// no folder.
export const SESSIONS_FOLDER_QUERY_PARAM = "folderId";
export const UNFILED_FOLDER_SENTINEL = "unfiled";
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
