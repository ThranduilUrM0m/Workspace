import { Worker } from 'worker_threads';
import * as os from 'os';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class WorkerPool implements OnModuleInit, OnModuleDestroy {
  private workers: Worker[] = [];
  private taskQueue: { task: any; resolve: Function; reject: Function }[] = [];
  private currentWorkerIndex = 0;

  async onModuleInit() {
    const numWorkers = os.cpus().length;
    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(`
        const { parentPort } = require('worker_threads');
        parentPort.on('message', (task) => {
          // Handle CPU-intensive work here
          parentPort.postMessage(task);
        });
      `, { eval: true });

      worker.on('message', this.handleWorkerMessage.bind(this));
      worker.on('error', this.handleWorkerError.bind(this));
      this.workers.push(worker);
    }
  }

  private handleWorkerMessage(result: any) {
    const task = this.taskQueue.shift();
    if (task) {
      task.resolve(result);
    }
    this.processNextTask();
  }

  private handleWorkerError(error: Error) {
    const task = this.taskQueue.shift();
    if (task) {
      task.reject(error);
    }
    this.processNextTask();
  }

  private processNextTask() {
    if (this.taskQueue.length > 0) {
      const task = this.taskQueue[0];
      const worker = this.workers[this.currentWorkerIndex];
      this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.workers.length;
      worker.postMessage(task.task);
    }
  }

  executeTask<T>(task: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task, resolve, reject });
      if (this.taskQueue.length === 1) {
        this.processNextTask();
      }
    });
  }

  async onModuleDestroy() {
    await Promise.all(this.workers.map(worker => worker.terminate()));
  }
}
