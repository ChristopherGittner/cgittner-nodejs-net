import { createServer } from "net";
import { Log } from "cgittner-nodejs-common";
/**
 * A Server that listens on a Port for new Clients.
 */
export class NetServer {
    port;
    log;
    server;
    /**
     * Constructs a NetServer that will listen on the given Port for new Clients.
     * For each new the onNewClient callback is called
     * @param port The Port that this server listens on
     */
    constructor(port, name = "NetServer") {
        this.port = port;
        this.log = new Log(`${name} @ ${port}`);
        this.server = createServer(socket => {
            this.onNewClient(socket);
        });
    }
    /**
     * Start the Server. This will allow Clients to connect to the Servers Port
     * and for each new client the onNewClien Callback is called
     */
    start() {
        this.log.trace("Starting");
        this.server.listen(this.port, () => {
            this.log.info(`Listening`);
        });
    }
    /**
     * Stops the Server and prevents new Clients from connecting.
     * @returns A Promise that is resolved, when the Server has stopped accepting new connections
     */
    stop() {
        this.log.trace("Stopping");
        if (this.server) {
            this.server.close();
        }
        this.log.trace("Stopped");
        return Promise.resolve();
    }
}
