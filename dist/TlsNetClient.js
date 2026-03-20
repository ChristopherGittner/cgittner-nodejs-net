import { connect } from "tls";
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
 * const client = new TlsNetClient("192.168.1.1", 8443, { rejectUnauthorized: false });
 */
export class TlsNetClient extends NetClientBase {
    rejectUnauthorized;
    /**
     * @param host Hostname or IP address of the remote server.
     * @param port Port of the remote server.
     * @param config Optional configuration for this client.
     */
    constructor(host, port, config) {
        super(host, port, config);
        this.rejectUnauthorized = config?.rejectUnauthorized ?? true;
    }
    /**
     * Initiates a TLS connection to the configured host and port.
     * Called automatically by the base class — do not call directly.
     */
    doConnect() {
        return connect({ host: this.host, port: this.port, rejectUnauthorized: this.rejectUnauthorized });
    }
}
