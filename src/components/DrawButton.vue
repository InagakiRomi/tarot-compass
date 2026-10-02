<script setup lang="ts">
import { nextTick, ref } from "vue";
import { Sparkle } from "@lucide/vue";
import { Button } from "@/components/ui/button";

// 定義抽牌事件
const emit = defineEmits<{
  draw: [];
}>();

// 是否正在抽牌
const isCasting = ref(false);

/** 抽牌 */
async function handleDraw() {
  isCasting.value = false;
  await nextTick();

  isCasting.value = true;
  emit("draw");
}

/** 抽牌動畫結束 */
function handleAnimationEnd() {
  isCasting.value = false;
}
</script>

<template>
  <Button
    class="draw-button"
    :class="{ 'is-casting': isCasting }"
    type="button"
    @click="handleDraw"
  >
    <span class="draw-star-wrap" aria-hidden="true">
      <Sparkle class="draw-star" :stroke-width="1.4" />
    </span>

    <span class="draw-label"> 抽牌 </span>

    <span
      class="draw-burst"
      aria-hidden="true"
      @animationend="handleAnimationEnd"
    />
  </Button>
</template>

<style scoped>
/* 抽牌按鈕 */
.draw-button {
  position: relative;
  isolation: isolate;

  height: 3.75rem;
  min-width: 15.5rem;
  padding: 0 2.75rem;

  overflow: hidden;

  border: 1px solid rgb(255 255 255 / 0.28);
  border-radius: 9999px;

  color: #fffaf7;
  font-size: 1.25rem;
  font-weight: 650;
  letter-spacing: 0.22em;

  background:
    radial-gradient(
      90% 160% at 12% -30%,
      rgb(255 255 255 / 0.22),
      transparent 46%
    ),
    radial-gradient(
      90% 140% at 90% 120%,
      rgb(195 146 255 / 0.3),
      transparent 52%
    ),
    linear-gradient(135deg, #8055c2 0%, #6840aa 42%, #4d2888 72%, #37196d 100%);

  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.24),
    inset 0 -10px 24px rgb(37 12 73 / 0.18),
    0 8px 24px rgb(85 46 140 / 0.24);

  transition:
    transform 0.3s ease-out,
    box-shadow 0.3s ease-out,
    border-color 0.3s ease-out,
    filter 0.3s ease-out;
}

/* 滑鼠移入與鍵盤聚焦 */
.draw-button:hover,
.draw-button:focus-visible {
  transform: translateY(-0.125rem);

  border-color: rgb(255 238 200 / 0.42);

  filter: brightness(1.06) saturate(1.05);

  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.28),
    0 0 0 1px rgb(219 183 255 / 0.12),
    0 0 20px rgb(174 118 235 / 0.28),
    0 12px 30px rgb(77 39 128 / 0.3);
}

.draw-button:focus-visible {
  outline: none;
}

/* 按下按鈕 */
.draw-button:active {
  transform: translateY(0) scale(0.975);

  filter: brightness(1.03);

  box-shadow:
    inset 0 3px 12px rgb(48 16 86 / 0.28),
    0 4px 12px rgb(77 39 128 / 0.2);
}

/* 按鈕掃光效果 */
.draw-button::before {
  content: "";

  position: absolute;
  top: -40%;
  left: -12%;
  z-index: 1;

  width: 46%;
  height: 180%;

  transform: rotate(18deg);

  background: linear-gradient(
    90deg,
    transparent,
    rgb(255 255 255 / 0.1),
    rgb(255 255 255 / 0.2),
    transparent
  );

  filter: blur(2px);

  pointer-events: none;

  transition:
    left 0.65s ease,
    transform 0.65s ease;
}

.draw-button:hover::before,
.draw-button:focus-visible::before {
  left: 72%;
}

/* 按鈕內的星空顆粒 */
.draw-button::after {
  content: "";

  position: absolute;
  inset: 0;
  z-index: 0;

  border-radius: inherit;

  background-image:
    radial-gradient(
      1.2px 1.2px at 20% 30%,
      rgb(255 255 255 / 0.7),
      transparent
    ),
    radial-gradient(1px 1px at 74% 26%, rgb(245 225 255 / 0.55), transparent),
    radial-gradient(1px 1px at 86% 66%, rgb(255 230 170 / 0.45), transparent),
    radial-gradient(
      0.8px 0.8px at 58% 74%,
      rgb(255 255 255 / 0.4),
      transparent
    ),
    radial-gradient(
      0.8px 0.8px at 43% 22%,
      rgb(255 255 255 / 0.32),
      transparent
    );

  opacity: 0.75;

  pointer-events: none;

  animation: dust-drift 7s ease-in-out infinite;
}

/* 左側星星位置 */
.draw-star-wrap {
  position: absolute;
  top: 50%;
  left: 1.45rem;
  z-index: 3;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  transform: translateY(-50%);

  animation: star-float 4s ease-in-out infinite;
}

/* 星星樣式 */
.draw-star {
  width: 1.3rem;
  height: 1.3rem;

  fill: #fff1c9;
  color: #ffe6aa;

  filter: drop-shadow(0 0 5px rgb(255 239 190 / 0.72))
    drop-shadow(0 0 12px rgb(213 168 255 / 0.4));

  transition:
    transform 0.3s ease-out,
    filter 0.3s ease-out;
}

/* Hover 時強化星星效果 */
.draw-button:hover .draw-star,
.draw-button:focus-visible .draw-star {
  transform: rotate(12deg) scale(1.12);

  filter: drop-shadow(0 0 6px #fff4d1)
    drop-shadow(0 0 14px rgb(231 193 255 / 0.75));
}

/* 抽牌文字 */
.draw-label {
  position: relative;
  z-index: 3;

  margin-right: -0.22em;

  text-shadow:
    0 1px 2px rgb(45 20 75 / 0.45),
    0 0 12px rgb(255 255 255 / 0.08);
}

/* 點擊時的爆光效果 */
.draw-burst {
  position: absolute;
  inset: 0;
  z-index: 2;

  border-radius: inherit;

  opacity: 0;

  pointer-events: none;

  background: radial-gradient(
    circle at center,
    rgb(255 245 220 / 0.38) 0%,
    rgb(205 161 255 / 0.2) 38%,
    transparent 70%
  );
}

/* 抽牌時的按鈕動畫 */
.draw-button.is-casting {
  animation: click-pulse 0.5s ease-out;
}

/* 抽牌時的爆光動畫 */
.draw-button.is-casting .draw-burst {
  animation: click-burst 0.55s ease-out;
}

/* 抽牌時的星星動畫 */
.draw-button.is-casting .draw-star {
  animation: star-pop 0.55s ease-out;
}

/* 星星漂浮動畫 */
@keyframes star-float {
  0%,
  100% {
    transform: translateY(-50%) translate(0, 0) rotate(0deg);
  }

  50% {
    transform: translateY(-50%) translate(0.08rem, -0.12rem) rotate(4deg);
  }
}

/* 按下抽牌時的彈跳效果 */
@keyframes click-pulse {
  0% {
    transform: scale(0.975);
  }

  45% {
    transform: scale(1.018);
  }

  100% {
    transform: scale(1);
  }
}

/* 點擊爆光動畫 */
@keyframes click-burst {
  0% {
    opacity: 0.7;
    transform: scale(0.72);
  }

  100% {
    opacity: 0;
    transform: scale(1.15);
  }
}

/* 星星彈出動畫 */
@keyframes star-pop {
  0% {
    transform: scale(0.85) rotate(-12deg);
  }

  45% {
    transform: scale(1.3) rotate(12deg);
  }

  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* 星空顆粒漂浮動畫 */
@keyframes dust-drift {
  0%,
  100% {
    transform: translate(0, 0);
    opacity: 0.55;
  }

  50% {
    transform: translate(-4px, 2px);
    opacity: 0.85;
  }
}

/* 使用者開啟減少動畫時停用動態效果 */
@media (prefers-reduced-motion: reduce) {
  .draw-button {
    transition: none;
  }

  .draw-button:hover,
  .draw-button:focus-visible,
  .draw-button:active {
    transform: none;
  }

  .draw-button::after,
  .draw-star-wrap,
  .draw-button.is-casting,
  .draw-button.is-casting .draw-burst,
  .draw-button.is-casting .draw-star {
    animation: none;
  }

  .draw-button:hover::before,
  .draw-button:focus-visible::before {
    left: -12%;
  }
}
</style>
