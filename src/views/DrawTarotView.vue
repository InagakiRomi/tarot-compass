<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { toast } from "vue-sonner";

import DrawControls from "@/components/tarot/draw/DrawControls.vue";
import OracleBackdrop from "@/components/tarot/decor/OracleBackdrop.vue";
import PageOrnament from "@/components/tarot/decor/PageOrnament.vue";
import TarotBoardPattern from "@/components/tarot/decor/TarotBoardPattern.vue";
import TarotCard from "@/components/tarot/card/TarotCard.vue";

import {
  useTarotDeck,
  type TarotCard as TarotCardData,
} from "@/composables/useTarotDeck";
import { useDrawStore } from "@/stores/draw";
import { useHistoryStore } from "@/stores/history";

/** 最少允許抽取的牌數 */
const MIN_DRAW_COUNT = 1;

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

const { tarotCards, draw } = useTarotDeck();
const drawStore = useDrawStore();
const historyStore = useHistoryStore();
const { deckType, drawCount, skipMotion, cards, maxDrawCount } = storeToRefs(drawStore);

function createSpread(count: number): (TarotCardData | null)[] {
  return Array.from({ length: count }, () => null);
}

const availableCards = computed(() => {
  return deckType.value === "major" ? tarotCards.slice(0, 22) : tarotCards;
});
const drawId = ref(0);
const isRitual = ref(false);
const dealPhase = ref<DealPhase>("idle");
const faceDown = ref(false);
const useDealDelay = ref(false);
const listRef = ref<HTMLElement | null>(null);
const containerWidth = ref(estimateContainerWidth());
const spreadLayout = ref<SpreadLayout>(
  computeSpread(cards.value.length, containerWidth.value, viewportWidth()),
);
const offsets = ref<{ x: number; y: number }[]>([]);
const settled = ref<boolean[]>([]);
const entering = ref<boolean[]>([]);

let timers: number[] = [];
let resizeObserver: ResizeObserver | undefined;
let alive = true;

const isDealing = computed(() => dealPhase.value !== "idle");

const hasReading = computed(
  () => !isRitual.value && cards.value.some((card) => card !== null),
);

const gridStyle = computed(() => ({
  "--spread-cols": String(spreadLayout.value.cols),
  "--card-size": spreadLayout.value.cardSize,
  "--spread-gap": spreadLayout.value.columnGap,
}));

const cardRows = computed(() => {
  const cols = Math.max(1, spreadLayout.value.cols);
  const rows: { card: TarotCardData | null; index: number }[][] = [];

  cards.value.forEach((card, index) => {
    const rowIndex = Math.floor(index / cols);
    const row = rows[rowIndex] ?? [];
    row.push({ card, index });
    rows[rowIndex] = row;
  });

  return rows;
});

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
    return { ideal: 176, min: 148, max: 188 };
  }

  if (count <= 8) {
    return { ideal: 152, min: 128, max: 164 };
  }

  if (count <= 12) {
    return { ideal: 136, min: 116, max: 148 };
  }

  return { ideal: 122, min: 104, max: 132 };
}

/** 先決定希望的列數；真的塞不下時再減少欄數 */
function preferredColumns(count: number, viewport: number) {
  if (count <= 1) {
    return 1;
  }

  if (viewport < 760 && count >= 13) {
    return Math.min(3, count);
  }

  if (viewport < 520) {
    return Math.min(2, count);
  }

  if (viewport < 720) {
    return count <= 2 ? count : 3;
  }

  if (viewport < 760) {
    return Math.min(3, count);
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
  const gap = viewport < 720 ? 16 : 28;
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

  const phoneSpread = viewport < 760 && safeCount >= 13;

  if (phoneSpread) {
    min = 84;
    max = Math.min(max, 128);
    ideal = Math.min(ideal, max);
  }

  let cols = Math.min(preferredColumns(safeCount, viewport), safeCount);
  const sizeFloor = phoneSpread ? 84 : 88;

  const used = (columns: number, size: number) =>
    columns * size + Math.max(0, columns - 1) * gap;

  if (used(cols, ideal) > available) {
    const shrunk = Math.floor((available - Math.max(0, cols - 1) * gap) / cols);

    if (shrunk >= min) {
      ideal = shrunk;
    } else {
      cols = Math.max(1, Math.min(safeCount, Math.floor((available + gap) / (min + gap))));
      ideal = Math.floor((available - Math.max(0, cols - 1) * gap) / cols);
      ideal = Math.min(max, Math.max(sizeFloor, ideal));
    }
  }

  ideal = Math.min(max, Math.max(sizeFloor, ideal));

  if (used(cols, ideal) > available && cols > 1) {
    cols -= 1;
    ideal = Math.min(
      max,
      Math.max(sizeFloor, Math.floor((available - Math.max(0, cols - 1) * gap) / cols)),
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

/** 每一排自己一條弧：左傾、正中、右傾，換排就從頭再來 */
function rowArc(index: number) {
  const count = cards.value.length;
  const cols = Math.max(1, spreadLayout.value.cols);
  const rowStart = Math.floor(index / cols) * cols;
  const rowCount = Math.min(cols, Math.max(0, count - rowStart));
  const place = index - rowStart;

  if (rowCount <= 1) {
    return { tilt: "0deg", drop: "0px" };
  }

  const along = (place / (rowCount - 1)) * 2 - 1;
  const tilt = Math.round(along * 28) / 10;
  const drop = Math.round(along * along * 14);

  return { tilt: `${tilt}deg`, drop: `${drop}px` };
}

function cardMotionStyle(index: number) {
  const offset = offsets.value[index];
  const jitterX = ((index % 5) - 2) * 1.5;
  const jitterY = ((index % 3) - 1) * 1.6;
  const spin = ((index % 5) - 2) * 0.85;
  const fromX = offset ? offset.x + jitterX : 0;
  const fromY = offset ? offset.y + jitterY : 0;
  const arc = rowArc(index);

  return {
    "--from-x": `${fromX}px`,
    "--from-y": `${fromY}px`,
    "--spin": `${spin}deg`,
    "--stagger": `${index * STAGGER_MS}ms`,
    "--z": String(Math.max(cards.value.length - index, 1)),
    "--rest-tilt": arc.tilt,
    "--rest-drop": arc.drop,
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
  entering.value = [];
  applyLayout();
}

function scheduleEntering(count: number, token: number) {
  const groups = new Map<number, number[]>();

  for (let index = 0; index < count; index += 1) {
    const delay = index * STAGGER_MS;
    const bucket = groups.get(delay);

    if (bucket) {
      bucket.push(index);
    } else {
      groups.set(delay, [index]);
    }
  }

  for (const [delay, indices] of groups) {
    const apply = () => {
      if (!alive || token !== drawId.value) {
        return;
      }

      const next = entering.value.slice();

      for (const index of indices) {
        next[index] = true;
      }

      entering.value = next;
    };

    if (delay === 0) {
      apply();
    } else {
      later(apply, delay);
    }
  }
}

function measureOffsets(list: HTMLElement) {
  const centerX = list.clientWidth / 2;
  const centerY = list.clientHeight / 2;
  const nodes = list.querySelectorAll<HTMLElement>(":scope > .tarot-card-row > .tarot-card");

  return Array.from(nodes).map((node) => ({
    x: centerX - (node.offsetLeft + node.offsetWidth / 2),
    y: centerY - (node.offsetTop + node.offsetHeight / 2),
  }));
}

function visibleHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

/** 手機與平板的捲動根節點不一定是 window，兩邊都寫一次 */
function scrollPageTo(top: number) {
  const y = Math.max(0, top);
  const root = document.scrollingElement ?? document.documentElement;

  root.scrollTop = y;
  document.documentElement.scrollTop = y;
  document.body.scrollTop = y;
  window.scrollTo(0, y);
}

/** 牌陣比可見畫面高時，把幾何中心捲進畫面，牌堆才看得到 */
function bringSpreadIntoView(list: HTMLElement) {
  const rect = list.getBoundingClientRect();
  const view = visibleHeight();
  const fullyVisible = rect.height <= view * 0.92 && rect.top >= 8 && rect.bottom <= view - 8;

  if (fullyVisible) {
    return;
  }

  const root = document.scrollingElement ?? document.documentElement;
  const top = root.scrollTop + rect.top + rect.height / 2 - view / 2;
  scrollPageTo(top);
}

function scheduleBringSpreadIntoView(token: number) {
  const run = () => {
    if (!alive || token !== drawId.value) {
      return;
    }

    const list = listRef.value;

    if (list) {
      bringSpreadIntoView(list);
    }
  };

  run();
  requestAnimationFrame(() => {
    run();
    later(run, 120);
  });
}

function onCardAnimationEnd(event: AnimationEvent, index: number) {
  if (event.target !== event.currentTarget) {
    return;
  }

  if (!event.animationName.includes("deal-fly")) {
    return;
  }

  if (entering.value[index]) {
    const nextEntering = entering.value.slice();
    nextEntering[index] = false;
    entering.value = nextEntering;
  }

  if (settled.value[index]) {
    return;
  }

  const next = settled.value.slice();
  next[index] = true;
  settled.value = next;
}

async function startDeal(count: number, reducedMotion: boolean) {
  const drawn = draw(availableCards.value, count);

  clearTimers();
  offsets.value = [];
  settled.value = [];
  entering.value = [];
  useDealDelay.value = !reducedMotion;
  spreadLayout.value = computeSpread(count, listWidth(), viewportWidth());

  if (reducedMotion) {
    faceDown.value = false;
    drawId.value += 1;
    const token = drawId.value;
    cards.value = commitDraw(drawn);
    finishRitual();
    await nextTick();
    await nextFrame();
    scheduleBringSpreadIntoView(token);
    return;
  }

  faceDown.value = true;
  dealPhase.value = "pending";
  drawId.value += 1;
  const token = drawId.value;
  cards.value = commitDraw(drawn);

  await nextTick();
  await nextFrame();

  if (!alive || token !== drawId.value) {
    return;
  }

  const list = listRef.value;

  if (list) {
    scheduleBringSpreadIntoView(token);
    offsets.value = measureOffsets(list);
  }

  dealPhase.value = "gathering";
  entering.value = Array.from({ length: count }, () => true);

  later(() => {
    if (!alive || token !== drawId.value) {
      return;
    }

    faceDown.value = false;
    dealPhase.value = "flying";
    entering.value = Array.from({ length: count }, () => false);
    scheduleEntering(count, token);

    later(() => {
      if (!alive || token !== drawId.value) {
        return;
      }

      finishRitual();
    }, (count - 1) * STAGGER_MS + FLY_MS + 40);
  }, GATHER_MS);
}

function withOrientation(drawn: TarotCardData[]) {
  return drawn.map((card) => ({
    ...card,
    reversed: Math.random() < 0.5,
  }));
}

function commitDraw(drawn: TarotCardData[]) {
  const oriented = withOrientation(drawn);

  historyStore.recordDraw(
    oriented.map((card) => ({
      cardId: card.cardId,
      cardName: card.cardName,
      reversed: Boolean(card.reversed),
    })),
  );

  return oriented;
}

function formatReading(drawn: TarotCardData[]) {
  return drawn
    .map((card) => `${card.cardName}${card.reversed ? "逆位" : "正位"}`)
    .join("\n");
}

async function copyResult() {
  const drawn = cards.value.filter((card): card is TarotCardData => card !== null);

  if (drawn.length === 0) {
    toast.warning("請先抽牌");
    return;
  }

  try {
    await navigator.clipboard.writeText(formatReading(drawn));
    toast.success("已複製抽牌結果");
  } catch {
    toast.error("複製失敗，請再試一次");
  }
}

function beginRitual() {
  if (isRitual.value) {
    return;
  }

  const count = Math.min(maxDrawCount.value, Math.max(MIN_DRAW_COUNT, drawCount.value));
  const reducedMotion =
    skipMotion.value || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        <header class="tarot-heading">
          <p class="tarot-heading-en">Tarot Compass</p>
          <h1 class="tarot-heading-title">塔羅羅盤</h1>
          <p class="tarot-heading-note">在心中默念你想知道的事，準備好後按下抽牌</p>
        </header>

        <PageOrnament />

        <section
          class="tarot-board"
          :class="{ 'is-ritual': isRitual, 'is-dealing': isDealing }"
          aria-label="塔羅牌陣"
        >
          <div class="tarot-board-glow" aria-hidden="true" />
          <div class="tarot-board-glow tarot-board-glow-ritual" aria-hidden="true" />
          <TarotBoardPattern />

          <DrawControls
            v-model="drawCount"
            v-model:deck-type="deckType"
            v-model:skip-motion="skipMotion"
            :min="MIN_DRAW_COUNT"
            :max="maxDrawCount"
            :disabled="isRitual"
            :can-copy="hasReading"
            @draw="beginRitual"
            @copy="copyResult"
          >
            <div
              ref="listRef"
              class="tarot-card-list"
              :style="gridStyle"
              :data-cols="spreadLayout.cols"
              :data-card-size="spreadLayout.cardSize"
              :data-deal="dealPhase"
            >
              <div
                v-for="(row, rowIndex) in cardRows"
                :key="`${drawId}-row-${rowIndex}`"
                class="tarot-card-row"
              >
                <div
                  v-for="entry in row"
                  :key="`${drawId}-${entry.index}`"
                  class="tarot-card"
                  :class="{
                    'is-pending': dealPhase === 'pending',
                    'is-gathering': dealPhase === 'gathering',
                    'is-flying': dealPhase === 'flying' && !settled[entry.index],
                    'is-settled': dealPhase === 'flying' && settled[entry.index],
                    'is-entering': entering[entry.index],
                  }"
                  :style="cardMotionStyle(entry.index)"
                  @animationend="onCardAnimationEnd($event, entry.index)"
                >
                  <TarotCard
                    :card="entry.card"
                    :face-down="faceDown"
                    :reveal-delay="revealDelayFor(entry.index)"
                    :skip-motion="skipMotion"
                  />
                </div>
              </div>
            </div>
          </DrawControls>
        </section>

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
  --tarot-gold-dim: #8f7346;
  --tarot-gold: #d2ae66;
  --tarot-gold-light: #e7c376;
  --tarot-gold-bright: #f4e3b2;

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
  min-width: 0;
  min-height: 100svh;
  flex-direction: column;
  align-items: stretch;
  color: var(--tarot-text);
  background:
    radial-gradient(ellipse at 50% 38%, rgb(90 48 140 / 0.07), transparent 46%),
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
  width: 100%;
  max-width: 76rem;
  min-width: 0;
  margin-inline: auto;
  flex-direction: column;
  align-items: center;
  margin-block: 0;
  gap: 0.55rem;
}

.tarot-heading {
  display: flex;
  width: 100%;
  max-width: 36rem;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  margin-bottom: 0.15rem;
  text-align: center;
}

.tarot-heading-en {
  margin: 0;
  color: color-mix(in srgb, var(--tarot-gold) 72%, transparent);
  font-size: calc(0.72rem + 2px);
  font-weight: 500;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  text-transform: uppercase;
}

.tarot-heading-title {
  margin: 0;
  background: linear-gradient(180deg, var(--tarot-gold-bright) 0%, var(--tarot-gold) 58%, var(--tarot-gold-dim) 100%);
  background-clip: text;
  color: transparent;
  font-size: clamp(calc(1.85rem + 2px), calc(3.4vw + 2px), calc(2.45rem + 2px));
  font-weight: 600;
  letter-spacing: 0.28em;
  line-height: 1.2;
  text-indent: 0.28em;
}

.tarot-heading-note {
  width: min(28rem, calc(100vw - 4.5rem));
  max-width: 100%;
  min-width: 0;
  margin: 0.35rem 0 0;
  color: var(--text-muted);
  font-size: calc(0.92rem + 2px);
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 1.6;
  text-wrap: balance;
}

.tarot-board {
  position: relative;
  isolation: isolate;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-inline: auto;
  margin-bottom: 0;
  overflow: visible;
  padding: 1.5rem 1.65rem 1.45rem;
  border: 1px solid rgb(210 174 102 / 0.32);
  border-radius: 22px;
  background:
    radial-gradient(circle at 50% 35%, rgb(132 84 180 / 0.14), transparent 55%),
    rgb(16 8 27 / 0.48);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.04),
    0 30px 80px rgb(0 0 0 / 0.28);
  backdrop-filter: blur(10px);
}

.tarot-board-glow {
  position: absolute;
  top: 42%;
  left: 50%;
  z-index: 0;
  width: min(900px, 140%);
  height: 420px;
  background: radial-gradient(
    ellipse,
    rgb(122 72 167 / 0.16),
    rgb(83 47 122 / 0.06) 45%,
    transparent 72%
  );
  filter: blur(30px);
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
  display: flex;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  row-gap: clamp(1.35rem, 2vw, 2.15rem);
}

.tarot-card-row {
  display: flex;
  max-width: 100%;
  align-items: flex-start;
  justify-content: center;
  column-gap: var(--spread-gap, 26px);
}

.tarot-card {
  --rest-tilt: 0deg;
  --rest-drop: 0px;

  position: relative;
  z-index: 1;
  will-change: auto;
  display: flex;
  width: var(--card-size, 158px);
  max-width: 100%;
  min-width: 0;
  flex: 0 0 var(--card-size, 158px);
  justify-content: center;
  margin-top: var(--rest-drop);
  transform: rotate(var(--rest-tilt));
  transform-origin: center 86%;
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

.tarot-card.is-entering {
  will-change: transform, opacity;
}

.tarot-card.is-settled {
  z-index: 1;
  opacity: 1;
  animation: none;
  transform: rotate(var(--rest-tilt));
  will-change: auto;
}

.tarot-board.is-dealing .tarot-card {
  pointer-events: none;
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
    transform: translate3d(0, 0, 0) scale(1) rotate(var(--rest-tilt, 0deg));
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
    transform: rotate(var(--rest-tilt, 0deg));
    transition: none;
  }
}
</style>
