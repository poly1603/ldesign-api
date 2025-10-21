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

class CacheWarmer {
  constructor(config = {}) {
    this.tasks = [];
    this.results = [];
    this.isWarming = false;
    this.config = {
      enabled: true,
      concurrency: 5,
      autoWarmup: false,
      throwOnError: false,
      timeout: 3e4,
      onProgress: () => {
      },
      onComplete: () => {
      },
      onError: () => {
      },
      ...config
    };
  }
  /**
   * 添加预热任务
   */
  addTask(task) {
    this.tasks.push({
      priority: 0,
      required: false,
      timeout: this.config?.timeout,
      retries: 0,
      ...task
    });
  }
  /**
   * 批量添加任务
   */
  addTasks(tasks) {
    tasks.forEach((task) => this.addTask(task));
  }
  /**
   * 清空任务
   */
  clearTasks() {
    this.tasks = [];
  }
  /**
   * 执行预热
   */
  async warmup(engine) {
    if (!this.config?.enabled) {
      return [];
    }
    if (this.isWarming) {
      throw new Error("Warmup is already in progress");
    }
    this.isWarming = true;
    this.results = [];
    try {
      const sortedTasks = [...this.tasks].sort((a, b) => (b.priority || 0) - (a.priority || 0));
      await this.executeTasksWithConcurrency(engine, sortedTasks);
      const requiredFailed = this.results.some((r, i) => !r.success && sortedTasks[i]?.required);
      if (requiredFailed && this.config?.throwOnError) {
        throw new Error("Required warmup tasks failed");
      }
      this.config?.onComplete(this.results);
      return this.results;
    } finally {
      this.isWarming = false;
    }
  }
  /**
   * 并发执行任务
   */
  async executeTasksWithConcurrency(engine, tasks) {
    const queue = [...tasks];
    const executing = [];
    while (queue.length > 0 || executing.length > 0) {
      while (executing.length < this.config?.concurrency && queue.length > 0) {
        const task = queue.shift();
        const promise = this.executeTask(engine, task).then(() => {
          const index = executing.indexOf(promise);
          if (index > -1) {
            executing.splice(index, 1);
          }
        });
        executing.push(promise);
      }
      if (executing.length > 0) {
        await Promise.race(executing);
      }
    }
  }
  /**
   * 执行单个任务
   */
  async executeTask(engine, task) {
    const startTime = Date.now();
    let attempt = 0;
    let lastError;
    while (attempt <= (task.retries || 0)) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Warmup task timeout")), task.timeout);
        });
        const callPromise = engine.call(task.methodName, task.params, {
          skipCache: false
          // 确保写入缓存
        });
        const data = await Promise.race([callPromise, timeoutPromise]);
        const duration2 = Date.now() - startTime;
        const result2 = {
          name: task.name,
          success: true,
          duration: duration2,
          data
        };
        this.results.push(result2);
        this.config?.onProgress(this.results.length, this.tasks.length, task);
        return;
      } catch (error) {
        lastError = error;
        attempt++;
        if (attempt <= (task.retries || 0)) {
          await new Promise((resolve) => setTimeout(resolve, 1e3 * attempt));
        }
      }
    }
    const duration = Date.now() - startTime;
    const result = {
      name: task.name,
      success: false,
      duration,
      error: lastError
    };
    this.results.push(result);
    this.config?.onError(lastError, task);
    this.config?.onProgress(this.results.length, this.tasks.length, task);
  }
  /**
   * 获取预热统计
   */
  getStats() {
    const succeeded = this.results.filter((r) => r.success).length;
    const failed = this.results.filter((r) => !r.success).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    return {
      total: this.results.length,
      succeeded,
      failed,
      totalDuration,
      averageDuration: this.results.length > 0 ? totalDuration / this.results.length : 0
    };
  }
  /**
   * 获取预热结果
   */
  getResults() {
    return [...this.results];
  }
  /**
   * 重置
   */
  reset() {
    this.results = [];
    this.isWarming = false;
  }
  /**
   * 更新配置
   */
  updateConfig(config) {
    Object.assign(this.config, config);
  }
}
function createCacheWarmer(config) {
  return new CacheWarmer(config);
}
async function quickWarmup(engine, tasks) {
  const warmer = new CacheWarmer({ concurrency: 5 });
  warmer.addTasks(tasks);
  return await warmer.warmup(engine);
}

exports.CacheWarmer = CacheWarmer;
exports.createCacheWarmer = createCacheWarmer;
exports.quickWarmup = quickWarmup;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=CacheWarmer.cjs.map
