import type { Server } from 'http';

/**
 * Sets up graceful shutdown for a Node.js HTTP server, handling termination signals and idle
 * timeouts.
 *
 * This utility ensures that your server closes connections gracefully when receiving SIGTERM
 * or SIGINT, or when idle (if socket activation and idleTimeout are enabled). It is compatible
 * with systemd socket activation and supports both standard and advanced Node.js HTTP server
 * features.
 *
 * Example usage:
 * ```javascript
 *   import { setupGracefulShutdown } from '@turtleby/graceful-shutdown';
 *   import http from 'http';
 *   const server = http.createServer(app);
 *
 *   // Basic usage with defaults
 *   setupGracefulShutdown(server);
 *
 *   // Or with custom options
 *   setupGracefulShutdown(server, {
 *     shutdownTimeout: 30, // seconds
 *     idleTimeout: 60,     // seconds (optional)
 *     socketActivation: false // set true if using systemd socket activation
 *   });
 * ```
 *
 * @param server - The HTTP server instance to manage.
 * @param options - Configuration options (optional).
 * @param options.shutdownTimeout - Seconds to wait before force closing all connections after
 *                                  shutdown is triggered. Default: 30
 * @param options.idleTimeout - Seconds to wait before shutting down when idle
 *                              (only with socket activation). Default: 0
 * @param options.socketActivation - Set to true if using systemd socket activation
 *                                   (LISTEN_PID/LISTEN_FDS). Default: false
 * @returns A function to trigger graceful shutdown manually
 *          (e.g., for custom signal handling or tests).
 * @throws {TypeError} When server is not a valid HTTP server instance
 * @throws {TypeError} When options contain invalid values
 */
export declare function setupGracefulShutdown(
  server: Server,
  options?: {
    shutdownTimeout?: number;
    idleTimeout?: number;
    socketActivation?: boolean;
  }
): (reason: string) => void;
