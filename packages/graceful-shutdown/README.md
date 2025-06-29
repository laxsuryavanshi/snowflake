# graceful-shutdown

A robust, reusable utility for graceful shutdown of Node.js HTTP servers. Handles termination signals, idle timeouts, and is compatible with systemd socket activation.

## Features

- Handles SIGTERM and SIGINT for safe shutdown
- Optional idle timeout for systemd socket activation
- Works with Node.js HTTP/HTTPS servers
- Emits a `server:shutdown` event on process
- TypeScript-friendly (JSDoc types)

## Installation

```sh
npm install @turtleby/graceful-shutdown
```

## Usage

```js
import http from 'http';
import { setupGracefulShutdown } from '@turtleby/graceful-shutdown';

const server = http.createServer(app);

setupGracefulShutdown(server, {
  shutdownTimeout: 30, // seconds
  idleTimeout: 60, // seconds (optional)
  socketActivation: false, // set true if using systemd socket activation
});
```

## API

### setupGracefulShutdown(server, options)

- `server` (`http.Server`): The HTTP server instance to manage.
- `options.shutdownTimeout` (`number`, default: 30): Seconds to wait before force closing all connections after shutdown is triggered.
- `options.idleTimeout` (`number`, default: 0): Seconds to wait before shutting down when idle (only with socket activation).
- `options.socketActivation` (`boolean`, default: false): Set to true if using systemd socket activation (LISTEN_PID/LISTEN_FDS).

Returns a function to trigger graceful shutdown manually.

## License

MIT
