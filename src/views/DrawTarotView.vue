<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from "vue";

import DrawControls from "@/components/tarot/draw/DrawControls.vue";
import OracleBackdrop from "@/components/tarot/decor/OracleBackdrop.vue";
import PageOrnament from "@/components/tarot/decor/PageOrnament.vue";
import TarotBoardPattern from "@/components/tarot/decor/TarotBoardPattern.vue";
import TarotCard from "@/components/tarot/card/TarotCard.vue";

import {
  useTarotDeck,
  type TarotCard as TarotCardData,
} from "@/composables/useTarotDeck";

/** 最少允許抽取的牌數 */
const MIN_DRAW_COUNT = 1;

/** 最多允許抽取的牌數，一副塔羅共 78 張 */
const MAX_DRAW_COUNT = 78;

/** 預設抽取與初始顯示的牌數 */
const DEFAULT_COUNT = 5;

/** 中央牌堆出現並微微放大的時間，尾段即停留 */
const GATHER_MS = 400;

/** 從牌堆飛到定位的時間 */
const FLY_MS = 700;

/** 每張牌出發的間隔 */
const STAGGER_MS = 62;

type DealPhase = "idle" | "pending" | "gathering" | "flying";

type SpreadLayout = {
  cols: number;
  cardSize: string;
  columnGap: string;
};

const { deckSize, draw } = useTarotDeck();

function createSpread(count: number): (TarotCardData | null)[] {
  return Array.from({ length: count }, () => null);
}

const drawCount = ref(DEFAULT_COUNT);
const drawId = ref(0);
const isRitual = ref(false);
const dealPhase = ref<DealPhase>("idle");
const faceDown = ref(false);
const useDealDelay = ref(false);
const cards = ref<(TarotCardData | null)[]>(createSpread(DEFAULT_COUNT));
const listRef = ref<HTMLElement | null>(null);
const containerWidth = ref(estimateContainerWidth());
const spreadLayout = ref<SpreadLayout>(
  computeSpread(DEFAULT_COUNT, containerWidth.value, viewportWidth()),
);
const offsets = ref<{ x: number; y: number }[]>([]);
const settled = ref<boolean[]>([]);

let timers: number[] = [];
let resizeObserver: ResizeObserver | undefined;
let alive = true;

const maxCount = computed(() => Math.min(MAX_DRAW_COUNT, deckSize));
const isDealing = computed(() => dealPhase.value !== "idle");

const gridStyle = computed(() => ({
  "--spread-cols": String(spreadLayout.value.cols),
  "--card-size": spreadLayout.value.cardSize,
  "--spread-gap": spreadLayout.value.columnGap,
}));

function viewportWidth() {
  return typeof window === "undefined" ? 1280 : window.innerWidth;
}

/** 首屏還沒量到牌陣寬度時，用視窗扣掉頁面與外框內距估算 */
function estimateContainerWidth() {
  if (typeof window === "undefined") {
    return 1040;
  }

  const viewport = window.innerWidth;
  const pagePad = viewport < 760 ? 48 : 69;
  const boardPad = viewport < 980 ? 32 : 40;

  return Math.max(180, Math.min(1216, viewport - pagePad) - boardPad);
}

function cardBand(count: number) {
  if (count <= 5) {
    return { ideal: 158, min: 140, max: 165 };
  }

  if (count <= 8) {
    return { ideal: 136, min: 120, max: 145 };
  }

  if (count <= 12) {
    return { ideal: 122, min: 108, max: 130 };
  }

  return { ideal: 110, min: 100, max: 120 };
}

/** 先決定希望的列數；真的塞不下時再減少欄數 */
function preferredColumns(count: number, viewport: number) {
  if (count <= 1) {
    return 1;
  }

  if (viewport < 720) {
    return count <= 2 ? count : 3;
  }

  if (viewport < 1100) {
    if (count <= 3) {
      return count;
    }

    return Math.min(4, count);
  }

  if (count <= 8) {
    return count;
  }

  return 6;
}

function computeSpread(count: number, rawWidth: number, viewport: number): SpreadLayout {
  const safeCount = Math.max(1, count);
  const gap = viewport < 720 ? 12 : 16;
  const available = Math.max(160, Math.floor(rawWidth) - 2);
  const band = cardBand(safeCount);

  let max = band.max;
  let min = band.min;
  let ideal = band.ideal;

  if (viewport < 720) {
    max = safeCount === 1 ? 158 : 132;
    min = 96;
    ideal = Math.min(ideal, max);
  } else if (viewport < 1100) {
    max = Math.min(max, safeCount <= 3 ? 156 : 136);
    min = Math.min(min, 104);
    ideal = Math.min(ideal, max);
  }

  let cols = Math.min(preferredColumns(safeCount, viewport), safeCount);

  const used = (columns: number, size: number) =>
    columns * size + Math.max(0, columns - 1) * gap;

  if (used(cols, ideal) > available) {
    const shrunk = Math.floor((available - Math.max(0, cols - 1) * gap) / cols);

    if (shrunk >= min) {
      ideal = shrunk;
    } else {
      cols = Math.max(1, Math.min(safeCount, Math.floor((available + gap) / (min + gap))));
      ideal = Math.floor((available - Math.max(0, cols - 1) * gap) / cols);
      ideal = Math.min(max, Math.max(88, ideal));
    }
  }

  ideal = Math.min(max, Math.max(88, ideal));

  if (used(cols, ideal) > available && cols > 1) {
    cols -= 1;
    ideal = Math.min(
      max,
      Math.max(88, Math.floor((available - Math.max(0, cols - 1) * gap) / cols)),
    );
  }

  return {
    cols,
    cardSize: `${ideal}px`,
    columnGap: `${gap}px`,
  };
}

function listWidth() {
  const measured = listRef.value?.clientWidth ?? 0;

  if (measured > 0) {
    return measured;
  }

  return containerWidth.value;
}

function applyLayout(count = cards.value.length) {
  const width = listWidth();

  if (width > 0) {
    containerWidth.value = width;
  }

  spreadLayout.value = computeSpread(count, containerWidth.value, viewportWidth());
}

function cardMotionStyle(index: number) {
  const offset = offsets.value[index];
  const jitterX = ((index % 5) - 2) * 1.5;
  const jitterY = ((index % 3) - 1) * 1.6;
  const spin = ((index % 5) - 2) * 0.85;
  const fromX = offset ? offset.x + jitterX : 0;
  const fromY = offset ? offset.y + jitterY : 0;

  return {
    "--from-x": `${fromX}px`,
    "--from-y": `${fromY}px`,
    "--spin": `${spin}deg`,
    "--stagger": `${index * STAGGER_MS}ms`,
    "--z": String(Math.max(cards.value.length - index, 1)),
  };
}

function revealDelayFor(index: number) {
  if (!useDealDelay.value) {
    return Math.min(index * 0.08, 1.2);
  }

  return (index * STAGGER_MS + FLY_MS + 60) / 1000;
}

function later(fn: () => void, ms: number) {
  const id = window.setTimeout(fn, ms);
  timers.push(id);
}

function clearTimers() {
  timers.forEach((id) => window.clearTimeout(id));
  timers = [];
}

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function syncSpread(count: number) {
  cards.value = createSpread(count);
}

watch(drawCount, (count) => {
  if (isRitual.value) {
    return;
  }

  if (cards.value.length !== count) {
    syncSpread(count);
    applyLayout(count);
  }
});

function finishRitual() {
  dealPhase.value = "idle";
  isRitual.value = false;
  offsets.value = [];
  settled.value = [];
  applyLayout();
}

function measureOffsets(list: HTMLElement) {
  const listRect = list.getBoundingClientRect();
  const centerX = listRect.left + listRect.width / 2;
  const centerY = listRect.top + listRect.height / 2;
  const nodes = list.querySelectorAll<HTMLElement>(":scope > .tarot-card");

  return Array.from(nodes).map((node) => {
    const rect = node.getBoundingClientRect();

    return {
      x: centerX - (rect.left + rect.width / 2),
      y: centerY - (rect.top + rect.height / 2),
    };
  });
}

/** 牌陣比視窗高時，把幾何中心捲進畫面，牌堆才看得到 */
function bringSpreadIntoView(list: HTMLElement) {
  const rect = list.getBoundingClientRect();
  const view = window.innerHeight;
  const fullyVisible = rect.height <= view * 0.92 && rect.top >= 8 && rect.bottom <= view - 8;

  if (fullyVisible) {
    return;
  }

  const top = window.scrollY + rect.top + rect.height / 2 - view / 2;
  window.scrollTo(0, Math.max(0, top));
}

function onCardAnimationEnd(event: AnimationEvent, index: number) {
  if (event.target !== event.currentTarget) {
    return;
  }

  if (!event.animationName.includes("deal-fly")) {
    return;
  }

  if (settled.value[index]) {
    return;
  }

  const next = settled.value.slice();
  next[index] = true;
  settled.value = next;
}

async function startDeal(count: number, reducedMotion: boolean) {
  const drawn = draw(count);

  clearTimers();
  offsets.value = [];
  settled.value = [];
  useDealDelay.value = !reducedMotion;
  spreadLayout.value = computeSpread(count, listWidth(), viewportWidth());

  if (reducedMotion) {
    faceDown.value = false;
    drawId.value += 1;
    cards.value = drawn;
    finishRitual();
    return;
  }

  faceDown.value = true;
  dealPhase.value = "pending";
  drawId.value += 1;
  cards.value = drawn;

  await nextTick();
  await nextFrame();

  if (!alive) {
    return;
  }

  const list = listRef.value;

  if (list) {
    bringSpreadIntoView(list);
    offsets.value = measureOffsets(list);
  }

  dealPhase.value = "gathering";

  later(() => {
    if (!alive) {
      return;
    }

    faceDown.value = false;
    dealPhase.value = "flying";

    later(() => {
      if (!alive) {
        return;
      }

      finishRitual();
    }, (count - 1) * STAGGER_MS + FLY_MS + 40);
  }, GATHER_MS);
}

function beginRitual() {
  if (isRitual.value) {
    return;
  }

  const count = Math.min(maxCount.value, Math.max(MIN_DRAW_COUNT, drawCount.value));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  isRitual.value = true;
  clearTimers();
  void startDeal(count, reducedMotion);
}

onMounted(() => {
  const list = listRef.value;

  if (list) {
    resizeObserver = new ResizeObserver(() => {
      const width = list.clientWidth;

      if (width > 0) {
        containerWidth.value = width;
      }

      if (dealPhase.value === "idle") {
        applyLayout();
      }
    });
    resizeObserver.observe(list);
  }

  applyLayout();
});

onUnmounted(() => {
  alive = false;
  clearTimers();
  resizeObserver?.disconnect();
});
</script>

<template>
  <main class="tarot-page">
    <OracleBackdrop>
      <div class="tarot-layout">
        <PageOrnament />

        <section
          class="tarot-board"
          :class="{ 'is-ritual': isRitual, 'is-dealing': isDealing }"
          aria-label="塔羅牌陣"
        >
          <div class="tarot-board-glow" aria-hidden="true" />
          <div class="tarot-board-glow tarot-board-glow-ritual" aria-hidden="true" />
          <TarotBoardPattern />

          <div
            ref="listRef"
            class="tarot-card-list"
            :style="gridStyle"
            :data-cols="spreadLayout.cols"
            :data-card-size="spreadLayout.cardSize"
            :data-deal="dealPhase"
          >
            <div
              v-for="(card, index) in cards"
              :key="`${drawId}-${index}`"
              class="tarot-card"
              :class="{
                'is-pending': dealPhase === 'pending',
                'is-gathering': dealPhase === 'gathering',
                'is-flying': dealPhase === 'flying' && !settled[index],
                'is-settled': dealPhase === 'flying' && settled[index],
              }"
              :style="cardMotionStyle(index)"
              @animationend="onCardAnimationEnd($event, index)"
            >
              <TarotCard
                :card="card"
                :face-down="faceDown"
                :reveal-delay="revealDelayFor(index)"
              />
            </div>
          </div>
        </section>

        <DrawControls
          v-model="drawCount"
          :min="MIN_DRAW_COUNT"
          :max="maxCount"
          @draw="beginRitual"
        />

        <PageOrnament />
      </div>
    </OracleBackdrop>
  </main>
</template>

<style scoped>
.tarot-page {
  --bg-dark: #0d0818;
  --bg-purple: #181026;
  --text-muted: #afa4c1;

  --tarot-text: #f1ebfa;
  --tarot-gold: #d0b477;
  --tarot-gold-light: #ead7a2;
  --tarot-gold-bright: #f0ddaa;

  --tarot-purple-300: #a47bea;
  --tarot-purple-400: #985ed6;
  --tarot-purple-500: #7748c8;
  --tarot-purple-600: #6940b1;

  --tarot-surface: #1b112b;

  position: relative;
  isolation: isolate;
  display: flex;
  width: 100%;
  max-width: 100%;
  min-height: 100svh;
  flex-direction: column;
  align-items: stretch;
  overflow-x: clip;
  color: var(--tarot-text);
  background:
    radial-gradient(
      ellipse at 50% -8%,
      rgb(119 81 201 / 0.22),
      transparent 46%
    ),
    linear-gradient(180deg, var(--bg-purple) 0%, var(--bg-dark) 100%);
}

.tarot-page::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  opacity: 0.028;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode: soft-light;
}

.tarot-layout {
  position: relative;
  z-index: 1;
  display: flex;
  width: min(100%, 76rem);
  max-width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  margin-block: auto;
  gap: 0.85rem;
}

.tarot-board {
  position: relative;
  isolation: isolate;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-bottom: 1.15rem;
  overflow: visible;
  padding: 2.15rem 1.2rem 1.7rem;
  border: 1px solid color-mix(in srgb, var(--tarot-gold) 50%, transparent);
  border-radius: 18px;
  background:
    radial-gradient(
      ellipse at 50% -20%,
      rgb(141 83 170 / 0.26),
      transparent 55%
    ),
    radial-gradient(
      ellipse at 50% 120%,
      rgb(75 42 110 / 0.18),
      transparent 50%
    ),
    linear-gradient(180deg, rgb(42 20 42 / 0.96), rgb(17 9 24 / 0.98));
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.05),
    inset 0 0 80px rgb(48 22 72 / 0.18),
    0 24px 60px rgb(0 0 0 / 0.35);
}

.tarot-board::before {
  content: "";
  position: absolute;
  inset: 7px;
  z-index: 1;
  border: 1px solid color-mix(in srgb, var(--tarot-gold) 14%, transparent);
  border-radius: 12px;
  pointer-events: none;
}

.tarot-board-glow {
  position: absolute;
  top: 45%;
  left: 50%;
  z-index: 0;
  width: 75%;
  height: 80%;
  background: radial-gradient(
    ellipse,
    rgb(153 100 226 / 0.18),
    rgb(96 48 145 / 0.05) 45%,
    transparent 72%
  );
  filter: blur(40px);
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.tarot-board-glow-ritual {
  background: radial-gradient(
    ellipse,
    rgb(186 140 245 / 0.46),
    rgb(120 70 180 / 0.14) 42%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.35s ease;
}

.tarot-board.is-ritual .tarot-board-glow-ritual {
  opacity: 1;
}

.tarot-card-list {
  position: relative;
  z-index: 2;
  display: grid;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  grid-template-columns: repeat(var(--spread-cols, 1), minmax(0, var(--card-size, 158px)));
  justify-content: center;
  align-items: start;
  align-content: start;
  column-gap: var(--spread-gap, 16px);
  row-gap: clamp(1.25rem, 1.6vw, 2rem);
}

.tarot-card {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  justify-content: center;
  transform-origin: center center;
}

.tarot-card.is-pending {
  opacity: 0;
}

.tarot-card.is-gathering,
.tarot-card.is-flying {
  z-index: var(--z, 1);
}

.tarot-card.is-gathering {
  animation: deal-gather 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.tarot-card.is-flying {
  animation: deal-fly 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--stagger, 0ms);
}

.tarot-card.is-settled {
  z-index: 1;
  opacity: 1;
  animation: none;
  transform: none;
}

.tarot-board.is-dealing .tarot-card {
  pointer-events: none;
  will-change: transform, opacity;
}

@keyframes deal-gather {
  0% {
    opacity: 0;
    transform: translate3d(var(--from-x), var(--from-y), 0) scale(0.86) rotate(var(--spin));
  }

  48% {
    opacity: 1;
    transform: translate3d(var(--from-x), var(--from-y), 0) scale(0.96)
      rotate(calc(var(--spin) * 0.35));
  }

  100% {
    opacity: 1;
    transform: translate3d(var(--from-x), var(--from-y), 0) scale(1) rotate(0deg);
  }
}

@keyframes deal-fly {
  0% {
    opacity: 1;
    transform: translate3d(var(--from-x), var(--from-y), 0) scale(1) rotate(0deg);
  }

  16% {
    opacity: 0.8;
    transform: translate3d(calc(var(--from-x) * 0.78), calc(var(--from-y) * 0.78), 0) scale(0.96)
      rotate(var(--spin));
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
  }
}

@media (max-width: 980px) {
  .tarot-board {
    padding-inline: 1rem;
  }
}

@media (max-width: 760px) {
  .tarot-layout {
    margin-block: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tarot-card.is-pending,
  .tarot-card.is-gathering,
  .tarot-card.is-flying,
  .tarot-board-glow-ritual {
    animation: none;
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
