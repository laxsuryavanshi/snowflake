# @turtleby/workerhive

`@turtleby/workerhive` is a TypeScript package that provides a powerful and type-safe `WorkerPool` class for efficiently managing a pool of Web Workers in browser environments. It is designed to simplify parallel task execution, optimize resource usage, and handle complex worker lifecycle management with ease.

## Features

- **Worker Pooling:** Limits the number of concurrent workers to control resource usage.
- **Task Queueing:** Queues tasks when all workers are busy, with a configurable queue size.
- **Type-Safe API:** Leverages TypeScript generics for type-safe worker function calls.
- **Error Handling:** Custom error classes for pool exhaustion, destruction, and queue overflow.
- **Graceful Cleanup:** Safely destroys the pool, terminates all workers, and rejects queued tasks.
- **Comlink Integration:** Uses [comlink](https://github.com/GoogleChromeLabs/comlink) for seamless worker communication.

## Installation

```bash
yarn add @turtleby/workerhive
# or
npm install @turtleby/workerhive
```

## Usage

```typescript
import { WorkerPool } from '@turtleby/workerhive';

// Define the interface for your worker's API
interface MyWorkerAPI {
  computeHeavyTask(input: number): Promise<number>;
}

// Create a pool with up to 4 workers
const pool = new WorkerPool<MyWorkerAPI>(
  new URL('./my-worker.ts', import.meta.url),
  {}, // WorkerOptions
  4 // maxSize
);

// Execute a function on the worker
const result = await pool.execute('computeHeavyTask', [42]);

// Destroy the pool when done
pool.destroy();
```

### Exposing Worker Functions with Comlink

To use `WorkerPool`, your worker script should expose its API using Comlink's `expose` function. This makes your worker's functions callable from the main thread.

**Example: my-worker.ts**

```typescript
import { expose } from 'comlink';

const api = {
  computeHeavyTask(input: number) {
    // ...heavy computation...
    return input * 2;
  },
};

expose(api);
```

## API

### `WorkerPool<T>`

#### Constructor

```typescript
new WorkerPool<T>(
  scriptURL: string | URL,
  options?: WorkerOptions,
  maxSize?: number,
  maxQueueSize?: number
)
```

- `scriptURL`: The URL of the worker script.
- `options`: (Optional) WorkerOptions for the Worker constructor.
- `maxSize`: (Optional) Maximum number of concurrent workers (default: 10).
- `maxQueueSize`: (Optional) Maximum number of queued tasks (default: 1000).

#### Methods

- `execute(func, args)`: Executes a function on a worker, queues if all are busy.
- `executeImmediate(func, args)`: Executes immediately or throws if pool is exhausted.
- `destroy()`: Destroys the pool, terminates all workers, and rejects queued tasks.

#### Properties

- `destroyed`: Returns `true` if the pool has been destroyed.
- `maxSize`: Maximum number of concurrent workers.
- `maxQueueSize`: Maximum number of queued tasks.

## Error Handling

- `WorkerPoolDestroyedError`: Thrown if the pool is destroyed.
- `WorkerPoolExhaustedError`: Thrown if all workers are busy and the pool is at max size.
- `WorkerPoolQueueLimitError`: Thrown if the task queue is full.

## License

MIT
