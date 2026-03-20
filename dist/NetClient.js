import { connect } from "net";
import { NetClientBase } from "./NetClientBase.js";
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
     * @param name Optional label used in log output to identify this client.
     */
    constructor(host, port, name) {
        super(host, port, name);
    }
    /**
     * Initiates a TCP connection with TCP keep-alive enabled.
     * Called automatically by the base class — do not call directly.
     */
    doConnect() {
        return connect({
            port: this.port,
            host: this.host,
            keepAlive: true,
            keepAliveInitialDelay: 0
        });
    }
}
