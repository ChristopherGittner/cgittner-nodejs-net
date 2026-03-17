/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import EventEmitter from "events";
import { Socket } from "net";
import { Log } from "cgittner-nodejs-common";
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
export declare abstract class NetClientBase extends EventEmitter {
    #private;
    private name?;
    protected socket: Socket;
    protected connected: boolean;
    private started;
    private connectTimer?;
    private stopResolve?;
    private stopPromise?;
    protected log: Log;
    private readonly onConnect;
    private readonly onClose;
    private readonly onError;
    private readonly onData;
    /**
     * @param host Hostname or IP Address of the Server
     * @param port Port of the Server
     * @param name Optional Name for this Client used in Logs
     */
    constructor(host: string, port: number, name?: string);
    /** Updates the logger label to reflect the current host, port, and name. */
    setLog(): void;
    /** The hostname or IP address of the remote server. Setting this while connected triggers a reconnect. */
    get host(): string;
    set host(host: string);
    /** The port of the remote server. Setting this while connected triggers a reconnect. */
    get port(): number;
    set port(port: number);
    /**
     * Starts the client and initiates the first connection attempt.
     * Does nothing if the client is already started.
     */
    start(): void;
    /**
     * Stops the client and closes the active connection.
     * If called while already stopping, returns the same in-flight promise.
     * @returns A Promise that resolves once the socket has fully closed.
     */
    stop(): Promise<void>;
    /** Returns `true` if the client has been started and has not yet been stopped. */
    isStarted(): boolean;
    /**
     * Disconnects the current socket and schedules a new connection attempt.
     * Any pending connect timer is cancelled before reconnecting.
     * Called automatically when `host` or `port` is changed at runtime.
     */
    reset(): void;
    /**
     * Sends data over the active connection.
     * @param data The data to send.
     * @throws {Error} If the client is not currently connected.
     */
    write(data: any): void;
    private reconnect;
    /**
     * Creates and returns a new connected Socket. Implemented by subclasses.
     * Called by `reconnect()` each time a new connection attempt is made.
     * The returned socket will have all event listeners attached automatically.
     */
    abstract doConnect(): Socket;
    private handleConnect;
    private handleClose;
    private handleError;
    /** The underlying Node.js `Socket` instance for the current connection. */
    get rawSocket(): Socket;
}
