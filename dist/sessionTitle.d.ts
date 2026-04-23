import type { SessionDetail, SessionSummary } from "./http.js";
export declare const UNTITLED_MEETING_FALLBACK = "Untitled Meeting";
type TitleSource = Pick<SessionSummary | SessionDetail, "userMeetingTitle" | "meetingTitle" | "calendarEvent">;
export declare function resolveSessionTitle(session: TitleSource): string;
export declare function hasResolvedSessionTitle(session: TitleSource): boolean;
export {};
