import EventEmitter from "events";
import { Socket } from "net";
import { Log, getErrorMessage } from "cgittner-nodejs-common";
export class NetClientBase extends EventEmitter {
    socket;
    connected = false;
    started = false;
    connectTimer;
    stopResolve;
    stopPromise;
    log;
    name;
    reconnectDelay;
    #host;
    #port;
    onConnect = this.handleConnect.bind(this);
    onClose = this.handleClose.bind(this);
    onError = this.handleError.bind(this);
    onData = (data) => this.emit("data", data);
    /**
     * @param host Hostname or IP Address of the Server
     * @param port Port of the Server
     * @param config Optional configuration for this client.
     */
    constructor(host, port, config) {
        super();
        this.name = config?.name;
        this.reconnectDelay = config?.reconnectDelay ?? 1000;
        this.host = host;
        this.port = port;
        this.setLog();
        this.socket = new Socket();
        this.socket.on('connect', this.onConnect);
        this.socket.on('close', this.onClose);
        this.socket.on('error', this.onError);
        this.socket.on('data', this.onData);
    }
    /** Updates the logger label to reflect the current host, port, and name. */
    setLog() {
        this.log = new Log(`${this.name ? `${this.name} @ ` : ''}${this.#host}:${this.#port}`);
    }
    /** The hostname or IP address of the remote server. Setting this while connected triggers a reconnect. */
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
    /** The port of the remote server. Setting this while connected triggers a reconnect. */
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
    /**
     * Starts the client and initiates the first connection attempt.
     * Does nothing if the client is already started.
     */
    start() {
        if (this.started) {
            return;
        }
        this.log.trace("Starting");
        this.started = true;
        this.reconnect();
    }
    /**
     * Stops the client and closes the active connection.
     * If called while already stopping, returns the same in-flight promise.
     * @returns A Promise that resolves once the socket has fully closed.
     */
    stop() {
        if (!this.started) {
            return Promise.resolve();
        }
        if (this.stopPromise) {
            return this.stopPromise;
        }
        this.log.trace("Stopping");
        if (this.connectTimer) {
            clearTimeout(this.connectTimer);
            this.connectTimer = undefined;
        }
        this.stopPromise = new Promise(resolve => {
            this.stopResolve = resolve;
        }).then(() => {
            this.log.trace("Stopped");
            this.started = false;
            this.stopResolve = undefined;
            this.stopPromise = undefined;
        });
        this.socket.destroy();
        return this.stopPromise;
    }
    /** Returns `true` if the client has been started and has not yet been stopped. */
    isStarted() {
        return this.started;
    }
    /**
     * Disconnects the current socket and schedules a new connection attempt.
     * Any pending connect timer is cancelled before reconnecting.
     * Called automatically when `host` or `port` is changed at runtime.
     */
    reset() {
        if (!this.started)
            return; // don't reconnect if not started
        this.log.trace("Resetting");
        this.socket.off('connect', this.onConnect);
        this.socket.off('close', this.onClose);
        this.socket.off('error', this.onError);
        this.socket.off('data', this.onData);
        if (this.connectTimer) {
            clearTimeout(this.connectTimer);
            this.connectTimer = undefined;
        }
        this.socket.destroy();
        this.reconnect();
    }
    /**
     * Sends data over the active connection.
     * @param data The data to send.
     * @throws {Error} If the client is not currently connected.
     */
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
                    this.socket.on('connect', this.onConnect);
                    this.socket.on('close', this.onClose);
                    this.socket.on('error', this.onError);
                    this.socket.on('data', this.onData);
                }
            }
            catch (err) {
                this.log.error(`Failed to connect: ${getErrorMessage(err)}`);
            }
            finally {
                this.connectTimer = undefined;
            }
        }, this.reconnectDelay);
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
    /** The underlying Node.js `Socket` instance for the current connection. */
    get rawSocket() {
        return this.socket;
    }
}
