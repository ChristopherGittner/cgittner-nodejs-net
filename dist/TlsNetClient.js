import { connect } from "tls";
import { NetClientBase } from "./NetClientBase.js";
export class TlsNetClient extends NetClientBase {
    rejectUnauthorized;
    constructor(host, port, rejectUnauthorized = true, name) {
        super(host, port, name);
        this.rejectUnauthorized = rejectUnauthorized;
    }
    doConnect() {
        return connect({ host: this.host, port: this.port, rejectUnauthorized: this.rejectUnauthorized });
    }
}
