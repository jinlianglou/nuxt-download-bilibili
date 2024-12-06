// 创建一个进度管理器
export class DownloadProgressManager {
  private static instance: DownloadProgressManager;
  private progressMap: Map<string, number> = new Map();

  private constructor() {}
  /**获取实例（单例） */
  static getInstance() {
    if (!this.instance) {
      this.instance = new DownloadProgressManager();
    }
    return this.instance;
  }
  /**更新进度 */
  setProgress(taskId: string, progress: number) {
    this.progressMap.set(taskId, progress);
  }

  getProgress(taskId: string) {
    if(this.progressMap.has(taskId)){
      return this.progressMap.get(taskId) || 0;
    }
    return undefined;
  }
  /**删除任务 */
  removeTask(taskId: string) {
    this.progressMap.delete(taskId);
  }
}