# @turtleby/workerhive

<div align="center">

[![npm version](https://badge.fury.io/js/@turtleby%2Fworkerhive.svg)](https://badge.fury.io/js/@turtleby%2Fworkerhive)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A powerful, type-safe Web Worker pool manager for efficient parallel task execution in browsers.**

</div>

## 🚀 Features

- **🔧 Worker Pooling**: Intelligent management of Web Worker instances with configurable pool size
- **📋 Task Queueing**: Automatic queuing when all workers are busy, with configurable queue limits
- **🔒 Type Safety**: Full TypeScript support with compile-time validation of function calls and arguments
- **⚡ Performance**: Lazy worker creation, efficient resource reuse, and minimal overhead
- **🛡️ Error Handling**: Comprehensive error types for different failure scenarios
- **🧹 Resource Management**: Automatic cleanup and graceful shutdown capabilities
- **🔗 Comlink Integration**: Seamless worker communication using Google's Comlink library
- **📊 Monitoring**: Built-in properties for monitoring pool state and capacity

## 📦 Installation

```bash
# Using npm
npm install @turtleby/workerhive

# Using yarn
yarn add @turtleby/workerhive

# Using pnpm
pnpm add @turtleby/workerhive
```

**Peer Dependencies:**

- `comlink`: >=4.0.0

```bash
npm install comlink
```

## 🎯 Quick Start

### 1. Create Your Worker Script

First, create a worker script that exposes its API using Comlink:

**`hash-worker.ts`**

```typescript
import { expose } from 'comlink';
import { createHash } from 'crypto';

const api = {
  // Comlink automatically wraps return values in Promises
  sha256(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  },

  md5(input: string): string {
    return createHash('md5').update(input).digest('hex');
  },

  // You can still use async functions if needed for internal async operations
  async processData(data: number[]): Promise<number> {
    // Simulate heavy computation
    await new Promise(resolve => setTimeout(resolve, 100));
    return data.reduce((sum, n) => sum + n, 0);
  },
};

expose(api);

// Export the type for use in main thread
// Note: Comlink will automatically convert these to Promise types when called from main thread
export type HashWorkerAPI = typeof api;
```

### 2. Use WorkerPool in Your Main Thread

**`main.ts`**

```typescript
import { WorkerPool } from '@turtleby/workerhive';
import type { HashWorkerAPI } from './hash-worker';

// Create a pool with up to 4 workers
const workerPool = new WorkerPool<HashWorkerAPI>(
  new URL('./hash-worker.ts', import.meta.url),
  {}, // Worker options
  4, // Max 4 concurrent workers
  100 // Max 100 queued tasks
);

async function main() {
  try {
    // Execute tasks in parallel
    const results = await Promise.all([
      workerPool.execute('sha256', ['hello']),
      workerPool.execute('md5', ['world']),
      workerPool.execute('processData', [[1, 2, 3, 4, 5]]),
    ]);

    console.log('SHA256:', results[0]);
    console.log('MD5:', results[1]);
    console.log('Sum:', results[2]);
  } catch (error) {
    console.error('Task failed:', error);
  } finally {
    // Clean up when done
    workerPool.destroy();
  }
}

main();
```

## 📖 API Reference

### WorkerPool<T>

The main class for managing a pool of Web Workers.

#### Constructor

```typescript
new WorkerPool<T>(
  scriptURL: string | URL,
  options?: WorkerOptions,
  maxSize?: number,
  maxQueueSize?: number
)
```

| Parameter      | Type            | Default | Description                                   |
| -------------- | --------------- | ------- | --------------------------------------------- |
| `scriptURL`    | `string \| URL` | -       | Path or URL to the worker script              |
| `options`      | `WorkerOptions` | `{}`    | Options passed to Worker constructor          |
| `maxSize`      | `number`        | `10`    | Maximum concurrent workers (-1 for unlimited) |
| `maxQueueSize` | `number`        | `1000`  | Maximum queued tasks                          |

#### Methods

##### `execute<K>(func, args): Promise<ReturnType<T[K]>>`

Execute a worker function. Tasks are queued if all workers are busy.

```typescript
const result = await pool.execute('functionName', [arg1, arg2]);
```

**Throws:**

- `WorkerPoolDestroyedError` - Pool has been destroyed
- `WorkerPoolQueueLimitError` - Queue is full
- `Error` - Worker function error

##### `executeImmediate<K>(func, args): Promise<ReturnType<T[K]>>`

Execute a worker function immediately without queueing.

```typescript
const result = await pool.executeImmediate('functionName', [arg1, arg2]);
```

**Throws:**

- `WorkerPoolDestroyedError` - Pool has been destroyed
- `WorkerPoolExhaustedError` - All workers are busy
- `Error` - Worker function error

##### `destroy(): void`

Destroy the pool and clean up all resources. This method is idempotent.

```typescript
pool.destroy();
```

#### Properties

| Property       | Type      | Description                          |
| -------------- | --------- | ------------------------------------ |
| `destroyed`    | `boolean` | Whether the pool has been destroyed  |
| `maxSize`      | `number`  | Maximum number of concurrent workers |
| `maxQueueSize` | `number`  | Maximum number of queued tasks       |

## 🔧 Advanced Usage

### Custom Worker Configuration

```typescript
const pool = new WorkerPool<MyAPI>(
  '/worker.js',
  {
    type: 'module',
    credentials: 'same-origin',
    name: 'MyWorker',
  },
  8, // 8 workers
  500 // 500 max queued tasks
);
```

### Error Handling Patterns

```typescript
import {
  WorkerPoolDestroyedError,
  WorkerPoolExhaustedError,
  WorkerPoolQueueLimitError,
} from '@turtleby/workerhive';

try {
  const result = await pool.execute('heavyTask', [data]);
  console.log('Result:', result);
} catch (error) {
  if (error instanceof WorkerPoolExhaustedError) {
    console.log('All workers busy, trying again...');
    // Implement retry logic
  } else if (error instanceof WorkerPoolQueueLimitError) {
    console.log('Queue full, reducing load...');
    // Implement backpressure
  } else if (error instanceof WorkerPoolDestroyedError) {
    console.log('Pool destroyed, creating new one...');
    // Recreate pool
  } else {
    console.error('Worker error:', error);
    // Handle worker-specific errors
  }
}
```

### Batch Processing

```typescript
async function processBatch<T>(
  pool: WorkerPool<MyAPI>,
  items: T[],
  batchSize: number = 10
): Promise<ProcessedItem[]> {
  const results: ProcessedItem[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(item => pool.execute('processItem', [item]));

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
```

### Resource Monitoring

```typescript
class PoolMonitor {
  private pool: WorkerPool<MyAPI>;
  private stats = {
    tasksExecuted: 0,
    tasksQueued: 0,
    errors: 0,
  };

  constructor(pool: WorkerPool<MyAPI>) {
    this.pool = pool;
  }

  async executeWithStats<K extends keyof MyAPI>(func: K, args: Parameters<MyAPI[K]>) {
    try {
      if (this.pool.destroyed) {
        throw new Error('Pool is destroyed');
      }

      this.stats.tasksQueued++;
      const result = await this.pool.execute(func, args);
      this.stats.tasksExecuted++;
      return result;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  getStats() {
    return { ...this.stats };
  }
}
```

## 🏗️ Worker Implementation Guide

### Basic Worker Structure

```typescript
// worker.ts
import { expose } from 'comlink';

// Define your API
const workerAPI = {
  // Comlink automatically wraps return values in Promises
  computeHash(data: string): string {
    // Your computation here - return value directly
    return hash;
  },

  // Sync functions work well and are automatically wrapped by Comlink
  add(a: number, b: number): number {
    return a + b;
  },

  // You can still use async functions when you need internal async operations
  async processImageData(imageData: ImageData): Promise<Uint8Array> {
    // Process image data with async operations
    await someAsyncOperation();
    return processedData;
  },
};

// Export the type for main thread
// Note: When used with WorkerPool, Comlink automatically converts these to Promise types
export type WorkerAPI = typeof workerAPI;

// Expose the API
expose(workerAPI);
```

### Transferable Objects

For better performance with large data, use Comlink's transfer utilities:

```typescript
// worker.ts
import { expose, transfer } from 'comlink';

const workerAPI = {
  async processBuffer(buffer: ArrayBuffer): Promise<ArrayBuffer> {
    // Process the buffer
    const result = new ArrayBuffer(buffer.byteLength * 2);
    // ... processing logic ...

    // Transfer ownership back to main thread
    return transfer(result, [result]);
  },
};

expose(workerAPI);
```

```typescript
// main.ts
import { transfer } from 'comlink';

const buffer = new ArrayBuffer(1024);
// Transfer ownership to worker
const result = await pool.execute('processBuffer', [transfer(buffer, [buffer])]);
```

## 🧪 Testing

The package includes comprehensive tests covering:

- ✅ Pool lifecycle management
- ✅ Task execution and queueing
- ✅ Error handling scenarios
- ✅ Resource cleanup
- ✅ Edge cases and race conditions
- ✅ Type safety validation

Run tests:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

## ⚡ Performance Tips

1. **Right-size your pool**: Start with CPU core count, adjust based on workload
2. **Monitor queue length**: High queue lengths may indicate undersized pool
3. **Batch small tasks**: Reduce overhead by grouping small operations
4. **Use transferable objects**: For large data transfers between threads
5. **Implement backpressure**: Handle `WorkerPoolQueueLimitError` gracefully
6. **Clean up properly**: Always call `destroy()` to prevent memory leaks

## 🔍 Troubleshooting

### Common Issues

**"Worker script failed to load"**

- Ensure the worker script path is correct
- Check CORS settings for cross-origin workers
- Verify the worker script syntax

**"Function not found on worker"**

- Ensure the function is properly exposed with `expose()`
- Check function name spelling and casing
- Verify the worker API interface matches implementation

**Memory leaks**

- Always call `destroy()` when done with the pool
- Avoid creating multiple pools unnecessarily
- Monitor for uncaught promise rejections

**Performance issues**

- Consider increasing pool size for CPU-intensive tasks
- Use `executeImmediate()` for time-critical operations
- Implement proper error handling to avoid blocking

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📊 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history and breaking changes.

---
