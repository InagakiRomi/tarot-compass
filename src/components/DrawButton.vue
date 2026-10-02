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
  // 重置抽牌狀態
  isCasting.value = false;

  // 等待下一個任務執行完畢
  await nextTick();

  // 開始抽牌
  requestAnimationFrame(() => {
    isCasting.value = true;
  });

  // 觸發抽牌事件
  emit("draw");
}

/** 抽牌動畫結束 */
function handleAnimationEnd() {
  // 重置抽牌狀態
  isCasting.value = false;
}
</script>

<template>
  <Button
    class="draw-button rounded-full focus-visible:border-transparent focus-visible:ring-0"
    :class="{ 'is-casting': isCasting }"
    size="lg"
    @click="handleDraw"
  >
    <span class="draw-star-wrap" aria-hidden="true">
      <Sparkle class="draw-star size-5" :stroke-width="1.4" />
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
.draw-button {
  --draw-purple-light: #8055c2;
  --draw-purple: #6840aa;
  --draw-purple-dark: #4d2888;
  --draw-purple-deep: #37196d;

  --draw-text: #fffaf7;
  --draw-gold: #ffe6aa;
  --draw-glow: rgb(195 146 255 / 0.3);

  position: relative;
  isolation: isolate;

  height: 3.75rem;
  min-width: 15.5rem;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  border: 1px solid rgb(255 255 255 / 0.28);
  border-radius: 999px;

  padding-inline: 2.75rem;

  color: var(--draw-text);

  font-size: 1.25rem;
  font-weight: 650;
  letter-spacing: 0.22em;

  background:
    radial-gradient(
      90% 160% at 12% -30%,
      rgb(255 255 255 / 0.22),
      transparent 46%
    ),
    radial-gradient(90% 140% at 90% 120%, var(--draw-glow), transparent 52%),
    linear-gradient(
      135deg,
      var(--draw-purple-light) 0%,
      var(--draw-purple) 42%,
      var(--draw-purple-dark) 72%,
      var(--draw-purple-deep) 100%
    );

  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.24),
    inset 0 -10px 24px rgb(37 12 73 / 0.18),
    0 8px 24px rgb(85 46 140 / 0.24);

  transition:
    transform 0.22s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease,
    filter 0.3s ease;
}

.draw-button::before {
  content: "";

  position: absolute;

  width: 46%;
  height: 180%;

  top: -40%;
  left: -12%;

  z-index: 1;

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

.draw-button:hover,
.draw-button:focus-visible {
  transform: translateY(-2px);

  border-color: rgb(255 238 200 / 0.42);

  filter: brightness(1.06) saturate(1.05);

  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.28),
    0 0 0 1px rgb(219 183 255 / 0.12),
    0 0 20px rgb(174 118 235 / 0.28),
    0 12px 30px rgb(77 39 128 / 0.3);
}

.draw-button:hover::before,
.draw-button:focus-visible::before {
  left: 72%;

  transform: rotate(18deg);
}

.draw-button:focus-visible {
  outline: none;
}

.draw-button:active {
  transform: translateY(0) scale(0.975);

  filter: brightness(1.03);

  box-shadow:
    inset 0 3px 12px rgb(48 16 86 / 0.28),
    0 4px 12px rgb(77 39 128 / 0.2);
}

.draw-button.is-casting {
  animation: click-pulse 0.5s ease-out;
}

.draw-star-wrap {
  position: absolute;

  left: 1.45rem;
  top: 50%;

  z-index: 3;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  transform: translateY(-50%);

  animation: star-float 4s ease-in-out infinite;
}

.draw-star {
  width: 1.3rem;
  height: 1.3rem;

  fill: #fff1c9;
  color: var(--draw-gold);

  filter: drop-shadow(0 0 5px rgb(255 239 190 / 0.72))
    drop-shadow(0 0 12px rgb(213 168 255 / 0.4));

  transition:
    transform 0.3s ease,
    filter 0.3s ease;
}

.draw-button:hover .draw-star,
.draw-button:focus-visible .draw-star {
  transform: rotate(12deg) scale(1.12);

  filter: drop-shadow(0 0 6px #fff4d1)
    drop-shadow(0 0 14px rgb(231 193 255 / 0.75));
}

.draw-label {
  position: relative;

  z-index: 3;

  margin-right: -0.22em;

  text-shadow:
    0 1px 2px rgb(45 20 75 / 0.45),
    0 0 12px rgb(255 255 255 / 0.08);
}

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

.draw-button.is-casting .draw-burst {
  animation: click-burst 0.55s ease-out;
}

.draw-button.is-casting .draw-star {
  animation: star-pop 0.55s ease-out;
}

@keyframes star-float {
  0%,
  100% {
    transform: translateY(-50%) translate(0, 0) rotate(0deg);
  }

  50% {
    transform: translateY(-50%) translate(0.08rem, -0.12rem) rotate(4deg);
  }
}

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

@media (prefers-reduced-motion: reduce) {
  .draw-button,
  .draw-button::after,
  .draw-star-wrap,
  .draw-button.is-casting,
  .draw-button.is-casting .draw-burst,
  .draw-button.is-casting .draw-star {
    animation: none;
  }

  .draw-button:hover,
  .draw-button:focus-visible,
  .draw-button:active {
    transform: none;
  }

  .draw-button:hover::before,
  .draw-button:focus-visible::before {
    left: -12%;
  }
}
</style>
