//新建一个接口，用于创建文件夹
import path from 'path'
import fs from 'fs'

// 检查目录是否存在的辅助函数
async function checkDirExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(dirPath)
    return stats.isDirectory()
  } catch (error) {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const {newDirName, parentDir} = await readBody(event)
  // 1. 检查dirName是否合法
  if (!newDirName) {
    return {
      code: 500,
      message: 'newDirName is required'
    }
  }
  // 2. 检查parentDir是否存在
  const isDirExist = await checkDirExists(parentDir)
  if (!isDirExist) {
    return {
      code: 500,
      message: 'parentDir not found'
    }
  }
  
  const newDirPath = path.join(parentDir, newDirName)
  // 4. 检查新文件夹是否已存在
  const isNewDirExist = await checkDirExists(newDirPath)
  if (isNewDirExist) {
    return {
      code: 500,
      message: 'newDirName already exists'
    }
  }

  try {
    await fs.promises.mkdir(newDirPath)
    return {
      code: 200,
      message: 'success'
    }
  } catch (error) {
    return {
      code: 500,
      message: 'failed'
    }
  }
})