import { createServer, Server, Socket } from "net";
import { Log } from "cgittner-nodejs-common";

/**
 * A Server that listens on a Port for new Clients.
 */
export abstract class NetServer {
    log: Log;

    protected server: Server;

    /**
     * Constructs a NetServer that will listen on the given Port for new Clients.
     * For each new the onNewClient callback is called
     * @param port The Port that this server listens on
     */
    constructor(private port: number, name = "NetServer") {
        this.log = new Log(`${name} @ ${port}`);

        this.server = createServer(socket => {
            this.onNewClient(socket);
        });
    }

    /**
     * Start the Server. This will allow Clients to connect to the Servers Port
     * and for each new client the onNewClien Callback is called
     */
    start(): void {
        this.log.trace("Starting");

        this.server.listen(this.port, () => {
            this.log.info(`Listening`);
        });
    }

    /**
     * Stops the Server and prevents new Clients from connecting.
     * @returns A Promise that is resolved, when the Server has stopped accepting new connections
     */
    stop(): Promise<void> {
        this.log.trace("Stopping");

        if (this.server) {
            this.server.close();
        }

        this.log.trace("Stopped");

        return Promise.resolve();
    }

    /**
     * Called when a new client connects
     * @param socket The socket of the new Connection
     */
    protected abstract onNewClient(socket: Socket): void;
}