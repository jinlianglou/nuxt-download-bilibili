<template>
  <NSpace vertical>
    <NLayout>
      <!-- 顶部菜单 -->
      <NLayoutHeader>
        <NMenu
          mode="horizontal"
          :options="menuOptions"
          @update:value="handleMenuChange"
          style="border-bottom: 1px solid #e5e5e5; padding: 0 20px"
        />
      </NLayoutHeader>

      <!-- 下面的内容区域 -->
      <NLayoutContent>
        <slot />
      </NLayoutContent>
    </NLayout>
  </NSpace>
</template>

<script lang="ts" setup>
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NSpace,
} from "naive-ui";

const menuOptions = [
  { label: "首页", key: "" },
  { label: "关于", key: "about" },
];

const handleMenuChange = (key: string) => {
  // 你可以在这里处理菜单项的点击事件，例如进行页面跳转
  console.log("选择了菜单项:", key);
  // 按组件name跳转
  navigateTo(`/${key}`);
}
</script>

<style scoped>
/* 你可以在这里加入一些自定义样式 */
</style>
