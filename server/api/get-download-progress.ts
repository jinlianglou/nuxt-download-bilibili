//创建api，获取下载进度

import { DownloadProgressManager } from '@/utils/downloadProgressManager';

export default defineEventHandler(async (event) => {
  const { taskId } = await readBody(event);
  const progress = DownloadProgressManager.getInstance().getProgress(taskId);
  if(progress === undefined){
    return {
      code: 400,
      message: "taskId not found",
    };
  }
  return {
    code: 200,
    data: { progress },
  };
});