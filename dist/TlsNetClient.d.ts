import { Socket } from "net";
import { NetClientBase } from "./NetClientBase.js";
export declare class TlsNetClient extends NetClientBase {
    private rejectUnauthorized;
    constructor(host: string, port: number, rejectUnauthorized?: boolean, name?: string);
    doConnect(): Socket;
}
