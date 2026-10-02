<script setup lang="ts">
import { computed } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import type { TarotCard } from "@/composables/useTarotDeck";

// 牌面圖片
const props = defineProps<{
  card: TarotCard;
}>();

// 牌背圖片
const isBack = computed(
  () =>
    props.card.cardUrl === "tarotBack.jpg" || props.card.cardName.length === 0,
);
</script>

<template>
  <div class="relative w-36 pb-7">
    <Card
      class="aspect-25/44 overflow-hidden rounded-md border-0 p-0 shadow-md transition-[transform,box-shadow] duration-250 ease-out hover:-translate-y-1 hover:shadow-[0_10px_24px_rgb(67_33_110/0.18),0_2px_8px_rgb(0_0_0/0.08)] motion-reduce:transform-none motion-reduce:transition-none"
    >
      <CardContent class="h-full p-0">
        <!-- 牌面圖片 -->
        <img
          v-if="card.imageSrc"
          :src="card.imageSrc"
          :alt="isBack ? '牌背' : card.cardName"
          class="block size-full object-contain"
          draggable="false"
        />
      </CardContent>
    </Card>

    <!-- 牌面文字 -->
    <p
      v-if="!isBack"
      class="absolute inset-x-0 top-full mt-2 text-center text-sm leading-tight font-medium"
    >
      {{ card.cardName }}
    </p>
  </div>
</template>
