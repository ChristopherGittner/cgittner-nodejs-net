import { Socket } from "net";
import { connect } from "tls";
import { NetClientBase } from "./NetClientBase.js";

export class TlsNetClient extends NetClientBase {
    constructor(host: string, port: number, private rejectUnauthorized = true, name?: string) {
        super(host, port, name);
    }

    doConnect(): Socket {
        return connect({ host: this.host, port: this.port, rejectUnauthorized: this.rejectUnauthorized });
    }
}
