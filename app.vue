<template>
  <NMessageProvider>
    <IconConfigProvider>
      <NuxtPage />
    </IconConfigProvider>
  </NMessageProvider>
</template>
<script lang="ts" setup>
import { NMessageProvider } from 'naive-ui'
</script>
<style>
  html,
  body {
    margin: 0;
    padding: 0;
  }
</style>
