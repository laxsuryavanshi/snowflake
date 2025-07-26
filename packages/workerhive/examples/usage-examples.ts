/**
 * @fileoverview Example demonstrating WorkerPool usage with different patterns
 *
 * This example shows:
 * - Basic worker setup and pool creation
 * - Task execution and error handling
 * - Resource management and cleanup
 * - Advanced patterns like batching and monitoring
 */

/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-console */
import { WorkerPool, WorkerPoolExhaustedError, WorkerPoolQueueLimitError } from '../src/lib'; // @turtleby/workerhive;

// Define the worker API interface
interface ExampleWorkerAPI {
  fibonacci(n: number): Promise<number>;
  isPrime(n: number): Promise<boolean>;
  processArray(
    numbers: number[]
  ): Promise<{ sum: number; average: number; max: number; min: number }>;
  heavyComputation(data: string): Promise<string>;
}

/**
 * Basic usage example
 */
async function basicExample() {
  console.log('=== Basic Usage Example ===');

  // Create a worker pool
  const pool = new WorkerPool<ExampleWorkerAPI>(
    '/example-worker.js', // Path to your worker script
    {}, // Worker options
    4, // Max 4 concurrent workers
    100 // Max 100 queued tasks
  );

  try {
    // Execute single tasks
    const fib10 = await pool.execute('fibonacci', [10]);
    console.log('Fibonacci(10):', fib10);

    const isPrime17 = await pool.execute('isPrime', [17]);
    console.log('Is 17 prime?', isPrime17);

    // Execute multiple tasks in parallel
    const results = await Promise.all([
      pool.execute('fibonacci', [15]),
      pool.execute('fibonacci', [20]),
      pool.execute('isPrime', [97]),
      pool.execute('processArray', [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]),
    ]);

    console.log('Parallel results:', results);
  } catch (error) {
    console.error('Task failed:', error);
  } finally {
    // Always clean up
    pool.destroy();
  }
}

/**
 * Error handling example
 */
async function errorHandlingExample() {
  console.log('=== Error Handling Example ===');

  // Create a small pool to demonstrate exhaustion
  const pool = new WorkerPool<ExampleWorkerAPI>('/example-worker.js', {}, 1, 2);

  try {
    // Start some long-running tasks to fill the pool and queue
    const longTasks = [
      pool.execute('heavyComputation', ['task1']),
      pool.execute('heavyComputation', ['task2']),
      pool.execute('heavyComputation', ['task3']),
    ];

    // This should exceed the queue limit
    try {
      await pool.execute('fibonacci', [5]);
    } catch (error) {
      if (error instanceof WorkerPoolQueueLimitError) {
        console.log('✅ Queue limit exceeded as expected');
      }
    }

    // Try immediate execution
    try {
      await pool.executeImmediate('fibonacci', [5]);
    } catch (error) {
      if (error instanceof WorkerPoolExhaustedError) {
        console.log('✅ Pool exhausted as expected');
      }
    }

    // Wait for tasks to complete
    await Promise.allSettled(longTasks);
  } finally {
    pool.destroy();
  }
}

/**
 * Batch processing example
 */
async function batchProcessingExample() {
  console.log('=== Batch Processing Example ===');

  const pool = new WorkerPool<ExampleWorkerAPI>('/example-worker.js', {}, 4);

  // Process a large number of fibonacci calculations
  const numbers = Array.from({ length: 50 }, (_, i) => i + 1);

  try {
    console.log('Processing', numbers.length, 'fibonacci calculations...');

    const startTime = Date.now();

    // Process in batches of 10
    const batchSize = 10;
    const results: number[] = [];

    for (let i = 0; i < numbers.length; i += batchSize) {
      const batch = numbers.slice(i, i + batchSize);
      const batchPromises = batch.map(n => pool.execute('fibonacci', [n]));

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      console.log(
        `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(numbers.length / batchSize)}`
      );
    }

    const endTime = Date.now();
    console.log(`✅ Completed ${results.length} calculations in ${endTime - startTime}ms`);
    console.log(
      'Sample results:',
      results.slice(0, 10).map((result, i) => `fib(${i + 1})=${result}`)
    );
  } finally {
    pool.destroy();
  }
}

/**
 * Pool monitoring example
 */
class PoolMonitor {
  private pool: WorkerPool<ExampleWorkerAPI>;
  private stats = {
    tasksStarted: 0,
    tasksCompleted: 0,
    tasksFailed: 0,
    totalExecutionTime: 0,
  };

  constructor(pool: WorkerPool<ExampleWorkerAPI>) {
    this.pool = pool;
  }

  async execute<K extends keyof ExampleWorkerAPI>(
    func: K,
    args: Parameters<ExampleWorkerAPI[K]>
  ): Promise<Awaited<ReturnType<ExampleWorkerAPI[K]>>> {
    this.stats.tasksStarted++;
    const startTime = Date.now();

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const result = await this.pool.execute(func, args as any);
      this.stats.tasksCompleted++;
      this.stats.totalExecutionTime += Date.now() - startTime;
      return result;
    } catch (error) {
      this.stats.tasksFailed++;
      throw error;
    }
  }

  getStats() {
    return {
      ...this.stats,
      averageExecutionTime:
        this.stats.tasksCompleted > 0
          ? this.stats.totalExecutionTime / this.stats.tasksCompleted
          : 0,
    };
  }

  printStats() {
    const stats = this.getStats();
    console.log('=== Pool Statistics ===');
    console.log(`Tasks Started: ${stats.tasksStarted}`);
    console.log(`Tasks Completed: ${stats.tasksCompleted}`);
    console.log(`Tasks Failed: ${stats.tasksFailed}`);
    console.log(`Average Execution Time: ${stats.averageExecutionTime.toFixed(2)}ms`);
    console.log(`Success Rate: ${((stats.tasksCompleted / stats.tasksStarted) * 100).toFixed(1)}%`);
  }
}

async function monitoringExample() {
  console.log('=== Pool Monitoring Example ===');

  const pool = new WorkerPool<ExampleWorkerAPI>('/example-worker.js', {}, 3);
  const monitor = new PoolMonitor(pool);

  try {
    // Execute various tasks
    const tasks = [
      monitor.execute('fibonacci', [10]),
      monitor.execute('fibonacci', [15]),
      monitor.execute('fibonacci', [20]),
      monitor.execute('isPrime', [97]),
      monitor.execute('isPrime', [99]),
      monitor.execute('processArray', [[1, 2, 3, 4, 5]]),
    ];

    await Promise.allSettled(tasks);
    monitor.printStats();
  } finally {
    pool.destroy();
  }
}

/**
 * Graceful shutdown example
 */
async function gracefulShutdownExample() {
  console.log('=== Graceful Shutdown Example ===');

  const pool = new WorkerPool<ExampleWorkerAPI>('/example-worker.js', {}, 2);

  // Start some long-running tasks
  const longTasks = [
    pool.execute('heavyComputation', ['task1']),
    pool.execute('heavyComputation', ['task2']),
    pool.execute('heavyComputation', ['task3']), // This will be queued
  ];

  // Simulate shutdown after 1 second
  setTimeout(() => {
    console.log('Initiating graceful shutdown...');
    pool.destroy();
  }, 1000);

  // Handle task completions and failures
  const results = await Promise.allSettled(longTasks);

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`Task ${index + 1} completed:`, result.value);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log(`Task ${index + 1} failed:`, result.reason.message);
    }
  });
}

/**
 * Run all examples
 */
async function runExamples() {
  try {
    await basicExample();
    console.log('\n');

    await errorHandlingExample();
    console.log('\n');

    await batchProcessingExample();
    console.log('\n');

    await monitoringExample();
    console.log('\n');

    await gracefulShutdownExample();
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Run examples if this file is executed directly
if (typeof window === 'undefined') {
  void runExamples();
}

export {
  basicExample,
  batchProcessingExample,
  errorHandlingExample,
  gracefulShutdownExample,
  monitoringExample,
  PoolMonitor,
};
