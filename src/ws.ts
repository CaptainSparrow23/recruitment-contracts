export const PROTOCOL_VERSION = "2026-03-06";
export const WEBSOCKET_PATH = "/ws";

export const CLIENT_MESSAGE_TYPES = {
  PING: "client/ping",
  SESSION_SUBSCRIBE: "session/subscribe"
} as const;

export const SERVER_MESSAGE_TYPES = {
  ACK: "server/ack",
  ERROR: "server/error",
  HEARTBEAT: "server/heartbeat",
  WELCOME: "server/welcome"
} as const;

export type ClientMessageType =
  (typeof CLIENT_MESSAGE_TYPES)[keyof typeof CLIENT_MESSAGE_TYPES];

export type ServerMessageType =
  (typeof SERVER_MESSAGE_TYPES)[keyof typeof SERVER_MESSAGE_TYPES];

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

export type ServerMessage =
  | ServerWelcomeMessage
  | ServerHeartbeatMessage
  | ServerAckMessage
  | ServerErrorMessage;

export function isClientMessage(value: unknown): value is ClientMessage {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
