/// <reference types="node" resolution-mode="require"/>
import { Socket } from "net";
import { NetClientBase, NetClientConfig } from "./NetClientBase.js";
/**
 * A TCP client that automatically reconnects on connection loss.
 *
 * @example
 * const client = new NetClient("192.168.1.1", 8080);
 * client.on("data", data => console.log(data.toString()));
 * client.start();
 */
export declare class NetClient extends NetClientBase {
    /**
     * @param host Hostname or IP address of the remote server.
     * @param port Port of the remote server.
     * @param config Optional configuration for this client.
     */
    constructor(host: string, port: number, config?: NetClientConfig);
    /**
     * Initiates a TCP connection with TCP keep-alive enabled.
     * Called automatically by the base class — do not call directly.
     */
    doConnect(): Socket;
}
