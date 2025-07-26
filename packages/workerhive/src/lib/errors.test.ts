import { describe, expect, it } from 'vitest';

import {
  WorkerPoolDestroyedError,
  WorkerPoolExhaustedError,
  WorkerPoolQueueLimitError,
} from './errors';

describe('Error Classes', () => {
  describe('WorkerPoolExhaustedError', () => {
    it('should create error with default message', () => {
      const error = new WorkerPoolExhaustedError();

      expect(error.name).toBe('WorkerPoolExhaustedError');
      expect(error.message).toBe('WorkerPool exhausted: all workers are busy');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error with maxSize in message', () => {
      const error = new WorkerPoolExhaustedError(5);

      expect(error.name).toBe('WorkerPoolExhaustedError');
      expect(error.message).toBe('WorkerPool exhausted: all 5 workers are busy');
    });

    it('should handle zero maxSize', () => {
      const error = new WorkerPoolExhaustedError(0);

      expect(error.message).toBe('WorkerPool exhausted: all 0 workers are busy');
    });
  });

  describe('WorkerPoolDestroyedError', () => {
    it('should create error with proper message', () => {
      const error = new WorkerPoolDestroyedError();

      expect(error.name).toBe('WorkerPoolDestroyedError');
      expect(error.message).toBe('WorkerPool has been destroyed and cannot execute tasks');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('WorkerPoolQueueLimitError', () => {
    it('should create error with default message', () => {
      const error = new WorkerPoolQueueLimitError();

      expect(error.name).toBe('WorkerPoolQueueLimitError');
      expect(error.message).toBe('WorkerPool queue limit reached');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error with queueSize in message', () => {
      const error = new WorkerPoolQueueLimitError(100);

      expect(error.name).toBe('WorkerPoolQueueLimitError');
      expect(error.message).toBe('WorkerPool queue limit reached: 100 tasks already queued');
    });

    it('should handle zero queueSize', () => {
      const error = new WorkerPoolQueueLimitError(0);

      expect(error.message).toBe('WorkerPool queue limit reached: 0 tasks already queued');
    });
  });

  describe('Error inheritance', () => {
    it('should be instances of Error', () => {
      expect(new WorkerPoolExhaustedError()).toBeInstanceOf(Error);
      expect(new WorkerPoolDestroyedError()).toBeInstanceOf(Error);
      expect(new WorkerPoolQueueLimitError()).toBeInstanceOf(Error);
    });

    it('should have proper stack traces', () => {
      const error = new WorkerPoolExhaustedError();
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('WorkerPoolExhaustedError');
    });
  });
});
