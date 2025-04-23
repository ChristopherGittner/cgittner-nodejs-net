import EventEmitter from "events";
import { Socket } from "net";
import { Log } from "cgittner-nodejs-common";
export declare interface NetClientBase {
    on(event: "data", listener: (data: Buffer) => void): this;
    once(event: "data", listener: (data: Buffer) => void): this;
    off(event: "data", listener: (data: Buffer) => void): this;
    emit(event: "data", data: Buffer): boolean;
    on(event: "connected", listener: (socket: Socket) => void): this;
    once(event: "connected", listener: (socket: Socket) => void): this;
    off(event: "connected", listener: (socket: Socket) => void): this;
    emit(event: "connected", socket: Socket): boolean;
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
    /**
     * @param host Hostname or IP Address of the Server
     * @param port Port of the Server
     * @param name Optional Name for this Client used in Logs
     */
    constructor(host: string, port: number, name?: string);
    setLog(): void;
    get host(): string;
    set host(host: string);
    get port(): number;
    set port(port: number);
    start(): void;
    stop(): Promise<void>;
    isStarted(): boolean;
    reset(): void;
    write(data: any): void;
    private reconnect;
    abstract doConnect(): Socket;
    private handleConnect;
    private handleClose;
    private handleError;
    get rawSocket(): Socket;
}
