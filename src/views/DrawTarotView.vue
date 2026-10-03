<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { PhCircle, PhStarOfDavid } from "@phosphor-icons/vue";
import { CircleAlert } from "@lucide/vue";

import DrawButton from "@/components/DrawButton.vue";
import TarotCard from "@/components/TarotCard.vue";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useTarotDeck,
  type TarotCard as TarotCardData,
} from "@/composables/useTarotDeck";

/** 最少允許抽取的牌數 */
const MIN_COUNT = 1;

/** 預設抽取與初始顯示的牌數 */
const DEFAULT_COUNT = 5;

/** 抽牌張數可能出現的驗證錯誤 */
type CountError = "invalid" | "tooFew" | "tooMany";

/** 取得塔羅牌組資料與抽牌功能 */
const { backCard, deckSize, draw } = useTarotDeck();

/** 使用者目前輸入的抽牌張數 */
const countInput = ref(String(DEFAULT_COUNT));

/** 目前的張數輸入錯誤，沒有錯誤時為 null */
const countError = ref<CountError | null>(null);

/**
 * 每次實際抽牌時遞增。
 * 用於改變 TarotCard 的 key，
 * 讓卡片重新建立並重新播放抽牌／翻牌動畫。
 */
const drawId = ref(0);

/** 畫面目前顯示的塔羅牌 */
const cards = ref<TarotCardData[]>(createBackCards(DEFAULT_COUNT));

/**
 * 根據目前錯誤類型產生提示視窗內容。
 * 沒有錯誤時回傳 null，不顯示 Alert。
 */
const alertCopy = computed(() => {
  if (!countError.value) {
    return null;
  }

  const messages: Record<
    CountError,
    {
      title: string;
      description: string;
    }
  > = {
    invalid: {
      title: "無法解讀",
      description: "請輸入整數張數。",
    },

    tooFew: {
      title: "數量太少",
      description: `至少抽出 ${MIN_COUNT} 張牌。`,
    },

    tooMany: {
      title: "數量超過",
      description: `牌組共 ${deckSize} 張，請輸入 ${MIN_COUNT} 到 ${deckSize}。`,
    },
  };

  return messages[countError.value];
});

/**
 * 建立指定數量的牌背。
 * 用於頁面初始化與重新同步牌陣。
 */
function createBackCards(count: number): TarotCardData[] {
  return Array.from({ length: count }, () => backCard);
}

/**
 * 將使用者輸入轉換成有效的抽牌張數。
 *
 * 驗證規則：
 * 1. 不可為空白
 * 2. 必須為整數
 * 3. 不可小於最少抽牌張數
 * 4. 不可超過牌組總張數
 */
function parseCount(
  raw: string,
): { ok: true; value: number } | { ok: false; error: CountError } {
  const trimmed = raw.trim();

  // 空白輸入視為張數不足
  if (!trimmed) {
    return {
      ok: false,
      error: "tooFew",
    };
  }

  const value = Number(trimmed);

  // 排除文字、小數、NaN 等非整數內容
  if (!Number.isInteger(value)) {
    return {
      ok: false,
      error: "invalid",
    };
  }

  if (value < MIN_COUNT) {
    return {
      ok: false,
      error: "tooFew",
    };
  }

  if (value > deckSize) {
    return {
      ok: false,
      error: "tooMany",
    };
  }

  return {
    ok: true,
    value,
  };
}

/**
 * 驗證目前輸入的抽牌張數。
 *
 * 驗證失敗：
 * - 設定錯誤狀態
 * - 回傳 null
 *
 * 驗證成功：
 * - 清除錯誤狀態
 * - 統一輸入格式
 * - 回傳有效張數
 */
function validateCount(): number | null {
  const result = parseCount(countInput.value);

  if (!result.ok) {
    countError.value = result.error;
    return null;
  }

  countError.value = null;
  countInput.value = String(result.value);

  return result.value;
}

/**
 * 將目前牌陣重設成指定數量的牌背。
 */
function syncSpread(count: number) {
  cards.value = createBackCards(count);
}

/**
 * 抽牌張數輸入框失去焦點時執行。
 *
 * 若下一個焦點是按鈕，
 * 代表使用者可能正在直接按「抽牌」，
 * 此時交由 drawCards 處理，避免重複更新畫面。
 */
function onCountBlur(event: FocusEvent) {
  const nextElement = event.relatedTarget;

  if (nextElement instanceof Element && nextElement.closest("button")) {
    return;
  }

  const count = validateCount();

  if (count === null) {
    return;
  }

  // 張數真的有改變時才重新產生牌背
  if (cards.value.length !== count) {
    syncSpread(count);
  }
}

/**
 * 執行抽牌。
 *
 * 先驗證張數，
 * 驗證成功後再從牌組抽出指定數量的牌。
 */
function drawCards() {
  const count = validateCount();

  if (count === null) {
    return;
  }

  // 更新 key，讓 TarotCard 元件重新建立並播放動畫
  drawId.value++;

  cards.value = draw(count);
}

/** 關閉錯誤提示視窗 */
function closeAlert() {
  countError.value = null;
}

/**
 * 全域鍵盤事件。
 * 當錯誤提示開啟時，可以按 Escape 關閉。
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && countError.value) {
    closeAlert();
  }
}

/** 元件載入後註冊鍵盤事件 */
onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

/** 元件卸載時移除事件，避免監聽器殘留 */
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <main class="oracle-page">
    <!-- 塔羅牌陣區域 -->
    <section class="spread-board" aria-label="塔羅牌陣">
      <PhCircle
        class="spread-ring spread-ring-outer"
        weight="thin"
        aria-hidden="true"
      />
      <PhCircle
        class="spread-ring spread-ring-inner"
        weight="thin"
        aria-hidden="true"
      />
      <PhStarOfDavid class="spread-sigil" weight="thin" aria-hidden="true" />

      <div class="spread-grid">
        <div
          v-for="(card, index) in cards"
          :key="`${drawId}-${index}`"
          class="spread-cell"
        >
          <TarotCard :card="card" />
        </div>
      </div>
    </section>

    <!-- 抽牌控制區 -->
    <form class="oracle-controls" @submit.prevent="drawCards">
      <!-- 抽牌張數輸入 -->
      <label class="count-field" for="card-count">
        <span class="count-label"> 抽牌數量 </span>

        <Input
          id="card-count"
          v-model="countInput"
          inputmode="numeric"
          autocomplete="off"
          :placeholder="`${MIN_COUNT}–${deckSize}`"
          :aria-invalid="countError ? true : undefined"
          @blur="onCountBlur"
        />
      </label>

      <!-- 抽牌按鈕 -->
      <DrawButton @draw="drawCards" />
    </form>

    <!-- 張數輸入錯誤提示 -->
    <div
      v-if="alertCopy"
      class="alert-overlay"
      role="presentation"
      @click.self="closeAlert"
    >
      <Alert variant="destructive" aria-labelledby="count-alert-title">
        <CircleAlert />

        <AlertTitle id="count-alert-title">
          {{ alertCopy.title }}
        </AlertTitle>

        <AlertDescription>
          {{ alertCopy.description }}
        </AlertDescription>

        <Button
          type="button"
          class="alert-close col-span-2 mt-3 justify-self-center"
          @click="closeAlert"
        >
          知道了
        </Button>
      </Alert>
    </div>
  </main>
</template>

<style scoped>
.oracle-page {
  display: flex;
  min-height: 100svh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  padding: 2.5rem 1.25rem 3rem;
  color: #fffaf7;
  background:
    radial-gradient(1px 1px at 12% 18%, rgb(255 255 255 / 0.7), transparent),
    radial-gradient(
      1.2px 1.2px at 78% 12%,
      rgb(255 236 190 / 0.8),
      transparent
    ),
    radial-gradient(1px 1px at 64% 72%, rgb(255 255 255 / 0.45), transparent),
    radial-gradient(1px 1px at 28% 80%, rgb(214 186 255 / 0.7), transparent),
    radial-gradient(
      ellipse at 50% -10%,
      rgb(146 92 214 / 0.45),
      transparent 46%
    ),
    linear-gradient(180deg, #1a0d33 0%, #12091f 48%, #090612 100%);
}

/* 塔羅牌陣地墊：絲絨布面、金線鑲邊、中央占卜圓 */
.spread-board {
  position: relative;
  isolation: isolate;
  width: min(100%, 76rem);
  padding: 2.35rem 1.85rem 2.6rem;
  border-radius: 0.85rem;
  background-color: #3a1834;
  background-image:
    radial-gradient(
      ellipse 78% 62% at 50% 46%,
      rgb(122 42 72 / 0.42),
      transparent 70%
    ),
    radial-gradient(
      90% 55% at 22% 0%,
      rgb(255 228 196 / 0.1),
      transparent 46%
    ),
    repeating-linear-gradient(
      118deg,
      rgb(255 244 220 / 0.035) 0 1px,
      transparent 1px 3px
    ),
    linear-gradient(168deg, #6a3048 0%, #4a2044 36%, #2c142e 100%);
  box-shadow:
    inset 0 0 0 1px rgb(244 214 150 / 0.72),
    inset 0 0 0 0.7rem #1b0c20,
    inset 0 0 0 calc(0.7rem + 1px) rgb(244 214 150 / 0.42),
    inset 0 18px 28px rgb(255 220 180 / 0.05),
    0 2px 0 rgb(90 36 58 / 0.8),
    0 22px 46px rgb(4 1 12 / 0.48);
}

.spread-ring {
  position: absolute;
  z-index: 0;
  top: 46%;
  left: 50%;
  translate: -50% -50%;
  color: rgb(244 214 150 / 0.32);
  pointer-events: none;
}

.spread-ring-outer {
  width: min(18rem, 46%);
  height: min(18rem, 46%);
}

.spread-ring-inner {
  width: min(12.5rem, 32%);
  height: min(12.5rem, 32%);
  color: rgb(244 214 150 / 0.22);
}

.spread-sigil {
  position: absolute;
  z-index: 0;
  top: 46%;
  left: 50%;
  width: min(8.75rem, 24%);
  height: min(8.75rem, 24%);
  translate: -50% -50%;
  color: rgb(244 214 150 / 0.55);
  pointer-events: none;
}

/* 卡牌排列區：每列以置中為主，最後一列不足時也置中 */
.spread-grid {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem 1.15rem;
}

/* 單張卡牌容器 */
.spread-cell {
  display: flex;
  width: 11.5rem;
  justify-content: center;
}

/* 抽牌控制區 */
.oracle-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  gap: 1rem 1.25rem;
}

/* 張數輸入區 */
.count-field {
  display: flex;
  width: min(100%, 11rem);
  flex-direction: column;
  gap: 0.45rem;
}

.count-label {
  padding-left: 0.35rem;
  color: #f3e7ff;
  font-size: max(12px, 1rem);
  letter-spacing: 0.22em;
}

/* shadcn Input 樣式 */
.count-field :deep([data-slot="input"]) {
  width: 11rem;
  height: 2.75rem;
  border-radius: 9999px;
  border-color: rgb(255 255 255 / 0.28);
  background: rgb(42 22 72 / 0.8);
  padding-inline: 1rem;
  color: #fffaf7;
  font-size: max(12px, 1rem);
  text-align: center;
  letter-spacing: 0.2em;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.2),
    0 8px 24px rgb(48 18 92 / 0.28);
}

.count-field :deep([data-slot="input"])::placeholder {
  color: rgb(216 196 240 / 0.65);
}

.count-field :deep([data-slot="input"]:focus-visible) {
  border-color: #f0d9ff;
  outline: none;
  box-shadow:
    0 0 0 3px rgb(201 160 255 / 0.45),
    inset 0 1px 0 rgb(255 255 255 / 0.2);
}

/* 張數輸入錯誤狀態 */
.count-field :deep([data-slot="input"][aria-invalid="true"]) {
  border-color: #ffc1d0;
  box-shadow: 0 0 0 3px rgb(255 142 174 / 0.35);
}

/* 錯誤提示背景遮罩 */
.alert-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgb(8 4 18 / 0.62);
  backdrop-filter: blur(8px);
}

/* Alert 主體 */
.alert-overlay :deep([data-slot="alert"]) {
  width: min(100%, 26rem);
  border-color: rgb(255 208 220 / 0.4);
  border-radius: 1.5rem;
  color: #fff7f8;
  font-size: max(12px, 1rem);
  background:
    radial-gradient(
      120% 90% at 100% 0%,
      rgb(255 186 206 / 0.2),
      transparent 46%
    ),
    linear-gradient(160deg, #7a3d78 0%, #54245e 48%, #311446 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.22),
    0 24px 60px rgb(18 6 40 / 0.45);
  animation: alert-bounce 0.55s cubic-bezier(0.2, 0.85, 0.25, 1);
}

.alert-overlay :deep([data-slot="alert"] svg) {
  color: #ffd0dc;
}

.alert-overlay :deep([data-slot="alert-title"]) {
  color: #fff7f8;
  font-size: max(12px, 1.125rem);
}

.alert-overlay :deep([data-slot="alert-description"]) {
  color: #ffe4ea;
  font-size: max(12px, 1rem);
}

/* Alert 出現動畫 */
@keyframes alert-bounce {
  0% {
    opacity: 0;
    transform: translateY(1rem) scale(0.86);
  }

  58% {
    opacity: 1;
    transform: translateY(-0.4rem) scale(1.045);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 使用者關閉動畫時停用 Alert 動畫 */
@media (prefers-reduced-motion: reduce) {
  .alert-overlay :deep([data-slot="alert"]) {
    animation: none;
  }
}

/* Alert 關閉按鈕 */
.alert-close {
  height: 2.25rem;
  border: 1px solid rgb(255 255 255 / 0.28);
  border-radius: 9999px;
  background: linear-gradient(135deg, #8055c2 0%, #4d2888 100%);
  color: #fffaf7;
  font-size: max(12px, 1rem);
  letter-spacing: 0.16em;
}

.alert-close:hover {
  filter: brightness(1.08);
}
</style>
