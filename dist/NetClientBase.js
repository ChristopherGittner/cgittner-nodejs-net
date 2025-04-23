import EventEmitter from "events";
import { Socket } from "net";
import { Log, getErrorMessage } from "cgittner-nodejs-common";
export class NetClientBase extends EventEmitter {
    name;
    socket;
    connected = false;
    started = false;
    connectTimer;
    stopResolve;
    stopPromise;
    log;
    #host;
    #port;
    /**
     * @param host Hostname or IP Address of the Server
     * @param port Port of the Server
     * @param name Optional Name for this Client used in Logs
     */
    constructor(host, port, name) {
        super();
        this.name = name;
        this.host = host;
        this.port = port;
        this.setLog();
        this.socket = new Socket();
        this.socket.on('connect', this.handleConnect.bind(this));
        this.socket.on('close', this.handleClose.bind(this));
        this.socket.on('error', this.handleError.bind(this));
        this.socket.on('data', data => this.emit("data", data));
    }
    setLog() {
        this.log = new Log(`${this.name ? `${this.name} @ ` : ''}${this.#host}:${this.#port}`);
    }
    get host() {
        return this.#host;
    }
    set host(host) {
        if (this.#host === undefined) {
            this.#host = host;
        }
        else {
            this.log.trace(`Host changed from ${this.#host} to ${host} --> Resetting`);
            this.#host = host;
            this.setLog();
            this.reset();
        }
    }
    get port() {
        return this.#port;
    }
    set port(port) {
        if (this.#port === undefined) {
            this.#port = port;
        }
        else {
            this.log.trace(`Port changed from ${this.#port} to ${port} --> Resetting`);
            this.#port = port;
            this.setLog();
            this.reset();
        }
    }
    start() {
        if (this.started) {
            return;
        }
        this.log.trace("Starting");
        this.started = true;
        this.reconnect();
    }
    stop() {
        if (!this.started) {
            return Promise.resolve();
        }
        if (this.stopPromise) {
            return this.stopPromise;
        }
        this.log.trace("Stopping");
        this.socket.destroy();
        this.stopPromise = new Promise(resolve => {
            this.stopResolve = resolve;
        }).then(() => {
            this.log.trace("Stopped");
            this.started = false;
            this.stopResolve = undefined;
            this.stopPromise = undefined;
        });
        return this.stopPromise;
    }
    isStarted() {
        return this.started;
    }
    reset() {
        this.log.trace("Resetting");
        this.socket.destroy();
    }
    write(data) {
        if (!this.connected) {
            throw new Error('Failed to send Data: Not connected');
        }
        this.socket.write(data);
    }
    reconnect() {
        // Only connect once
        if (this.connectTimer)
            return;
        this.connectTimer = setTimeout(() => {
            try {
                if (!this.stopPromise) {
                    this.socket = this.doConnect();
                }
            }
            catch (err) {
                this.log.error(`Failed to connect: ${getErrorMessage(err)}`);
            }
            finally {
                this.connectTimer = undefined;
            }
        }, 1000);
    }
    handleConnect() {
        this.log.info('Connected');
        this.connected = true;
        this.emit("connected", this.socket);
    }
    handleClose() {
        this.connected = false;
        this.emit("disconnected");
        if (this.stopResolve) {
            this.stopResolve();
        }
        else if (this.started) {
            this.log.warn('Connection closed. Reconnecting...');
            this.reconnect();
        }
    }
    handleError(reason) {
        this.log.warn(reason.message);
    }
    get rawSocket() {
        return this.socket;
    }
}
