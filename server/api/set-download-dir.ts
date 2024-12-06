//初始化个api
import fs from "fs";
import path from "path";
import logger from "@/utils/logger";

export default defineEventHandler(async (event) => {
  const { dir } = await readBody(event);
  //   判断dir存在并且是一个本地目录
  if (!dir || !fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
    return {
      code: 400,
      message: "dir is not a valid directory",
    };
  }
  // 将dir写入到项目根目录下的config.json文件中
  // 如果没有此文件先创建 
  const configPath = path.join(process.cwd(), "custom-config.json");
  // console.log(configPath);
  logger.info(configPath)
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, "{}");
  }
  fs.writeFileSync(configPath, JSON.stringify({ dir }));

  return {
    code: 200,
    message: "success",
  };
});
