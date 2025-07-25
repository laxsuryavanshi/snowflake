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

### Basic Usage

```js
import http from 'http';
import { setupGracefulShutdown } from '@turtleby/graceful-shutdown';

const server = http.createServer(app);

// Basic setup with default options
setupGracefulShutdown(server);

// Or with custom options
setupGracefulShutdown(server, {
  shutdownTimeout: 30, // seconds
  idleTimeout: 60, // seconds (optional)
  socketActivation: false, // set true if using systemd socket activation
});
```

### Advanced Usage with Error Handling

```js
import http from 'http';
import { setupGracefulShutdown } from '@turtleby/graceful-shutdown';

const server = http.createServer(app);

try {
  const manualShutdown = setupGracefulShutdown(server, {
    shutdownTimeout: 30,
    idleTimeout: 0,
    socketActivation: process.env.LISTEN_PID !== undefined,
  });

  // Listen for shutdown completion
  process.on('server:shutdown', reason => {
    console.log(`Server shutdown completed. Reason: ${reason}`);
    process.exit(0);
  });

  // Manual shutdown example
  if (process.env.NODE_ENV === 'test') {
    setTimeout(() => manualShutdown('MANUAL_TEST'), 5000);
  }
} catch (error) {
  console.error('Failed to setup graceful shutdown:', error.message);
  process.exit(1);
}
```

### With Express.js

```js
import express from 'express';
import http from 'http';
import { setupGracefulShutdown } from '@turtleby/graceful-shutdown';

const app = express();
const server = http.createServer(app);

setupGracefulShutdown(server, {
  shutdownTimeout: 15,
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## API

### setupGracefulShutdown(server, options?)

- `server` (`http.Server`): The HTTP server instance to manage.
- `options` (`Object`, optional): Configuration options.
  - `shutdownTimeout` (`number`, default: 30): Seconds to wait before force closing all connections after shutdown is triggered.
  - `idleTimeout` (`number`, default: 0): Seconds to wait before shutting down when idle (only with socket activation).
  - `socketActivation` (`boolean`, default: false): Set to true if using systemd socket activation (LISTEN_PID/LISTEN_FDS).

**Returns:** `(reason: string) => void` - A function to trigger graceful shutdown manually.

**Throws:**

- `TypeError` - When server is not a valid HTTP server instance
- `TypeError` - When options contain invalid values (negative numbers, wrong types)

### Events

The process emits a `server:shutdown` event when shutdown is complete:

```js
process.on('server:shutdown', reason => {
  console.log(`Shutdown completed: ${reason}`);
});
```

Possible shutdown reasons:

- `SIGTERM` - Process received SIGTERM signal
- `SIGINT` - Process received SIGINT signal (Ctrl+C)
- `IDLE` - Server was idle for longer than idleTimeout (with socket activation)
- Custom reasons when manually triggered

## License

MIT
