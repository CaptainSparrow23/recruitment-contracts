export type CalendarProvider = "google" | "microsoft";

export type CalendarConnectionStatus =
  | "disconnected"
  | "connected"
  | "reconnect_required";

export interface CalendarProviderAuthConfig {
  provider: CalendarProvider;
  configured: boolean;
  authorizeUrl: string | null;
  clientId: string | null;
  redirectUri: string | null;
  scopes: string[];
}

export interface CalendarConnectionSummary {
  provider: CalendarProvider;
  connectionStatus: CalendarConnectionStatus;
  providerAccountId: string | null;
  providerDisplayName: string | null;
  providerEmail: string | null;
  grantedScopes: string[];
  selectedCalendarIds: string[];
  lastAuthErrorMessage: string | null;
  updatedAt: string | null;
}

export interface CalendarSummary {
  id: string;
  name: string;
  isPrimary: boolean;
  selected: boolean;
}

export interface CalendarAttendeePreview {
  displayName: string | null;
  email: string | null;
}

export type CalendarEventSource = "google" | "microsoft" | "manual";

// Tag colours a user can pick for a manual event — the coloured bar shown in the
// agenda. Provider events have no stored colour and fall back to a hashed tint.
export const MANUAL_EVENT_COLORS = [
  "#8b7fd6", // lavender
  "#e0b24a", // gold
  "#4a9d8e", // teal
  "#d67b9c", // rose
  "#6fae6f", // green
  "#c97b54", // terracotta
] as const;

export type ManualEventColor = (typeof MANUAL_EVENT_COLORS)[number];

// The one calendar-event shape, used for the agenda, the session snapshot, and manual
// events. Provider events (Google/Outlook) are fetched fresh and mapped into this; manual
// events are persisted by us. `id` is a stable opaque key (provider: `${source}:${eventId}`,
// manual: the row uuid); `source` drives the label/icon and which events are deletable.
export interface CalendarEvent {
  id: string;
  source: CalendarEventSource;
  title: string | null;
  startsAt: string;
  endsAt: string;
  timeZone: string | null;
  attendees: CalendarAttendeePreview[];
  // Chosen tag colour for manual events; null/absent for provider events.
  color?: string | null;
}

export interface CalendarConnectionsResponse {
  connections: CalendarConnectionSummary[];
  authProviders: CalendarProviderAuthConfig[];
}

export interface CompleteCalendarConnectionRequest {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

export interface CompleteCalendarConnectionResponse {
  connection: CalendarConnectionSummary;
}

export interface CalendarProviderCalendarsResponse {
  provider: CalendarProvider;
  calendars: CalendarSummary[];
}

export interface UpdateCalendarSelectionRequest {
  calendarIds: string[];
}

export interface UpdateCalendarSelectionResponse {
  provider: CalendarProvider;
  selectedCalendarIds: string[];
}

export interface DeleteCalendarConnectionResponse {
  provider: CalendarProvider;
  disconnected: boolean;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
}

export const MANUAL_EVENT_TITLE_MAX_LENGTH = 200;

export interface CreateManualEventRequest {
  title: string;
  startsAt: string;
  endsAt: string;
  timeZone?: string | null;
  color?: string | null;
}

export interface CreateManualEventResponse {
  event: CalendarEvent;
}

export interface DeleteManualEventResponse {
  deleted: boolean;
}
