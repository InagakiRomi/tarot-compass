<script setup lang="ts">
import { ref } from "vue";
import DrawButton from "@/components/DrawButton.vue";
import TarotCard from "@/components/TarotCard.vue";
import { useTarotDeck, type TarotCard as TarotCardData } from "@/composables/useTarotDeck";

const CARD_COUNT = 5;

const { backCard, draw } = useTarotDeck();

/** 初始化 5 張牌背，牌背同樣來自 tarot.json */
const cards = ref<TarotCardData[]>(
  Array.from({ length: CARD_COUNT }, () => backCard),
);

/** 每次抽牌遞增，讓同一位置的同一張牌也重新掛載並重播翻牌 */
const drawId = ref(0);

/** 抽牌 */
function drawCards() {
  drawId.value += 1;
  cards.value = draw(CARD_COUNT);
}
</script>

<template>
  <main class="flex min-h-svh flex-col items-center justify-center gap-10 p-6">
    <div class="flex flex-wrap items-start justify-center gap-4">
      <TarotCard
        v-for="(card, index) in cards"
        :key="`${drawId}-${index}-${card.cardId}`"
        :card="card"
      />
    </div>

    <DrawButton @draw="drawCards" />
  </main>
</template>
