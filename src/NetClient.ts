import { connect, Socket } from "net";
import { NetClientBase, NetClientConfig } from "./NetClientBase.js";

/**
 * A TCP client that automatically reconnects on connection loss.
 *
 * @example
 * const client = new NetClient("192.168.1.1", 8080);
 * client.on("data", data => console.log(data.toString()));
 * client.start();
 */
export class NetClient extends NetClientBase {
    /**
     * @param host Hostname or IP address of the remote server.
     * @param port Port of the remote server.
     * @param config Optional configuration for this client.
     */
    constructor(host: string, port: number, config?: NetClientConfig) {
        super(host, port, config);
    }

    /**
     * Initiates a TCP connection with TCP keep-alive enabled.
     * Called automatically by the base class — do not call directly.
     */
    doConnect(): Socket {
        return connect({
            port: this.port,
            host: this.host,
            keepAlive: true,
            keepAliveInitialDelay: 0
        });
    }
}
