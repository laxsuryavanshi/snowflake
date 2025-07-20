/* eslint-disable */
import { type Remote, wrap } from 'comlink';

import {
  WorkerPoolDestroyedError,
  WorkerPoolExhaustedError,
  WorkerPoolQueueLimitError,
} from './errors';

/**
 * Type alias for a function that rejects a promise with a reason.
 */
type Reject = (reason?: any) => void;

interface QueuedTask<T> {
  resolve: (value: unknown) => void;
  reject: Reject;
  func: keyof T;
  args: unknown[];
}

/**
 * WorkerPool manages a pool of Web Workers and provides a queue for executing tasks in parallel.
 *
 * @typeParam T - The interface describing the worker's exposed API
 *                (functions callable via comlink).
 *
 * Features:
 * - Limits the number of concurrent workers (maxSize)
 * - Queues tasks if all workers are busy (maxQueueSize)
 * - Custom error classes for pool exhaustion, destruction, and queue overflow
 * - Safe destruction and cleanup of all workers and queued tasks
 * - Type-safe API for calling worker functions
 *
 * Usage:
 * ```ts
 * const pool = new WorkerPool<MyWorkerAPI>(workerScriptUrl, {}, 4);
 * await pool.execute('myWorkerFunction', [arg1, arg2]);
 * pool.destroy();
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
   * Create a new WorkerPool.
   * @param scriptURL - The URL of the worker script.
   * @param options - WorkerOptions for the Worker constructor.
   * @param maxSize - Maximum number of concurrent workers (default: 10).
   * @param maxQueueSize - Maximum number of queued tasks (default: 1000).
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
   * Returns true if the pool has been destroyed.
   */
  get destroyed(): boolean {
    return this._destroyed;
  }

  /**
   * Returns the maximum number of concurrent workers allowed in the pool.
   */
  get maxSize(): number {
    return this._maxSize;
  }

  /**
   * Returns the maximum number of queued tasks allowed.
   */
  get maxQueueSize(): number {
    return this._maxQueueSize;
  }

  /**
   * Execute a function on a worker. If all workers are busy, the task is queued.
   *
   * @param func - The name of the worker function to call.
   * @param args - Arguments to pass to the worker function.
   * @returns A promise resolving to the function's result.
   * @throws `WorkerPoolDestroyedError` if the pool is destroyed.
   * @throws `WorkerPoolQueueLimitError` if the queue is full.
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
                reject(new WorkerPoolQueueLimitError());
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
   * Execute a function on a worker immediately, throwing if the pool is exhausted or destroyed.
   *
   * @param func - The name of the worker function to call.
   * @param args - Arguments to pass to the worker function.
   * @returns A promise resolving to the function's result.
   * @throws `WorkerPoolDestroyedError` if the pool is destroyed.
   * @throws `WorkerPoolExhaustedError` if the pool is exhausted.
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
      return this._workers[this._idle.shift()!];
    }
    if (this._maxSize < 0 || this._workers.length < this._maxSize) {
      return this._workers[this._workers.push(this._ctor()) - 1];
    }
    throw new WorkerPoolExhaustedError();
  }

  /**
   * @internal Release a worker and process the next queued task if available.
   * @param worker - The worker to release.
   */
  private async _release(worker: Remote<T>): Promise<void> {
    const index = this._workers.indexOf(worker);
    if (index !== -1) {
      this._idle.push(index);
      if (this._queued.length > 0) {
        const { resolve, reject, func, args } = this._queued.shift()!;
        try {
          const result = await (this._execute as any)(func, args);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }
    }
  }

  /**
   * Destroy the pool, terminating all workers and rejecting all queued tasks.
   * After calling this, the pool cannot be used again.
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
