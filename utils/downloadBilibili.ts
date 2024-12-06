import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { DownloadProgressManager } from './downloadProgressManager';
export default async function downloadBilibili(dirs: string[], url: string, inputQuality: string, taskId: string) {
  const progressManager = DownloadProgressManager.getInstance();
  progressManager.setProgress(taskId, 0); //先初始化key
  try {
    const savePath = path.join(dirs[0], dirs[1]);
    const videoInfo = await getVideoInfo(url);
    console.log(`视频标题: ${videoInfo.title}`);
    // console.log('可用清晰度:');
    // console.log('1. 360P');
    // console.log('2. 480P');
    // console.log('3. 720P');
    // console.log('4. 1080P');
    const quality = getQualityCode(inputQuality);
    const downloadUrl = await getDownloadUrl(videoInfo.bvid, videoInfo.cid, quality);
    await downloadVideo(downloadUrl, savePath, videoInfo.title, taskId);
    // progressManager.removeTask(taskId);
    console.log(`视频 "${videoInfo.title}" 下载完成!`);
  } catch (e) {
    progressManager.removeTask(taskId);
    console.log(`发生错误: ${e}`);
  }
}

async function getVideoInfo(url: string) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  let jsonString;
  $('script').each((i, script) => {
    const scriptContent = $(script).html();
    if (scriptContent && scriptContent.includes('window.__INITIAL_STATE__')) {
      const startIndex = scriptContent.indexOf('window.__INITIAL_STATE__=') + 'window.__INITIAL_STATE__='.length;
      const endIndex = scriptContent.indexOf(';(function()');
      if (startIndex !== -1 && endIndex !== -1) {
        jsonString = scriptContent.substring(startIndex, endIndex);
      }
    }
  });

  if (!jsonString) {
    console.error('无法找到视频信息');
    throw new Error('无法找到视频信息');
  }

  let videoData;
  try {
    videoData = JSON.parse(jsonString);
  } catch (e) {
    console.error('解析视频信息时发生错误:', e);
    throw new Error('解析视频信息时发生错误');
  }

  return {
    title: videoData.videoData.title,
    cid: videoData.videoData.cid.toString(),
    bvid: videoData.bvid,
  };
}

function getQualityCode(choice: string) {
  switch (choice) {
    case '360P': return 16;
    case '480P': return 32;
    case '720P': return 64;
    case '1080P': return 80;
    default: return 32; // 默认480P
  }
}

async function getDownloadUrl(bvid: string, cid: string, quality: number) {
  const apiUrl = `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=${quality}`;
  const response = await axios.get(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      'Referer': `https://www.bilibili.com/video/${bvid}`,
      'Origin': 'https://www.bilibili.com',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
    }
  });
  const data = response.data;

  if (data.code !== 0) throw new Error('获取下载链接失败');
  return data.data.durl[0].url;
}

async function downloadVideo(url: string, savePath: string, title: string, taskId: string) {
  const progressManager = DownloadProgressManager.getInstance();
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      'Referer': 'https://www.bilibili.com',
      'Origin': 'https://www.bilibili.com',
      'Accept': 'video/webm,video/ogg,video/*;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
    }
  });
  return new Promise((resolve, reject) => {
    const totalLength = response.headers['content-length'];
    let receivedBytes = 0;

    const writer = fs.createWriteStream(path.join(savePath, `${title}.mp4`));
    response.data.on('data', (chunk: Buffer) => {
      writer.write(chunk);
      receivedBytes += chunk.length;
      const progress = ((receivedBytes / totalLength) * 100).toFixed(2);
      progressManager.setProgress(taskId, Number(progress));
      process.stdout.write(`\r下载进度: ${progress}%`);
    });

    response.data.on('end', () => {
      writer.end();
      console.log('\n');
      resolve(1);
    });

    response.data.on('error', (err: any) => {
      writer.end();
      reject(`下载过程中发生错误: ${err}`)
    });
  })
}