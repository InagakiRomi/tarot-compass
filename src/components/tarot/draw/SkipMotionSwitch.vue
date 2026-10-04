<script setup lang="ts">
import { Switch } from "@/components/ui/switch";

defineProps<{
  disabled?: boolean;
}>();

const checked = defineModel<boolean>({ required: true });
</script>

<template>
  <span class="skip-motion-switch">
    <Switch v-model="checked" :disabled="disabled" />
  </span>
</template>

<style scoped>
.skip-motion-switch {
  display: inline-flex;
}

.skip-motion-switch :deep([data-slot="switch"]) {
  height: 1.2rem;
  width: 2rem;
  border-color: rgb(210 174 102 / 0.42);
  background: rgb(22 12 34 / 0.92);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.05),
    0 0 0 1px rgb(143 115 70 / 0.18);
}

.skip-motion-switch :deep([data-slot="switch"][data-state="checked"]) {
  border-color: #e7c376;
  background: linear-gradient(180deg, #e7c376 0%, #d2ae66 100%);
}

.skip-motion-switch :deep([data-slot="switch"]:focus-visible) {
  border-color: #e7c376;
  box-shadow: 0 0 0 3px rgb(210 174 102 / 0.35);
}

.skip-motion-switch :deep([data-slot="switch-thumb"]) {
  background: #cbb58a;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.35);
}

.skip-motion-switch :deep([data-slot="switch"][data-state="checked"] [data-slot="switch-thumb"]) {
  background: #1b112b;
}
</style>
