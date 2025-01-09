import { Socket } from "net";
import { NetClientBase } from "./NetClientBase.js";
export declare class NetClient extends NetClientBase {
    /**
     * @param host Hostname or IP Address of the Server
     * @param port Port of the Server
     * @param name Optional Name for this Client used in Logs
     */
    constructor(host: string, port: number, name?: string);
    doConnect(): Socket;
}
