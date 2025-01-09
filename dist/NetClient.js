import { NetClientBase } from "./NetClientBase.js";
export class NetClient extends NetClientBase {
    /**
     * @param host Hostname or IP Address of the Server
     * @param port Port of the Server
     * @param name Optional Name for this Client used in Logs
     */
    constructor(host, port, name) {
        super(host, port, name);
    }
    doConnect() {
        return this.socket.connect({
            port: this.port,
            host: this.host,
            keepAlive: true,
            keepAliveInitialDelay: 0
        });
    }
}
