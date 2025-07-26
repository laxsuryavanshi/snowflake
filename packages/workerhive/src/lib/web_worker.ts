/* eslint-disable */
import { type Remote, wrap } from 'comlink';

import {
  WorkerPoolDestroyedError,
  WorkerPoolExhaustedError,
  WorkerPoolQueueLimitError,
} from './errors';

/**
 * Type alias for a function that rejects a promise with a reason.
 * Used internally for managing queued task rejections.
 */
type Reject = (reason?: any) => void;

/**
 * Represents a queued task waiting to be executed by a worker.
 * Contains all necessary information to execute the task once a worker becomes available.
 *
 * @template T - The interface describing the worker's exposed API
 */
interface QueuedTask<T> {
  /** Function to call when the task completes successfully */
  resolve: (value: unknown) => void;
  /** Function to call when the task fails or is rejected */
  reject: Reject;
  /** Name of the worker function to execute */
  func: keyof T;
  /** Arguments to pass to the worker function */
  args: unknown[];
}

/**
 * WorkerPool manages a pool of Web Workers and provides a queue for executing tasks in parallel.
 *
 * @template T - The interface describing the worker's exposed API (functions callable via comlink).
 *               Each property should be a function. Comlink automatically wraps return values in Promises.
 *
 * ## Key Features:
 * - **Pool Management**: Limits the number of concurrent workers (maxSize) to control resource usage
 * - **Task Queueing**: Automatically queues tasks when all workers are busy (configurable maxQueueSize)
 * - **Type Safety**: Full TypeScript support with compile-time validation of function names and arguments
 * - **Error Handling**: Custom error classes for different failure scenarios
 * - **Resource Cleanup**: Safe destruction and cleanup of all workers and queued tasks
 * - **Comlink Integration**: Uses comlink for seamless worker communication and proxy management
 *
 * ## Usage Patterns:
 *
 * ### Basic Usage:
 * ```ts
 * interface MyWorkerAPI {
 *   computeHash(data: string): string;  // Comlink wraps this as Promise<string>
 *   processImage(buffer: ArrayBuffer): Uint8Array;  // Becomes Promise<Uint8Array>
 * }
 *
 * const pool = new WorkerPool<MyWorkerAPI>('/worker.js', {}, 4, 100);
 * const result = await pool.execute('computeHash', ['hello world']);
 * pool.destroy(); // Clean up when done
 * ```
 *
 * ### Advanced Configuration:
 * ```ts
 * const pool = new WorkerPool<MyWorkerAPI>(
 *   new URL('./worker.ts', import.meta.url),
 *   { credentials: 'same-origin' }, // Worker options
 *   8,    // Max 8 concurrent workers
 *   500   // Max 500 queued tasks
 * );
 * ```
 *
 * ### Error Handling:
 * ```ts
 * try {
 *   const result = await pool.execute('processData', [data]);
 * } catch (error) {
 *   if (error instanceof WorkerPoolExhaustedError) {
 *     // All workers busy, try again later
 *   } else if (error instanceof WorkerPoolQueueLimitError) {
 *     // Queue is full, reduce load
 *   } else if (error instanceof WorkerPoolDestroyedError) {
 *     // Pool was destroyed, create a new one
 *   }
 * }
 * ```
 *
 * ## Performance Considerations:
 * - Workers are created lazily up to maxSize
 * - Idle workers are reused to minimize creation overhead
 * - Task queuing prevents overwhelming the system when all workers are busy
 * - Proper cleanup prevents memory leaks
 *
 * ## Thread Safety:
 * - All operations are safe to call from the main thread
 * - Multiple concurrent execute() calls are handled properly
 * - Queue processing is atomic and race-condition free
 *
 * @example
 * ```ts
 * // Define your worker's API interface
 * interface HashWorkerAPI {
 *   sha256(input: string): string;  // Comlink automatically wraps as Promise<string>
 *   md5(input: string): string;     // Comlink automatically wraps as Promise<string>
 * }
 *
 * // Create the pool
 * const hashPool = new WorkerPool<HashWorkerAPI>(
 *   '/hash-worker.js',
 *   {},  // Worker options
 *   4,   // Max 4 workers
 *   100  // Max 100 queued tasks
 * );
 *
 * // Execute tasks
 * const sha256Hash = await hashPool.execute('sha256', ['hello']);
 * const md5Hash = await hashPool.execute('md5', ['world']);
 *
 * // Clean up
 * hashPool.destroy();
 * ```
 */
export default class WorkerPool<T = Record<string, (...args: any[]) => any>> {
  /** Maximum number of concurrent workers allowed in the pool. */
  private readonly _maxSize: number;
  /** Maximum number of tasks allowed in the queue. */
  private readonly _maxQueueSize: number = 1000;
  /** Factory for creating new comlink-wrapped workers. */
  private readonly _ctor: () => Remote<T>;

  /** Indices of idle workers in the pool. */
  private _idle: number[] = [];
  /** Array of comlink-wrapped worker proxies. */
  private _workers: Remote<T>[] = [];

  /**
   * Array of actual Worker instances for termination and cleanup.
   * Note: comlink does not expose the underlying Worker instance for termination.
   */
  private _workerInstances: Worker[] = [];

  /** Queue of pending tasks waiting for a worker to become available. */
  private _queued: QueuedTask<T>[] = [];
  /** Indicates whether the pool has been destroyed. */
  private _destroyed = false;

  /**
   * Create a new WorkerPool instance.
   *
   * @param scriptURL - The URL of the worker script. Can be a string path or URL object.
   *                    For ES modules, ensure the script uses `expose()` from comlink.
   * @param options - Optional WorkerOptions passed to the Worker constructor.
   *                  Common options include `{ credentials: 'same-origin' }` or `{ type: 'module' }`.
   * @param maxSize - Maximum number of concurrent workers (default: 10).
   *                  Set to -1 for unlimited workers.
   * @param maxQueueSize - Maximum number of queued tasks (default: 1000).
   *                       When exceeded, new tasks will be rejected with WorkerPoolQueueLimitError.
   *                       If <= 0, no tasks will be queued.
   *
   * @throws {Error} If maxSize or maxQueueSize are negative numbers.
   *
   * @example
   * ```ts
   * // Basic pool with defaults
   * const pool = new WorkerPool<MyAPI>('/worker.js');
   *
   * // Custom configuration
   * const pool = new WorkerPool<MyAPI>(
   *   new URL('./worker.ts', import.meta.url),
   *   { credentials: 'same-origin' },
   *   8,    // 8 max workers
   *   200   // 200 max queued tasks
   * );
   * ```
   */
  constructor(
    scriptURL: string | URL,
    options?: WorkerOptions,
    maxSize?: number,
    maxQueueSize?: number
  ) {
    this._ctor = () => {
      const worker = new Worker(scriptURL, { type: 'module', ...options });
      this._workerInstances.push(worker);
      return wrap(worker);
    };

    this._maxSize = maxSize ?? 10;

    if (maxQueueSize !== undefined) this._maxQueueSize = maxQueueSize;
  }

  /**
   * Indicates whether the worker pool has been destroyed.
   *
   * Once destroyed, the pool cannot execute any more tasks and all workers are terminated.
   * A destroyed pool cannot be reused - you must create a new instance.
   *
   * @returns True if the pool has been destroyed, false otherwise.
   *
   * @example
   * ```ts
   * const pool = new WorkerPool<MyAPI>('/worker.js');
   * console.log(pool.destroyed); // false
   *
   * pool.destroy();
   * console.log(pool.destroyed); // true
   *
   * // This will throw WorkerPoolDestroyedError
   * await pool.execute('someFunction', []);
   * ```
   */
  get destroyed(): boolean {
    return this._destroyed;
  }

  /**
   * The maximum number of concurrent workers allowed in the pool.
   *
   * This value is set during construction and cannot be changed afterward.
   * Workers are created lazily up to this limit.
   *
   * @returns The maximum number of workers that can run concurrently.
   *
   * @example
   * ```ts
   * const pool = new WorkerPool<MyAPI>('/worker.js', {}, 5);
   * console.log(pool.maxSize); // 5
   * ```
   */
  get maxSize(): number {
    return this._maxSize;
  }

  /**
   * The maximum number of tasks that can be queued when all workers are busy.
   *
   * When this limit is reached, new tasks will be rejected immediately with
   * a WorkerPoolQueueLimitError instead of being queued.
   *
   * @returns The maximum number of tasks that can be queued.
   *
   * @example
   * ```ts
   * const pool = new WorkerPool<MyAPI>('/worker.js', {}, 4, 100);
   * console.log(pool.maxQueueSize); // 100
   * ```
   */
  get maxQueueSize(): number {
    return this._maxQueueSize;
  }

  /**
   * Execute a function on a worker from the pool.
   *
   * This is the primary method for executing tasks. If all workers are busy,
   * the task will be queued automatically (up to maxQueueSize). If the pool
   * is at capacity and the queue is full, the promise will be rejected with
   * a WorkerPoolQueueLimitError.
   *
   * @template K - The key of the worker function to call (inferred from T)
   * @param func - The name of the worker function to call. Must be a key of T.
   * @param args - Arguments to pass to the worker function. Must match the function signature.
   *
   * @returns A promise that resolves to the worker function's return value.
   *
   * @throws {WorkerPoolDestroyedError} If the pool has been destroyed.
   * @throws {WorkerPoolQueueLimitError} If all workers are busy and the queue is full.
   * @throws {Error} If the worker function throws an error or doesn't exist.
   *
   * @example
   * ```ts
   * interface MathWorkerAPI {
   *   add(a: number, b: number): number;        // Comlink wraps as Promise<number>
   *   factorial(n: number): number;             // Comlink wraps as Promise<number>
   * }
   *
   * const pool = new WorkerPool<MathWorkerAPI>('/math-worker.js', {}, 4);
   *
   * // Execute tasks - they will queue if all workers are busy
   * const sum = await pool.execute('add', [5, 3]); // 8
   * const fact = await pool.execute('factorial', [5]); // 120
   *
   * // Handle errors
   * try {
   *   await pool.execute('add', [1, 2]);
   * } catch (error) {
   *   if (error instanceof WorkerPoolQueueLimitError) {
   *     console.log('Too many queued tasks, try again later');
   *   }
   * }
   * ```
   */
  async execute<K extends keyof T>(
    func: K,
    args: T[K] extends (...args: any[]) => any ? Parameters<T[K]> : never = [] as any
  ): Promise<T[K] extends (...args: any[]) => any ? Awaited<ReturnType<T[K]>> : never> {
    return new Promise((resolve, reject) => {
      if (this._destroyed) {
        reject(new WorkerPoolDestroyedError());
        return;
      }
      try {
        void this._execute(func, args)
          .then(result => resolve(result as any))
          .catch((err: unknown) => {
            if (err instanceof WorkerPoolExhaustedError) {
              if (this._queued.length >= this._maxQueueSize) {
                reject(new WorkerPoolQueueLimitError(this._maxQueueSize));
                return;
              }
              this._queued.push({
                resolve: resolve as (value: unknown) => void,
                reject,
                func,
                args,
              });
            } else {
              reject(err);
            }
          });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Execute a function on a worker immediately, without queueing.
   *
   * Unlike execute(), this method will throw immediately if no workers are available,
   * rather than queueing the task. This is useful when you need guaranteed immediate
   * execution or want to implement your own queuing/retry logic.
   *
   * @template K - The key of the worker function to call (inferred from T)
   * @param func - The name of the worker function to call. Must be a key of T.
   * @param args - Arguments to pass to the worker function. Must match the function signature.
   *
   * @returns A promise that resolves to the worker function's return value.
   *
   * @throws {WorkerPoolDestroyedError} If the pool has been destroyed.
   * @throws {WorkerPoolExhaustedError} If all workers are busy and no new workers can be created.
   * @throws {Error} If the worker function throws an error or doesn't exist.
   *
   * @example
   * ```ts
   * const pool = new WorkerPool<MathWorkerAPI>('/math-worker.js', {}, 2);
   *
   * try {
   *   // This will execute immediately if a worker is available
   *   const result = await pool.executeImmediate('add', [10, 20]);
   *   console.log(result); // 30
   * } catch (error) {
   *   if (error instanceof WorkerPoolExhaustedError) {
   *     console.log('All workers busy, try again later');
   *     // Implement your own retry logic here
   *   }
   * }
   * ```
   */
  async executeImmediate<K extends keyof T>(
    func: K,
    args: T[K] extends (...args: any[]) => any ? Parameters<T[K]> : never = [] as any
  ): Promise<T[K] extends (...args: any[]) => any ? Awaited<ReturnType<T[K]>> : never> {
    if (this._destroyed) throw new WorkerPoolDestroyedError();
    return await this._execute(func, args);
  }

  /**
   * @internal Executes a function on a worker, acquiring and releasing the worker as needed.
   * @param func - The function key to call.
   * @param args - Arguments for the function.
   * @returns A promise resolving to the function's result.
   */
  private async _execute<K extends keyof T>(
    func: K,
    args: T[K] extends (...args: any[]) => any ? Parameters<T[K]> : never = [] as any
  ): Promise<T[K] extends (...args: any[]) => any ? Awaited<ReturnType<T[K]>> : never> {
    const worker = this._acquire();
    try {
      const fn = worker[func];
      if (typeof fn !== 'function') {
        throw new Error(`Property ${String(func)} is not a function on the worker.`);
      }
      return (await (fn as (...args: any[]) => Promise<unknown>)(...args)) as any;
    } finally {
      await this._release(worker);
    }
  }

  /**
   * @internal Acquire an available worker or create a new one if under the max size.
   * @returns A comlink-wrapped worker proxy.
   * @throws WorkerPoolExhaustedError if no workers are available and the pool is at max size.
   */
  private _acquire(): Remote<T> {
    if (this._idle.length > 0) {
      const index = this._idle.shift()!;
      return this._workers[index];
    }
    if (this._maxSize < 0 || this._workers.length < this._maxSize) {
      const worker = this._ctor();
      this._workers.push(worker);
      return worker;
    }
    throw new WorkerPoolExhaustedError(this._maxSize);
  }

  /**
   * @internal Release a worker and process the next queued task if available.
   * @param worker - The worker to release.
   */
  private async _release(worker: Remote<T>): Promise<void> {
    if (this._destroyed) {
      return; // Don't process queue if pool is destroyed
    }

    const index = this._workers.indexOf(worker);
    if (index !== -1) {
      this._idle.push(index);
      if (this._queued.length > 0) {
        const { resolve, reject, func, args } = this._queued.shift()!;
        try {
          // Check again if pool was destroyed while we were shifting from queue
          if (this._destroyed) {
            reject(new WorkerPoolDestroyedError());
            return;
          }
          const result = await (this._execute as any)(func, args);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }
    }
  }

  /**
   * Destroy the worker pool and clean up all resources.
   *
   * This method:
   * 1. Marks the pool as destroyed (no new tasks can be executed)
   * 2. Rejects all queued tasks with WorkerPoolDestroyedError
   * 3. Terminates all worker instances
   * 4. Clears all internal state
   *
   * After calling destroy(), the pool cannot be used again. You must create
   * a new WorkerPool instance if you need to execute more tasks.
   *
   * This method is idempotent - calling it multiple times is safe.
   *
   * @example
   * ```ts
   * const pool = new WorkerPool<MyAPI>('/worker.js');
   *
   * // Use the pool...
   * await pool.execute('someTask', [data]);
   *
   * // Clean up when done
   * pool.destroy();
   *
   * // pool.destroyed === true
   * // Subsequent execute() calls will throw WorkerPoolDestroyedError
   * ```
   *
   * @example Graceful shutdown with pending tasks
   * ```ts
   * const pool = new WorkerPool<MyAPI>('/worker.js');
   *
   * // Start some tasks
   * const task1 = pool.execute('longTask', [data1]);
   * const task2 = pool.execute('longTask', [data2]);
   *
   * // Destroy the pool - running tasks continue, queued tasks are rejected
   * pool.destroy();
   *
   * try {
   *   await task1; // May complete successfully if already running
   *   await task2; // May be rejected if it was queued
   * } catch (error) {
   *   if (error instanceof WorkerPoolDestroyedError) {
   *     console.log('Task was queued and rejected due to pool destruction');
   *   }
   * }
   * ```
   */
  destroy() {
    this._destroyed = true;

    // Reject all queued tasks with WorkerPoolDestroyedError
    while (this._queued.length > 0) {
      const { reject } = this._queued.shift()!;
      reject(new WorkerPoolDestroyedError());
    }

    this._workerInstances.forEach(worker => {
      worker.terminate();
    });

    this._idle = [];
    this._workers = [];
    this._workerInstances = [];
  }
}
