import debugLib from 'debug';

const debug = debugLib('turtleby:graceful-shutdown');

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
 * @param {import('http').Server} server - The HTTP server instance to manage.
 * @param {Object} [options={}] - Configuration options (optional).
 * @param {number} [options.shutdownTimeout=30] - Seconds to wait before force closing all
 *                                                connections after shutdown is triggered.
 * @param {number} [options.idleTimeout=0] - Seconds to wait before shutting down when idle
 *                                           (only with socket activation).
 * @param {boolean} [options.socketActivation=false] - Set to true if using systemd socket activation
 *                                                     (LISTEN_PID/LISTEN_FDS).
 * @returns {(reason: string) => void} - A function to trigger graceful shutdown manually
 *                                       (e.g., for custom signal handling or tests).
 */
export function setupGracefulShutdown(
  server,
  { shutdownTimeout = 30, idleTimeout = 0, socketActivation = false } = {}
) {
  // Input validation
  if (!server || typeof server.close !== 'function' || typeof server.on !== 'function') {
    throw new TypeError('Expected server to be an HTTP server instance');
  }

  if (typeof shutdownTimeout !== 'number' || shutdownTimeout < 0) {
    throw new TypeError('Expected shutdownTimeout to be a non-negative number');
  }

  if (typeof idleTimeout !== 'number' || idleTimeout < 0) {
    throw new TypeError('Expected idleTimeout to be a non-negative number');
  }

  if (typeof socketActivation !== 'boolean') {
    throw new TypeError('Expected socketActivation to be a boolean');
  }

  let requests = 0;
  /** @type {NodeJS.Timeout | undefined} */
  let shutdownTimeoutId;
  /** @type {NodeJS.Timeout | undefined} */
  let idleTimeoutId;
  let isShuttingDown = false;

  /**
   * Triggers a graceful shutdown of the server.
   *
   * - Stops accepting new connections.
   * - Waits for ongoing requests to finish.
   * - After `shutdownTimeout` seconds, forcibly closes all connections if any remain.
   * - Emits a 'server:shutdown' event on process when complete.
   *
   * @param {'SIGINT' | 'SIGTERM' | 'IDLE' | string} reason - The reason for shutdown.
   */
  function gracefulShutdown(reason) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    debug('Shutting down server due to: ' + String(reason));

    // Attempt to close idle keep-alive connections first (Node.js >= 18)
    if (typeof server.closeIdleConnections === 'function') {
      server.closeIdleConnections();
    }

    server.close(error => {
      if (error) return;
      if (shutdownTimeoutId) clearTimeout(shutdownTimeoutId);
      if (idleTimeoutId) clearTimeout(idleTimeoutId);

      // Clean up event listeners to prevent memory leaks
      process.removeListener('SIGTERM', gracefulShutdown);
      process.removeListener('SIGINT', gracefulShutdown);

      process.emit('server:shutdown', reason);
    });

    // Force close all connections after timeout
    shutdownTimeoutId = setTimeout(() => {
      debug('Force closing connections after timeout');
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      shutdownTimeoutId = undefined;
    }, shutdownTimeout * 1000);
  }

  // Track active requests and handle idle shutdown
  server.on('request', req => {
    requests++;

    if (socketActivation && idleTimeoutId) {
      clearTimeout(idleTimeoutId);
      idleTimeoutId = undefined;
    }

    req.on('close', () => {
      requests--;
      if (shutdownTimeoutId && typeof server.closeIdleConnections === 'function') {
        server.closeIdleConnections();
      }
      if (requests === 0 && socketActivation && idleTimeout) {
        idleTimeoutId = setTimeout(() => {
          gracefulShutdown('IDLE');
        }, idleTimeout * 1000);
      }
    });
  });

  // Listen for termination signals
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  return gracefulShutdown;
}
