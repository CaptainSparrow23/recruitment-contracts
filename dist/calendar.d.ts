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
export type CalendarEventSource = "google" | "microsoft" | "manual";
export declare const MANUAL_EVENT_COLORS: readonly ["#8b7fd6", "#e0b24a", "#4a9d8e", "#d67b9c", "#6fae6f", "#c97b54"];
export type ManualEventColor = (typeof MANUAL_EVENT_COLORS)[number];
export interface CalendarEvent {
    id: string;
    source: CalendarEventSource;
    title: string | null;
    startsAt: string;
    endsAt: string;
    timeZone: string | null;
    attendees: CalendarAttendeePreview[];
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
export declare const MANUAL_EVENT_TITLE_MAX_LENGTH = 200;
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
