//初始化一个api
import fs from "fs";
import path from "path";
import logger from "@/utils/logger";

export default defineEventHandler(async (event) => {
  // 优化一下下面的代码，如果读取不到的时候返回一个空对象
  const configPath = path.join(process.cwd(), "custom-config.json");
  if (!fs.existsSync(configPath)) {
    return {
      code: 400,
      message: "config file not found",
    };
  }
  const config = fs.readFileSync(configPath, "utf8");
  const dir = JSON.parse(config).dir;
  if (!dir) {
    return {
      code: 400,
      message: "dir is not set",
    };
  }
  //我要的是从dir目录中读取子目录，并读取子目录中的文件数量  
  const dirList = fs.readdirSync(dir)
    .filter(item => fs.statSync(path.join(dir, item)).isDirectory())
  // console.error(dirList)
  logger.info('Directory list:', dirList)
  return {
    code: 200,
    message: "success",
    data: {
      dir,
      subDirList: dirList.map((subDir) => {
        try {
          const subDirPath = path.join(dir, subDir);
          const fileCount = fs.readdirSync(subDirPath)
            .filter(file => !fs.statSync(path.join(subDirPath, file)).isDirectory())
            .length;
          
          return {
            name: subDir,
            fileCount
          };
        } catch (error) {
          console.error(`Error reading directory ${subDir}:`, error);
          return {
            name: subDir,
            fileCount: 0
          };
        }
      })
    },
  };
});