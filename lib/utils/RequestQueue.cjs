/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

class RequestQueueManager {
  constructor(config) {
    this.config = config;
    this.running = 0;
    this.queue = [];
    this.idSeq = 0;
  }
  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }
  enqueue(fn, priority = 0) {
    if (!this.config?.enabled)
      return fn();
    if (this.config?.maxQueue > 0 && this.queue.length >= this.config?.maxQueue) {
      return Promise.reject(new Error("Request queue overflow"));
    }
    return new Promise((resolve, reject) => {
      const task = {
        id: ++this.idSeq,
        run: fn,
        resolve,
        reject,
        priority
      };
      const insertIndex = this.findInsertIndex(task);
      this.queue.splice(insertIndex, 0, task);
      this.pump();
    });
  }
  /**
   * 二分查找插入位置（优化版）
   * 按优先级降序，同优先级按 ID 升序（FIFO）
   */
  findInsertIndex(task) {
    let left = 0;
    let right = this.queue.length;
    while (left < right) {
      const mid = left + right >>> 1;
      const comparison = this.queue[mid].priority - task.priority;
      if (comparison > 0 || comparison === 0 && this.queue[mid].id < task.id) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return left;
  }
  pump() {
    while (this.running < this.config?.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      this.running++;
      task.run().then((v) => task.resolve(v)).catch((e) => task.reject(e)).finally(() => {
        this.running--;
        this.pump();
      });
    }
  }
  size() {
    return {
      running: this.running,
      queued: this.queue.length,
      concurrency: this.config?.concurrency
    };
  }
  /**
   * 清空队列（优化版：拒绝所有待处理任务，防止内存泄漏）
   */
  clear() {
    for (const task of this.queue) {
      task.reject(new Error("Queue cleared"));
    }
    this.queue = [];
  }
  /**
   * 销毁队列管理器
   */
  destroy() {
    this.clear();
  }
}

exports.RequestQueueManager = RequestQueueManager;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=RequestQueue.cjs.map
