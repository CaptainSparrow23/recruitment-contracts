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

// Shared decorative tint palette: the colour a user picks for a manual event
// (the coloured bar in the agenda) AND the auto-assigned meeting-avatar tints
// (Recruitment_Copilot avatarColor.ts hashes into this same list). One source of
// truth so events and avatars stay visually consistent. Saturated enough to read
// as the thin agenda bar; ordered by hue. Provider events have no stored colour
// and fall back to a hashed tint from this list.
export const MANUAL_EVENT_COLORS = [
  "#d06b5a", // coral red
  "#c97b54", // terracotta
  "#e0b24a", // gold
  "#9aa84e", // olive
  "#6fae6f", // green
  "#4a9d8e", // teal
  "#5a8bc2", // blue
  "#8b7fd6", // lavender
  "#b56fbf", // orchid
  "#d67b9c", // rose
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

export interface UpdateManualEventRequest {
  title: string;
  startsAt: string;
  endsAt: string;
  timeZone?: string | null;
  color?: string | null;
}

export interface UpdateManualEventResponse {
  event: CalendarEvent;
}

export interface DeleteManualEventResponse {
  deleted: boolean;
}
