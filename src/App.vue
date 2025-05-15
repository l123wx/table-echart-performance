<script setup lang="ts">
import { ref } from 'vue'

const cacheList = ref<string[]>([])
</script>

<template>
  <div v-loading="true">
    <img class="logo" src="/logo.gif" alt="logo">
  </div>
  可以通过 Loading 动画观察页面卡顿情况
  <router-view v-slot="{ Component, route }">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cacheList">
        <component :is="Component" v-if="!route.meta.link" :key="route.path" />
      </keep-alive>
    </transition>
  </router-view>
</template>
