import { createServer, Server, Socket } from "net";
import { Deferred, Log } from "cgittner-nodejs-common";

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
export abstract class NetServer {
    private log: Log;

    protected server: Server;

    /**
     * @param port The port to listen on for incoming connections.
     * @param name Optional label used in log output to identify this server. Defaults to `"NetServer"`.
     */
    constructor(private port: number, name = "NetServer") {
        this.log = new Log(`${name} @ ${port}`);

        this.server = createServer(socket => {
            this.onNewClient(socket);
        });
    }

    /**
     * Starts the server and begins accepting incoming connections.
     * For each new connection, {@link onNewClient} is called with the client's socket.
     */
    start(): void {
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
    stop(): Promise<void> {
        this.log.trace("Stopping");

        return new Promise(resolve => {
            this.server.close(() => {
                this.log.trace("Stopped");
                resolve();
            });
        });
    }

    /**
     * Called whenever a new client connects to the server.
     * Implement this in subclasses to handle incoming connections.
     * @param socket The socket representing the new client connection.
     */
    protected abstract onNewClient(socket: Socket): void;
}