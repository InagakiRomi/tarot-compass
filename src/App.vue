<script setup lang="ts">
import { RouterView } from "vue-router";
import { Toaster } from "@/components/ui/sonner";
</script>

<template>
  <RouterView />
  <Toaster
    theme="dark"
    position="top-center"
    rich-colors
    :duration="3200"
    :style="{
      '--normal-bg': 'rgba(27, 17, 43, 0.94)',
      '--normal-text': '#f1ebfa',
      '--normal-border': 'rgba(208, 180, 119, 0.4)',
      '--success-bg': 'rgba(28, 22, 36, 0.96)',
      '--success-border': 'rgba(231, 195, 118, 0.45)',
      '--success-text': '#f4e3b2',
      '--warning-bg': 'rgba(46, 32, 24, 0.96)',
      '--warning-border': 'rgba(234, 215, 162, 0.48)',
      '--warning-text': '#ead7a2',
      '--border-radius': '14px',
    }"
  />
</template>
