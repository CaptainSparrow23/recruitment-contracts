export type CalendarProvider = "google" | "microsoft";
export type CalendarConnectionStatus = "disconnected" | "connected" | "reconnect_required";
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
export interface SessionCalendarEventLink {
    provider: CalendarProvider;
    providerEventId: string;
    iCalUid: string | null;
    calendarId: string;
    calendarName: string;
    title: string | null;
    startsAt: string;
    endsAt: string;
    sourceTimeZone: string | null;
    attendees: CalendarAttendeePreview[];
    meetingUrl: string | null;
}
export interface UpcomingCalendarEvent extends SessionCalendarEventLink {
    providerEmail: string | null;
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
    events: UpcomingCalendarEvent[];
}
