import { Socket } from "net";
import { Log } from "cgittner-nodejs-common";
/**
 * A Server that listens on a Port for new Clients.
 */
export declare abstract class NetServer {
    private port;
    log: Log;
    private server;
    /**
     * Constructs a NetServer that will listen on the given Port for new Clients.
     * For each new the onNewClient callback is called
     * @param port The Port that this server listens on
     */
    constructor(port: number, name?: string);
    /**
     * Start the Server. This will allow Clients to connect to the Servers Port
     * and for each new client the onNewClien Callback is called
     */
    start(): void;
    /**
     * Stops the Server and prevents new Clients from connecting.
     * @returns A Promise that is resolved, when the Server has stopped accepting new connections
     */
    stop(): Promise<void>;
    /**
     * Called when a new client connects
     * @param socket The socket of the new Connection
     */
    protected abstract onNewClient(socket: Socket): void;
}
