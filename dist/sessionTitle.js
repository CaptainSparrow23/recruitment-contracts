export const UNTITLED_MEETING_FALLBACK = "Untitled Meeting";
export function resolveSessionTitle(session) {
    return (session.userMeetingTitle ??
        session.calendarEvent?.title ??
        session.meetingTitle ??
        UNTITLED_MEETING_FALLBACK);
}
export function hasResolvedSessionTitle(session) {
    return Boolean(session.userMeetingTitle ??
        session.calendarEvent?.title ??
        session.meetingTitle);
}
