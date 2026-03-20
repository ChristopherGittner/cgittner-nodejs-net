import { createServer } from "net";
import { Log } from "cgittner-nodejs-common";
/**
 * An abstract TCP server that listens for incoming client connections on a given port.
 * Subclasses implement {@link onNewClient} to handle each new connection.
 *
 * @example
 * class MyServer extends NetServer {
 *     protected onNewClient(socket: Socket): void {
 *         socket.on("data", data => console.log(data.toString()));
 *     }
 * }
 *
 * const server = new MyServer(8080);
 * server.start();
 */
export class NetServer {
    port;
    log;
    server;
    /**
     * @param port The port to listen on for incoming connections.
     * @param name Optional label used in log output to identify this server. Defaults to `"NetServer"`.
     */
    constructor(port, name = "NetServer") {
        this.port = port;
        this.log = new Log(`${name} @ ${port}`);
        this.server = createServer(socket => {
            this.onNewClient(socket);
        });
    }
    /**
     * Starts the server and begins accepting incoming connections.
     * For each new connection, {@link onNewClient} is called with the client's socket.
     */
    start() {
        this.log.trace("Starting");
        this.server.listen(this.port, () => {
            this.log.info(`Listening`);
        });
    }
    /**
     * Stops the server and prevents new clients from connecting.
     * Existing connections are not forcibly terminated.
     * @returns A Promise that resolves once the server has fully closed.
     */
    stop() {
        this.log.trace("Stopping");
        return new Promise(resolve => {
            this.server.close(() => {
                this.log.trace("Stopped");
                resolve();
            });
        });
    }
}
