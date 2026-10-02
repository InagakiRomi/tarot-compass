<script setup lang="ts">
import { ref } from "vue";
import DrawButton from "@/components/DrawButton.vue";
import TarotCard from "@/components/TarotCard.vue";
import { useTarotDeck } from "@/composables/useTarotDeck";

const CARD_COUNT = 5;

const { tarotBack, draw } = useTarotDeck();

/** 初始化5張塔羅牌 */
const cards = ref<string[]>(
  Array.from({ length: CARD_COUNT }, () => tarotBack),
);

/** 抽牌 */
function drawCards() {
  cards.value = draw(CARD_COUNT);
}
</script>

<template>
  <main class="flex min-h-svh flex-col items-center justify-center gap-10 p-6">
    <div class="flex flex-wrap items-center justify-center gap-4">
      <TarotCard
        v-for="(src, index) in cards"
        :key="`${src}-${index}`"
        :src="src"
      />
    </div>

    <DrawButton @draw="drawCards" />
  </main>
</template>
