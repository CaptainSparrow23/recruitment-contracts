import type { SessionDetail, SessionSummary } from "./http.js";

export const UNTITLED_MEETING_FALLBACK = "Untitled Meeting";

type TitleSource = Pick<
  SessionSummary | SessionDetail,
  "userMeetingTitle" | "meetingTitle" | "calendarEvent"
>;

export function resolveSessionTitle(session: TitleSource): string {
  return (
    session.userMeetingTitle ??
    session.calendarEvent?.title ??
    session.meetingTitle ??
    UNTITLED_MEETING_FALLBACK
  );
}

export function hasResolvedSessionTitle(session: TitleSource): boolean {
  return Boolean(
    session.userMeetingTitle ??
      session.calendarEvent?.title ??
      session.meetingTitle
  );
}
