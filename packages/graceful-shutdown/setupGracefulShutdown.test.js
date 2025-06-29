import http from 'http';
import { promisify } from 'util';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setupGracefulShutdown } from './setupGracefulShutdown.js';

/** @returns {Promise<void>} */
async function tick(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createTestServer() {
  const server = http.createServer((req, res) => {
    res.end('ok');
  });
  return server;
}

/**
 *
 * @param {http.Server} server
 * @returns {Promise<void>}
 */
async function startServer(server) {
  return new Promise(resolve => server.listen(0, resolve));
}

describe('setupGracefulShutdown', () => {
  /** @type {import('http').Server} */
  let server;
  /** @type {(reason: string) => void} */
  let shutdown;
  /** @type {() => Promise<void>} */
  let closeServer;

  beforeEach(() => {
    server = createTestServer();
    closeServer = promisify(server.close.bind(server));
    shutdown = setupGracefulShutdown(server, {
      shutdownTimeout: 1, // 1 second for fast tests
      idleTimeout: 0,
      socketActivation: false,
    });
  });

  afterEach(async () => {
    if (server.listening) {
      await closeServer();
    }
  });

  it('should return a function', () => {
    expect(typeof shutdown).toBe('function');
  });

  it('should close the server on shutdown', async () => {
    await startServer(server);
    expect(server.listening).toBe(true);
    shutdown('TEST');
    await tick(20);
    expect(server.listening).toBe(false);
  });

  it('should emit server:shutdown event on process', async () => {
    const spy = vi.fn();
    process.once('server:shutdown', spy);
    await startServer(server);
    shutdown('TEST');
    await tick(20);
    expect(spy).toHaveBeenCalledExactlyOnceWith('TEST');
  });

  it('should not double-shutdown if called multiple times', async () => {
    const spy = vi.fn();
    process.once('server:shutdown', spy);
    await startServer(server);
    shutdown('FIRST');
    shutdown('SECOND');
    await tick(20);
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should work if shutdown is called when no requests are active', async () => {
    await startServer(server);
    shutdown('NO_REQUESTS');
    await tick(20);
    expect(server.listening).toBe(false);
  });

  it('should handle shutdown during active requests', async () => {
    await startServer(server);
    // Simulate a request that stays open
    const req = new http.IncomingMessage();
    const res = new http.ServerResponse(req);
    server.emit('request', req, res);
    shutdown('ACTIVE_REQUEST');
    req.emit('close');
    await tick(20);
    expect(server.listening).toBe(false);
  });

  it('should clear timeouts after shutdown', async () => {
    await startServer(server);
    shutdown('TEST');
    // There should be no unhandled timeouts after shutdown
    await tick(1100);
    expect(server.listening).toBe(false);
  });

  it('should force close all connections after shutdownTimeout', async () => {
    // Simulate Node.js >= 18 API
    const closeAllConnectionsMock = vi.fn(function () {
      /* no-op */
    });
    server.closeAllConnections = closeAllConnectionsMock;
    await startServer(server);
    shutdown('FORCE_TIMEOUT');
    await tick(1100); // Wait for shutdownTimeout (1s)
    expect(closeAllConnectionsMock).toHaveBeenCalled();
  });

  it('should handle idleTimeout and socketActivation (idle shutdown)', async () => {
    const closeIdleConnectionsMock = vi.fn(function () {
      /* no-op */
    });
    server.closeIdleConnections = closeIdleConnectionsMock;
    // Re-setup with idleTimeout and socketActivation
    shutdown = setupGracefulShutdown(server, {
      shutdownTimeout: 1,
      idleTimeout: 0.05, // 50ms
      socketActivation: true,
    });
    await startServer(server);
    // Simulate a request
    const req = new http.IncomingMessage();
    const res = new http.ServerResponse(req);
    server.emit('request', req, res);
    req.emit('close');
    await tick(100);
    expect(closeIdleConnectionsMock).toHaveBeenCalled();
    expect(server.listening).toBe(false);
  });

  it('should call closeIdleConnections if available on shutdown', async () => {
    const closeIdleConnectionsMock = vi.fn(function () {
      /* no-op */
    });
    server.closeIdleConnections = closeIdleConnectionsMock;
    await startServer(server);
    shutdown('WITH_IDLE');
    await tick();
    expect(closeIdleConnectionsMock).toHaveBeenCalled();
  });
});
