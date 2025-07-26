/* eslint-disable */
import { wrap } from 'comlink';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  WorkerPoolDestroyedError,
  WorkerPoolExhaustedError,
  WorkerPoolQueueLimitError,
} from './errors';
import WorkerPool from './web_worker';

// Mock comlink
vi.mock('comlink', () => ({
  wrap: vi.fn(),
}));

// Mock Worker
const mockWorkerInstance = {
  terminate: vi.fn(),
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(global, 'Worker', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockWorkerInstance),
});

// Mock worker API for testing
interface TestWorkerAPI {
  add(a: number, b: number): Promise<number>;
  multiply(a: number, b: number): Promise<number>;
  slowTask(delay: number): Promise<string>;
  errorTask(): Promise<never>;
}

describe('WorkerPool', () => {
  let workerPool: WorkerPool<TestWorkerAPI>;
  let mockWorkerProxy: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock worker proxy
    mockWorkerProxy = {
      add: vi.fn().mockResolvedValue(0),
      multiply: vi.fn().mockResolvedValue(0),
      slowTask: vi.fn().mockResolvedValue('completed'),
      errorTask: vi.fn().mockRejectedValue(new Error('Worker error')),
    };

    // Mock comlink.wrap to return our mock proxy
    (wrap as any).mockReturnValue(mockWorkerProxy);
  });

  afterEach(async () => {
    if (workerPool && !workerPool.destroyed) {
      try {
        workerPool.destroy();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    // Give time for any pending promises to settle
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  describe('Constructor', () => {
    it('should create a worker pool with default settings', () => {
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js');

      expect(workerPool.maxSize).toBe(10);
      expect(workerPool.maxQueueSize).toBe(1000);
      expect(workerPool.destroyed).toBe(false);
    });

    it('should create a worker pool with custom settings', () => {
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js', {}, 5, 100);

      expect(workerPool.maxSize).toBe(5);
      expect(workerPool.maxQueueSize).toBe(100);
    });

    it('should accept URL object as scriptURL', () => {
      const url = new URL('http://example.com/worker.js');
      workerPool = new WorkerPool<TestWorkerAPI>(url);

      expect(workerPool.maxSize).toBe(10);
    });
  });

  describe('execute()', () => {
    beforeEach(() => {
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js', {}, 2, 5);
    });

    it('should execute a simple task', async () => {
      mockWorkerProxy.add.mockResolvedValue(5);

      const result = await workerPool.execute('add', [2, 3]);

      expect(result).toBe(5);
      expect(mockWorkerProxy.add).toHaveBeenCalledWith(2, 3);
    });

    it('should handle worker errors', async () => {
      mockWorkerProxy.errorTask.mockRejectedValue(new Error('Worker failed'));

      await expect(workerPool.execute('errorTask', [])).rejects.toThrow('Worker failed');
    });

    it('should queue tasks when pool is exhausted', async () => {
      // Create a smaller pool
      workerPool.destroy();
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js', {}, 1, 5);

      let resolveSlowTask!: (value: string) => void;
      const slowTaskPromise = new Promise<string>(resolve => {
        resolveSlowTask = resolve;
      });

      mockWorkerProxy.slowTask.mockReturnValue(slowTaskPromise);
      mockWorkerProxy.add.mockResolvedValue(10);

      // Start first task (will occupy the single worker)
      const task1Promise = workerPool.execute('slowTask', [1000]);

      // Give it a moment to start and ensure the worker is acquired
      await new Promise(resolve => setTimeout(resolve, 50));

      // Second task should be queued
      const task2Promise = workerPool.execute('add', [5, 5]);

      // Give a moment for the task to be queued
      await new Promise(resolve => setTimeout(resolve, 10));

      // Resolve the first task
      resolveSlowTask('slow completed');

      // Wait for first task to complete
      const task1Result = await task1Promise;
      expect(task1Result).toBe('slow completed');

      // Second task should now execute
      const result2 = await task2Promise;
      expect(result2).toBe(10);
    }, 2000);

    it('should reject queued tasks when queue limit is reached', async () => {
      workerPool.destroy();
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js', {}, 1, 1);

      // Create a controllable promise to block the worker
      let resolveBlockingTask!: () => void;
      const blockingPromise = new Promise<string>(resolve => {
        resolveBlockingTask = () => resolve('blocked');
      });
      mockWorkerProxy.slowTask.mockReturnValue(blockingPromise);

      // Start first task (occupies worker) - don't await
      const blockingTask = workerPool.execute('slowTask', [1000]);

      // Give time for worker to be acquired
      await new Promise(resolve => setTimeout(resolve, 10));

      // Second task goes to queue - don't await
      const queuedTask = workerPool.execute('add', [1, 1]);

      // Give time for task to be queued
      await new Promise(resolve => setTimeout(resolve, 10));

      // Third task should exceed queue limit
      await expect(workerPool.execute('multiply', [2, 2])).rejects.toThrow(
        WorkerPoolQueueLimitError
      );

      // Clean up - resolve the blocking task
      resolveBlockingTask();
      await blockingTask;
      await queuedTask; // This should complete after the blocking task
    });

    it('should reject tasks on destroyed pool', async () => {
      workerPool.destroy();

      await expect(workerPool.execute('add', [1, 2])).rejects.toThrow(WorkerPoolDestroyedError);
    });

    it('should handle non-function properties', async () => {
      // Create a new worker pool for this test to avoid affecting other tests
      const testPool = new WorkerPool<TestWorkerAPI>('/worker.js');

      const invalidProxy = { notAFunction: 'string value' };
      (wrap as any).mockReturnValueOnce(invalidProxy);

      await expect(testPool.execute('notAFunction' as any, [])).rejects.toThrow(
        'Property notAFunction is not a function on the worker'
      );

      testPool.destroy();
    });
  });

  describe('executeImmediate()', () => {
    beforeEach(() => {
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js', {}, 1);
    });

    it('should execute immediately when worker is available', async () => {
      mockWorkerProxy.add.mockResolvedValue(7);

      const result = await workerPool.executeImmediate('add', [3, 4]);

      expect(result).toBe(7);
    });

    it('should throw when pool is exhausted', async () => {
      // Block the single worker with a controllable promise
      let resolveBlockingTask!: () => void;
      const blockingPromise = new Promise<string>(resolve => {
        resolveBlockingTask = () => resolve('blocked');
      });
      mockWorkerProxy.slowTask.mockReturnValue(blockingPromise);

      // Start a task to block the worker - don't await
      const blockingTask = workerPool.execute('slowTask', [1000]);

      // Give time for worker to be acquired
      await new Promise(resolve => setTimeout(resolve, 10));

      // Immediate execution should fail
      await expect(workerPool.executeImmediate('add', [1, 2])).rejects.toThrow(
        WorkerPoolExhaustedError
      );

      // Clean up
      resolveBlockingTask();
      await blockingTask;
    });

    it('should throw when pool is destroyed', async () => {
      workerPool.destroy();

      await expect(workerPool.executeImmediate('add', [1, 2])).rejects.toThrow(
        WorkerPoolDestroyedError
      );
    });
  });

  describe('destroy()', () => {
    beforeEach(() => {
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js', {}, 2, 5);
    });

    it('should mark pool as destroyed', () => {
      expect(workerPool.destroyed).toBe(false);

      workerPool.destroy();

      expect(workerPool.destroyed).toBe(true);
    });

    it('should terminate all worker instances', () => {
      // Create some workers by executing tasks
      workerPool.execute('add', [1, 2]);
      workerPool.execute('multiply', [3, 4]);

      workerPool.destroy();

      // Should have called terminate on created workers
      expect(mockWorkerInstance.terminate).toHaveBeenCalled();
    });

    it('should reject all queued tasks', async () => {
      // Fill the pool and queue
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js', {}, 1, 5);

      // Block the worker with a never-resolving task
      let blockingResolve!: () => void;
      const blockingPromise = new Promise<string>(resolve => {
        blockingResolve = () => resolve('done');
      });
      mockWorkerProxy.slowTask.mockReturnValue(blockingPromise);
      mockWorkerProxy.add.mockResolvedValue(5);
      mockWorkerProxy.multiply.mockResolvedValue(10);

      // Start blocking task
      const blockingTask = workerPool.execute('slowTask', [1000]);

      // Give it time to start and ensure the worker is acquired
      await new Promise(resolve => setTimeout(resolve, 50));

      // Queue some tasks
      const queuedTask1 = workerPool.execute('add', [1, 2]);
      const queuedTask2 = workerPool.execute('multiply', [3, 4]);

      // Give time for tasks to be queued
      await new Promise(resolve => setTimeout(resolve, 10));

      // Destroy the pool (this should reject queued tasks)
      workerPool.destroy();

      // Check that queued tasks are rejected
      await expect(queuedTask1).rejects.toThrow(WorkerPoolDestroyedError);
      await expect(queuedTask2).rejects.toThrow(WorkerPoolDestroyedError);

      // Unblock and complete the running task
      blockingResolve();
      const blockingResult = await blockingTask;
      expect(blockingResult).toBe('done');
    }, 2000); // Increased timeout

    it('should handle multiple destroy calls gracefully', () => {
      workerPool.destroy();

      expect(() => workerPool.destroy()).not.toThrow();
      expect(workerPool.destroyed).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unlimited workers (maxSize = -1)', async () => {
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js', {}, -1);

      mockWorkerProxy.add.mockResolvedValue(5);

      // Should be able to create many workers
      const tasks = Array.from({ length: 100 }, (_, i) => workerPool.execute('add', [i, 1]));

      const results = await Promise.all(tasks);
      expect(results).toHaveLength(100);
      expect(results.every(r => r === 5)).toBe(true);
    });

    it('should handle zero queue size', () => {
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js', {}, 1, 0);

      expect(workerPool.maxQueueSize).toBe(0);
    });

    it('should properly handle concurrent task processing', async () => {
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js', {}, 3);

      mockWorkerProxy.add.mockImplementation(async (a: number, b: number) => {
        // Simulate some async work
        await new Promise(resolve => setTimeout(resolve, 10));
        return a + b;
      });

      const tasks = [
        workerPool.execute('add', [1, 2]),
        workerPool.execute('add', [3, 4]),
        workerPool.execute('add', [5, 6]),
        workerPool.execute('add', [7, 8]),
        workerPool.execute('add', [9, 10]),
      ];

      const results = await Promise.all(tasks);
      expect(results).toEqual([3, 7, 11, 15, 19]);
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct function names', async () => {
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js');

      // This should compile without errors
      await workerPool.execute('add', [1, 2]);
      await workerPool.execute('multiply', [3, 4]);

      // Invalid function names should cause TypeScript errors but still be handled at runtime
      // @ts-expect-error - invalid function name
      await expect(workerPool.execute('invalidFunction', [])).rejects.toThrow();
    });

    it('should enforce correct argument types', async () => {
      workerPool = new WorkerPool<TestWorkerAPI>('/worker.js');

      // Valid arguments
      await workerPool.execute('add', [1, 2]);

      // Invalid argument types should cause TypeScript errors
      // @ts-expect-error - wrong argument types
      await workerPool.execute('add', ['a', 'b']);
    });
  });
});
