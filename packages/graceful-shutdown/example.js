import http from 'http';

import { setupGracefulShutdown } from './index.js';

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Simulate some work
  setTimeout(() => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World!\n');
  }, 100);
});

// Setup graceful shutdown with default options
// const manualShutdown = setupGracefulShutdown(server);

// Or setup graceful shutdown with custom options
const manualShutdown = setupGracefulShutdown(server, {
  shutdownTimeout: 10, // Wait 10 seconds before forcing shutdown
  idleTimeout: 30, // Shutdown after 30 seconds of inactivity (requires socketActivation)
  socketActivation: false,
});

// Listen for shutdown completion
process.on('server:shutdown', reason => {
  console.log(`Server shutdown completed. Reason: ${reason}`);
  process.exit(0);
});

// Start the server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Press Ctrl+C to gracefully shutdown');
});

// Example of manual shutdown (uncomment for testing)
// setTimeout(() => {
//   console.log('Triggering manual shutdown...');
//   manualShutdown('MANUAL_EXAMPLE');
// }, 5000);
