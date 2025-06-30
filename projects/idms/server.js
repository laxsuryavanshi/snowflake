/* eslint-disable */
import { setupGracefulShutdown } from '@turtleby/graceful-shutdown';
import http from 'http';

import app from './app.js';
import { env } from './dist/env.js';
import logger from './logger.js';

const path = env('SOCKET_PATH', false);
const host = env('HOST', '0.0.0.0');
const port = env('PORT', !path && '3000');

const shutdown_timeout = parseInt(env('SHUTDOWN_TIMEOUT', '30'), 10);
const idle_timeout = parseInt(env('IDLE_TIMEOUT', '0'), 10);
const listen_pid = parseInt(env('LISTEN_PID', '0'), 10);
const listen_fds = parseInt(env('LISTEN_FDS', '0'), 10);
const SD_LISTEN_FDS_START = 3;

if (listen_pid !== 0 && listen_pid !== process.pid) {
  throw new Error(`Received LISTEN_PID ${listen_pid} but current process id is ${process.pid}`);
}
if (listen_fds > 1) {
  throw new Error(
    `Only one socket is allowed for socket activation, but LISTEN_FDS was set to ${listen_fds}`
  );
}

const socket_activation = listen_pid === process.pid && listen_fds === 1;

const server = http.createServer(app);

if (socket_activation) {
  server.listen({ fd: SD_LISTEN_FDS_START }, () => {
    logger.info(`Listening on file descriptor ${SD_LISTEN_FDS_START}`);
  });
} else {
  // Only include path if set, otherwise use host/port
  if (path) {
    server.listen({ path }, () => {
      logger.info(`Listening on ${path}`);
    });
  } else {
    server.listen({ host, port }, () => {
      logger.info(`Listening on http://${host}:${port}`);
    });
  }
}

// Setup graceful shutdown
setupGracefulShutdown(server, {
  shutdownTimeout: shutdown_timeout,
  idleTimeout: idle_timeout,
  socketActivation: socket_activation,
});

server.on(
  'error',
  /** @param {NodeJS.ErrnoException} error */
  err => {
    if (err.syscall !== 'listen') {
      throw err;
    }

    switch (err.code) {
      case 'EACCES':
        if (socket_activation) {
          logger.error(
            'Socket activation is enabled, but the process does not have permission to use the socket. ' +
              'Ensure that the socket is owned by the correct user or group.'
          );
        } else {
          logger.error(`Permission denied for ${path || `http://${host}:${port}`}`);
        }
        process.exit(1);
        break;
      case 'EADDRINUSE':
        if (socket_activation) {
          logger.error(
            'Socket activation is enabled, but the address is already in use. ' +
              'Ensure that no other service is using the same socket.'
          );
        } else {
          logger.error(`Address already in use: ${path || `http://${host}:${port}`}`);
        }
        process.exit(1);
        break;
      default:
        throw err;
    }
  }
);
