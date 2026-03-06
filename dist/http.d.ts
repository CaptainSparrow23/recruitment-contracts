import { PROTOCOL_VERSION, WEBSOCKET_PATH } from "./ws.js";
export declare const HEALTH_PATH = "/health";
export interface HealthResponse {
    status: "ok";
    service: "recruitment-backend";
    protocolVersion: typeof PROTOCOL_VERSION;
    timestamp: string;
    uptimeSeconds: number;
    websocketPath: typeof WEBSOCKET_PATH;
}
