export class WorkerPoolExhaustedError extends Error {
  constructor() {
    super('WorkerPool exhausted');
    this.name = 'WorkerPoolExhaustedError';
  }
}

export class WorkerPoolDestroyedError extends Error {
  constructor() {
    super('WorkerPool destroyed');
    this.name = 'WorkerPoolDestroyedError';
  }
}

export class WorkerPoolQueueLimitError extends Error {
  constructor() {
    super('WorkerPool queue limit reached');
    this.name = 'WorkerPoolQueueLimitError';
  }
}
