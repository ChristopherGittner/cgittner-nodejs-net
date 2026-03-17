import EventEmitter from "events";
import { Socket } from "net";
import { Log, getErrorMessage } from "cgittner-nodejs-common";

export declare interface NetClientBase {
    /** Emitted when data is received from the remote server. */
    on(event: "data", listener: (data: Buffer) => void): this;
    once(event: "data", listener: (data: Buffer) => void): this;
    off(event: "data", listener: (data: Buffer) => void): this;
    emit(event: "data", data: Buffer): boolean;

    /** Emitted when a connection to the remote server is established. */
    on(event: "connected", listener: (socket: Socket) => void): this;
    once(event: "connected", listener: (socket: Socket) => void): this;
    off(event: "connected", listener: (socket: Socket) => void): this;
    emit(event: "connected", socket: Socket): boolean;

    /** Emitted when the connection to the remote server is lost or closed. */
    on(event: "disconnected", listener: () => void): this;
    once(event: "disconnected", listener: () => void): this;
    off(event: "disconnected", listener: () => void): this;
    emit(event: "disconnected"): boolean;
}

export abstract class NetClientBase extends EventEmitter {
    protected socket: Socket;
    protected connected = false;
    private started = false;
    private connectTimer?: NodeJS.Timeout;

    private stopResolve?: () => void;
    private stopPromise?: Promise<void>;

    protected log: Log;

    #host: string;
    #port: number;

    private readonly onConnect = this.handleConnect.bind(this);
    private readonly onClose = this.handleClose.bind(this);
    private readonly onError = this.handleError.bind(this);
    private readonly onData = (data: Buffer) => this.emit("data", data);

    /**
     * @param host Hostname or IP Address of the Server
     * @param port Port of the Server
     * @param name Optional Name for this Client used in Logs
     */
    constructor(host: string, port: number, private name?: string) {
        super();

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
    get host(): string {
        return this.#host;
    }
    set host(host: string) {
        if (this.#host === undefined) {
            this.#host = host;
        } else {
            this.log.trace(`Host changed from ${this.#host} to ${host} --> Resetting`);
            this.#host = host;
            this.setLog();
            this.reset();
        }
    }

    /** The port of the remote server. Setting this while connected triggers a reconnect. */
    get port(): number {
        return this.#port;
    }
    set port(port: number) {
        if (this.#port === undefined) {
            this.#port = port;
        } else {
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
    start(): void {
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
    stop(): Promise<void> {
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

        this.stopPromise = new Promise<void>(resolve => {
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
    reset(): void {
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
    write(data: any): void {
        if (!this.connected) {
            throw new Error('Failed to send Data: Not connected');
        }

        this.socket.write(data);
    }

    private reconnect(): void {
        // Only connect once
        if (this.connectTimer) return;

        this.connectTimer = setTimeout(() => {
            try {
                if (!this.stopPromise) {
                    this.socket = this.doConnect();
                    this.socket.on('connect', this.onConnect);
                    this.socket.on('close', this.onClose);
                    this.socket.on('error', this.onError);
                    this.socket.on('data', this.onData);
                }
            } catch (err) {
                this.log.error(`Failed to connect: ${getErrorMessage(err)}`);
            } finally {
                this.connectTimer = undefined;
            }
        }, 1000);
    }

    /**
     * Creates and returns a new connected Socket. Implemented by subclasses.
     * Called by `reconnect()` each time a new connection attempt is made.
     * The returned socket will have all event listeners attached automatically.
     */
    abstract doConnect(): Socket;

    private handleConnect(): void {
        this.log.info('Connected');

        this.connected = true;
        this.emit("connected", this.socket);
    }

    private handleClose(): void {
        this.connected = false;
        this.emit("disconnected");

        if (this.stopResolve) {
            this.stopResolve();
        } else if (this.started) {
            this.log.warn('Connection closed. Reconnecting...');

            this.reconnect();
        }
    }

    private handleError(reason: Error): void {
        this.log.warn(reason.message);
    }

    /** The underlying Node.js `Socket` instance for the current connection. */
    public get rawSocket(): Socket {
        return this.socket
    }
}
