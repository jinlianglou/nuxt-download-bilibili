//写个接口，接收url和清晰度，调用downloadBilibili.js

import downloadBilibili from '@/utils/downloadBilibili';
import { v4 as uuidv4 } from 'uuid';
import logger from "@/utils/logger";
export default defineEventHandler(async (event) => {
  const { dirs, url, quality } = await readBody(event);
  const taskId = uuidv4(); // 生成唯一的任务ID

  logger.info(dirs,url, quality)
  // 启动下载（不等待完成）
  downloadBilibili(dirs, url, quality, taskId).catch(logger.error);
  return {
    code: 200,
    data: {
      taskId
    },
  };
});