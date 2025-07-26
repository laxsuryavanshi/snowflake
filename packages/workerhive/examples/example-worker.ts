/**
 * Example worker script demonstrating how to set up a worker for use with WorkerPool
 * This file should be served as a separate script file in your application
 */

import { expose } from 'comlink';

/**
 * Worker API implementation
 * Each function will be callable from the main thread via the WorkerPool
 * Note: Comlink automatically wraps return values in Promises, so you don't need to return Promises explicitly
 */
const workerAPI = {
  /**
   * Calculate fibonacci number (CPU intensive task)
   * Comlink automatically wraps the return value as Promise<number>
   */
  fibonacci(n: number): number {
    if (n <= 1) return n;

    let a = 0;
    let b = 1;
    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  },

  /**
   * Check if a number is prime
   * Comlink automatically wraps the return value as Promise<boolean>
   */
  isPrime(n: number): boolean {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  },

  /**
   * Process an array of numbers and return statistics
   * Comlink automatically wraps the return value as Promise<{...}>
   */
  processArray(numbers: number[]): {
    sum: number;
    average: number;
    max: number;
    min: number;
  } {
    if (numbers.length === 0) {
      return { sum: 0, average: 0, max: 0, min: 0 };
    }

    const sum = numbers.reduce((acc, n) => acc + n, 0);
    const average = sum / numbers.length;
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);

    return { sum, average, max, min };
  },

  /**
   * Simulate heavy computation with delay
   */
  async heavyComputation(data: string): Promise<string> {
    // Simulate heavy work
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `Processed: ${data}`;
  },
};

// Export the type for use in main thread
export type ExampleWorkerAPI = typeof workerAPI;

// Expose the API to make it callable from main thread
expose(workerAPI);
