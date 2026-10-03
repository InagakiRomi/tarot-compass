<script setup lang="ts">
import { computed } from "vue";
import { motion } from "motion-v";
import { Card, CardContent } from "@/components/ui/card";
import { useTarotDeck } from "@/composables/useTarotDeck";
import type { TarotCard } from "@/composables/useTarotDeck";

/** 單張塔羅牌資料 */
const props = defineProps<{
  card: TarotCard;
}>();

/** 取得共用牌背資料 */
const { backCard } = useTarotDeck();

/** 判斷目前顯示的是否為牌背 */
const isBack = computed(
  () =>
    props.card.cardUrl === "tarotBack.jpg" ||
    props.card.cardName.length === 0,
);
</script>

<template>
  <div class="relative w-36 pb-7">
    <!-- 建立 3D 透視空間 -->
    <div class="card-scene aspect-25/44">
      <!-- 翻牌本體 -->
      <motion.div
        class="card-flip"
        :animate="{
          rotateY: isBack ? 0 : [0, -25, -90, -155, -180],
        }"
        :transition="{
          duration: 0.85,
          times: [0, 0.2, 0.5, 0.8, 1],
          ease: 'easeInOut',
        }"
      >
        <!-- 牌背 -->
        <div class="card-face card-back">
          <Card
            class="size-full overflow-hidden rounded-md border-0 p-0 shadow-md"
          >
            <CardContent class="h-full p-0">
              <img
                :src="backCard.imageSrc"
                alt="牌背"
                class="block size-full object-contain"
                draggable="false"
              />
            </CardContent>
          </Card>
        </div>

        <!-- 牌面 -->
        <div class="card-face card-front">
          <Card
            class="size-full overflow-hidden rounded-md border-0 p-0 shadow-md"
          >
            <CardContent class="h-full p-0">
              <img
                v-if="card.imageSrc"
                :src="card.imageSrc"
                :alt="card.cardName"
                class="block size-full object-contain"
                draggable="false"
              />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>

    <!-- 翻牌後顯示牌名 -->
    <p
      v-if="!isBack"
      class="absolute inset-x-0 top-full mt-2 text-center text-base leading-tight font-medium"
    >
      {{ card.cardName }}
    </p>
  </div>
</template>

<style scoped>
/* 建立卡片翻面的 3D 透視空間 */
.card-scene {
  perspective: 1200px;
}

/* 翻牌本體，保留正反面的 3D 關係 */
.card-flip {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

/* 正反面共用樣式 */
.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* 初始顯示牌背 */
.card-back {
  transform: rotateY(0deg);
}

/* 牌面預先旋轉至背面 */
.card-front {
  transform: rotateY(180deg);
}
</style>
