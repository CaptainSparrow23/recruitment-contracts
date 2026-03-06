export declare const PROTOCOL_VERSION = "2026-03-06";
export declare const WEBSOCKET_PATH = "/ws";
export declare const CLIENT_MESSAGE_TYPES: {
    readonly PING: "client/ping";
    readonly SESSION_SUBSCRIBE: "session/subscribe";
};
export declare const SERVER_MESSAGE_TYPES: {
    readonly ACK: "server/ack";
    readonly ERROR: "server/error";
    readonly HEARTBEAT: "server/heartbeat";
    readonly WELCOME: "server/welcome";
};
export type ClientMessageType = (typeof CLIENT_MESSAGE_TYPES)[keyof typeof CLIENT_MESSAGE_TYPES];
export type ServerMessageType = (typeof SERVER_MESSAGE_TYPES)[keyof typeof SERVER_MESSAGE_TYPES];
export interface ClientPingMessage {
    type: typeof CLIENT_MESSAGE_TYPES.PING;
    sentAt: string;
}
export interface SessionSubscribeMessage {
    type: typeof CLIENT_MESSAGE_TYPES.SESSION_SUBSCRIBE;
    sessionId: string;
}
export type ClientMessage = ClientPingMessage | SessionSubscribeMessage;
export interface ServerWelcomeMessage {
    type: typeof SERVER_MESSAGE_TYPES.WELCOME;
    connectedAt: string;
    protocolVersion: typeof PROTOCOL_VERSION;
}
export interface ServerHeartbeatMessage {
    type: typeof SERVER_MESSAGE_TYPES.HEARTBEAT;
    timestamp: string;
}
export interface ServerAckMessage {
    type: typeof SERVER_MESSAGE_TYPES.ACK;
    receivedType: ClientMessageType;
}
export interface ServerErrorMessage {
    type: typeof SERVER_MESSAGE_TYPES.ERROR;
    code: "bad_request";
    message: string;
}
export type ServerMessage = ServerWelcomeMessage | ServerHeartbeatMessage | ServerAckMessage | ServerErrorMessage;
export declare function isClientMessage(value: unknown): value is ClientMessage;
