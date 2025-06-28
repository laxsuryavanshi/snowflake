/* eslint-disable */
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

let requests = 0;
/** @type {NodeJS.Timeout | undefined} */
let shutdown_timeout_id;
/** @type {NodeJS.Timeout | undefined} */
let idle_timeout_id;

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

/** @param {'SIGINT' | 'SIGTERM' | 'IDLE'} reason */
function graceful_shutdown(reason) {
  if (shutdown_timeout_id) {
    return;
  }

  logger.info(`Shutting down server due to: ${reason}`);

  // If a connection was opened with a keep-alive header, close() will wait for the connection to
  // time out rather than close it even if it is not handling any requests, so call this first
  if (typeof server.closeIdleConnections === 'function') {
    server.closeIdleConnections();
  }

  server.close(error => {
    // occurs if the server is already closed
    if (error) {
      return;
    }
    if (shutdown_timeout_id) {
      clearTimeout(shutdown_timeout_id);
    }
    if (idle_timeout_id) {
      clearTimeout(idle_timeout_id);
    }

    process.emit('server:shutdown', reason);
  });

  shutdown_timeout_id = setTimeout(() => {
    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }
  }, shutdown_timeout * 1000);
}

server.on(
  'request',
  /** @param {http.IncomingMessage} req */
  req => {
    requests++;

    if (socket_activation && idle_timeout_id) {
      clearTimeout(idle_timeout_id);
      idle_timeout_id = undefined;
    }

    req.on('close', () => {
      requests--;

      if (shutdown_timeout_id) {
        // close connections as soon as they become idle, so they don't accept new requests
        server.closeIdleConnections();
      }
      if (requests === 0 && socket_activation && idle_timeout) {
        idle_timeout_id = setTimeout(() => {
          graceful_shutdown('IDLE');
        }, idle_timeout * 1000);
      }
    });
  }
);
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

process.on('SIGTERM', graceful_shutdown);
process.on('SIGINT', graceful_shutdown);
