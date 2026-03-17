/// <reference types="node" resolution-mode="require"/>
import { Socket } from "net";
import { NetClientBase } from "./NetClientBase.js";
/**
 * A TLS-encrypted TCP client that automatically reconnects on connection loss.
 *
 * @example
 * const client = new TlsNetClient("192.168.1.1", 8443);
 * client.on("data", data => console.log(data.toString()));
 * client.start();
 *
 * @example
 * // Allow self-signed certificates (e.g. in development)
 * const client = new TlsNetClient("192.168.1.1", 8443, false);
 */
export declare class TlsNetClient extends NetClientBase {
    private rejectUnauthorized;
    /**
     * @param host Hostname or IP address of the remote server.
     * @param port Port of the remote server.
     * @param rejectUnauthorized Whether to reject connections with invalid or self-signed certificates. Defaults to `true`.
     * @param name Optional label used in log output to identify this client.
     */
    constructor(host: string, port: number, rejectUnauthorized?: boolean, name?: string);
    /**
     * Initiates a TLS connection to the configured host and port.
     * Called automatically by the base class — do not call directly.
     */
    doConnect(): Socket;
}
