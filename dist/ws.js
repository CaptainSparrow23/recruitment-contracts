export const PROTOCOL_VERSION = "2026-03-06";
export const WEBSOCKET_PATH = "/ws";
export const CLIENT_MESSAGE_TYPES = {
    PING: "client/ping",
    SESSION_SUBSCRIBE: "session/subscribe"
};
export const SERVER_MESSAGE_TYPES = {
    ACK: "server/ack",
    ERROR: "server/error",
    HEARTBEAT: "server/heartbeat",
    WELCOME: "server/welcome"
};
export function isClientMessage(value) {
    if (!isRecord(value) || typeof value.type !== "string") {
        return false;
    }
    switch (value.type) {
        case CLIENT_MESSAGE_TYPES.PING:
            return typeof value.sentAt === "string";
        case CLIENT_MESSAGE_TYPES.SESSION_SUBSCRIBE:
            return typeof value.sessionId === "string";
        default:
            return false;
    }
}
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
