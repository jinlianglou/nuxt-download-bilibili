<template>
  <div class="index-page">
    <NSpace vertical>
      <NSpace>
        <NSpace vertical>
          <NInputGroup>
            <NInputGroupLabel>设定存放目录</NInputGroupLabel>
            <NInput v-model:value="rootDir" :style="{ width: '300px' }" />
            <NButton type="info" @click="handleConfirm">保存</NButton>
          </NInputGroup>
          <NSpace vertical>
            <NCard
              v-for="item in dirList" 
              :key="item.name" 
              class="dir-card"
              :class="{ 'dir-card--active': selectedDir === item.name }"
              hoverable 
              @click="handleDirClick([rootDir, item.name])"
            >
              <template #header>
                <span>文件夹：{{ item.name }}</span>
              </template>
              <span>文件数量：{{ item.fileCount }}</span>
            </NCard>
            <NCard
              hoverable 
            >
              <NFlex align="center" justify="space-between" style="cursor: pointer;" title="新建文件夹" @click="showCreateDirModal=true">
                <span>新建文件夹</span>
                <Icon>
                  <FolderAdd />
                </Icon>
              </NFlex>
            </NCard>
          </NSpace>
        </NSpace>
        <NSpace vertical>
          <NAffix :top="8" class="affix">
            <NInputGroup v-if="selectedDir">
              <NInputGroupLabel>下载地址</NInputGroupLabel>
              <NInput v-model:value="url" :style="{ width: '300px' }" />
              <NSelect
                v-model:value="selectedResolution"
                :options="resolutionOptions"
                :style="{ width: '120px' }"
              />
              <NButton type="info" @click="handleDownload">下载</NButton>
            </NInputGroup>
          </NAffix>
          <div v-if="activeTasks.length > 0">
            <div v-for="activeTask in activeTasks" :key="activeTask.taskId">
              <span>url: {{ activeTask.url }}</span>
              <NProgress type="line" :percentage="activeTask?.progress">{{ activeTask?.progress }}%</NProgress>
            </div>
          </div>
        </NSpace>
      </NSpace>
    </NSpace>

    <NModal v-model:show="showCreateDirModal" style="width: 300px;">
      <NCard>
        <NSpace vertical>
          <NInput v-model:value="newDirName" placeholder="请输入文件夹名称" />
          <br />
          <NFlex justify="end">
            <NButton type="default" @click="showCreateDirModal = false">取消</NButton>
            <NButton type="info" @click="handleCreateDirConfirm">确定</NButton>
          </NFlex>
        </NSpace>
      </NCard>
    </NModal>
  </div>
</template>
<script lang="ts" setup>
import { NSpace, NInput, NInputGroup, NInputGroupLabel, NButton, NCard, NSelect, NProgress, NAffix, NFlex, NModal } from "naive-ui";
import { useMessage } from 'naive-ui'
import { FolderAdd } from '@vicons/carbon';
const message = useMessage();

const selectedResolution = ref('1080P'); // 默认选中1080P

const resolutionOptions = [
  {
    label: '360P',
    value: '360P'
  },
  {
    label: '480P',
    value: '480P'
  },
  {
    label: '720P',
    value: '720P'
  },
  {
    label: '1080P',
    value: '1080P'
  }
];
/**根目录 */
const rootDir = ref("");
//页面初始化 先获取目录列表
const dirList = ref<{ name: string; fileCount: number }[]>([]);
//选中的目录
const selectedDir = ref<string>('');
//下载地址
const url = ref<string>('');
//任务ID对象
const taskIds = reactive<{ [key: string]: { taskId: string; url: string; progress: number; active: boolean } }>({});
// 正在下载的任务
const activeTasks = computed(() => {
  return Object.values(taskIds).filter(item => item.active);
});
// 新建文件夹的弹窗
const showCreateDirModal = ref(false);
const newDirName = ref('');

//获取目录列表
const getDirList = async () => {
  const res = await $fetch<{
    code: number;
    message: string;
    data: {
      dir: string;
      subDirList: { name: string; fileCount: number }[];
    };
  }>("/api/get-dir-list");
  
  if (res.code === 200) {
    const { dir, subDirList } = res.data;
    rootDir.value = dir;
    dirList.value = subDirList;
  } else {
    // message.info(res.message);
  }
}
onMounted(async () => {
  getDirList();
});
/**
 * 设置根目录
 */
const handleConfirm = async () => {
  const res = await $fetch("/api/set-download-dir", {
    method: "POST",
    body: {
      dir: rootDir.value,
    },
  });
  if (res.code === 200) {
    console.log("设置成功");
    getDirList();
  } else {
    message.error(res.message);
  }
}
/**
 * 点击目录
 */
 const handleDirClick = (dirs: string[]) => {
  console.log(dirs);
  selectedDir.value = dirs[1]; // 设置选中的目录名
}

/**
 * 下载视频
 */
const handleDownload = async () => {
  //从taskIds中找到url对应的taskId
  const taskId = Object.keys(taskIds).find(key => taskIds[key].url === url.value);
  if(taskId){
    message.info('该视频已下载');
    return;
  }
  const res = await $fetch("/api/download-bilibili", {
    method: "POST",
    body: {
      dirs: [rootDir.value, selectedDir.value],
      url: url.value,
      quality: selectedResolution.value,
    },
  });
  if (res.code === 200) {
    console.log(res.data);
    taskIds[res.data.taskId] = {
      taskId: res.data.taskId,
      url: url.value,
      progress: 0,
      active: true,
    }
    getDownloadProgress(res.data.taskId);
  }
}
/**获取下载进度 */
const getDownloadProgress = async (taskId: string) => {
  const res: {
    code: number;
    data: { progress: number };
    message: string;
  } = await $fetch("/api/get-download-progress", {
    method: "POST",
    body: {
      taskId,
    },
  });
  if (res.code === 200 && res.data) {
    taskIds[taskId].progress = res.data.progress;
    if(taskIds[taskId].progress < 100){
      setTimeout(() => getDownloadProgress(taskId), 1000);
    } else {
      getDirList();
    }
  } else {
    delete taskIds[taskId];
    message.error(res.message);
  }
}
const handleCreateDirConfirm = async () => {
  if(!newDirName.value){
    message.info('请输入文件夹名称');
    return;
  }
  //从 dirList 检测，新名字是否已存在
  if(dirList.value.find(item => item.name === newDirName.value)){
    message.info('该文件夹已存在');
    return;
  }
  showCreateDirModal.value = false;
  handleCreateDir(newDirName.value, rootDir.value);
}
/**
 * 新建文件夹
 */
const handleCreateDir = async (newDirName: string, rootDir: string  ) => {
  // console.log('新建文件夹');
  const res = await $fetch("/api/folder-add", {
    method: "POST",
    body: {
      newDirName,
      parentDir: rootDir,
    },
  });
  if (res.code === 200) {
    getDirList();
  } else {
    message.error(res.message);
  }
}
</script>

<style lang="css" scoped>
.index-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.dir-card {
  /* width: 463px; */
  cursor: pointer;
}

.dir-card--active {
  border: 1px solid #18a058;
  background-color: rgba(24, 160, 88, 0.1);
}
.affix{
  z-index: 10;
}
</style>
