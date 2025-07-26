/**
 * Error thrown when all workers in the pool are busy and no new workers can be created.
 * This happens when the pool has reached its maximum size and all workers are currently executing tasks.
 */
export class WorkerPoolExhaustedError extends Error {
  constructor(maxSize?: number) {
    const message =
      maxSize !== undefined
        ? `WorkerPool exhausted: all ${String(maxSize)} workers are busy`
        : 'WorkerPool exhausted: all workers are busy';
    super(message);
    this.name = 'WorkerPoolExhaustedError';
  }
}

/**
 * Error thrown when attempting to execute a task on a destroyed worker pool.
 * Once destroyed, a worker pool cannot be used again and must be recreated.
 */
export class WorkerPoolDestroyedError extends Error {
  constructor() {
    super('WorkerPool has been destroyed and cannot execute tasks');
    this.name = 'WorkerPoolDestroyedError';
  }
}

/**
 * Error thrown when the task queue has reached its maximum capacity.
 * This prevents memory exhaustion from unlimited task queuing.
 */
export class WorkerPoolQueueLimitError extends Error {
  constructor(queueSize?: number) {
    const message =
      queueSize !== undefined
        ? `WorkerPool queue limit reached: ${String(queueSize)} tasks already queued`
        : 'WorkerPool queue limit reached';
    super(message);
    this.name = 'WorkerPoolQueueLimitError';
  }
}
