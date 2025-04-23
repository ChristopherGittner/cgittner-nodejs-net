import EventEmitter from "events";
import { Socket } from "net";
import { Log, getErrorMessage } from "cgittner-nodejs-common";

export declare interface NetClientBase {
    // Emit when Data is received
    on(event: "data", listener: (data: Buffer) => void): this;
    once(event: "data", listener: (data: Buffer) => void): this;
    off(event: "data", listener: (data: Buffer) => void): this;
    emit(event: "data", data: Buffer): boolean;

    // Emit when the Client is connected
    on(event: "connected", listener: (socket: Socket) => void): this;
    once(event: "connected", listener: (socket: Socket) => void): this;
    off(event: "connected", listener: (socket: Socket) => void): this;
    emit(event: "connected", socket: Socket): boolean;

    // Emit when the Client is disconnected
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
        this.socket.on('connect', this.handleConnect.bind(this));
        this.socket.on('close', this.handleClose.bind(this));
        this.socket.on('error', this.handleError.bind(this));
        this.socket.on('data', data => this.emit("data", data));
    }

    setLog() {
        this.log = new Log(`${this.name ? `${this.name} @ ` : ''}${this.#host}:${this.#port}`);
    }

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

    start(): void {
        if (this.started) {
            return;
        }

        this.log.trace("Starting");

        this.started = true;
        this.reconnect();
    }

    stop(): Promise<void> {
        if (!this.started) {
            return Promise.resolve();
        }
        if (this.stopPromise) {
            return this.stopPromise;
        }

        this.log.trace("Stopping");

        this.socket.destroy();

        this.stopPromise = new Promise<void>(resolve => {
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

    reset(): void {
        this.log.trace("Resetting")
        this.socket.destroy();
    }

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
                }
            } catch (err) {
                this.log.error(`Failed to connect: ${getErrorMessage(err)}`);
            } finally {
                this.connectTimer = undefined;
            }
        }, 1000);
    }

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

    public get rawSocket(): Socket {
        return this.socket
    }
}
