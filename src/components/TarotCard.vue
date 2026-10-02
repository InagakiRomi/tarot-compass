<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";

withDefaults(
  defineProps<{
    src: string;
    alt?: string;
  }>(),
  {
    alt: "塔羅牌",
  },
);
</script>

<template>
  <Card class="w-36 overflow-hidden rounded-md border-0 p-0 shadow-md">
    <CardContent class="p-0">
      <img
        :src="src"
        :alt="alt"
        class="block h-auto w-full object-cover"
        draggable="false"
      />
    </CardContent>
  </Card>
</template>

<style scoped>
.tarot-card {
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.tarot-card:hover {
  transform: translateY(-4px);

  box-shadow:
    0 10px 24px rgb(67 33 110 / 0.18),
    0 2px 8px rgb(0 0 0 / 0.08);
}

@media (prefers-reduced-motion: reduce) {
  .tarot-card {
    transition: none;
  }

  .tarot-card:hover {
    transform: none;
  }
}
</style>
