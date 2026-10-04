<script setup lang="ts">
import { nextTick, ref } from "vue";
import { Sparkle } from "@lucide/vue";
import { Button } from "@/components/ui/button";

const emit = defineEmits<{
  click: [];
}>();

const isCasting = ref(false);

/** 點擊時由星星向外散開的一次爆光，不循環 */
const burstRays = [
  { x: "0px", y: "-22px", star: true },
  { x: "18px", y: "-12px", star: false },
  { x: "20px", y: "6px", star: true },
  { x: "10px", y: "18px", star: false },
  { x: "-12px", y: "18px", star: true },
  { x: "-20px", y: "4px", star: false },
  { x: "-18px", y: "-12px", star: true },
  { x: "0px", y: "20px", star: false },
];

async function handleClick() {
  isCasting.value = false;
  await nextTick();

  isCasting.value = true;
  emit("click");
}

function handleAnimationEnd(event: AnimationEvent) {
  const target = event.target;

  if (!(target instanceof Element) || !target.matches("i:last-child")) {
    return;
  }

  isCasting.value = false;
}
</script>

<template>
  <Button
    class="draw-button"
    :class="{ 'is-casting': isCasting }"
    variant="ghost"
    type="button"
    @click="handleClick"
  >
    <span class="draw-button-icon" aria-hidden="true">
      <Sparkle class="draw-star" :stroke-width="1.4" />

      <span class="draw-burst" @animationend="handleAnimationEnd">
        <i
          v-for="(ray, index) in burstRays"
          :key="index"
          :class="{ 'is-star': ray.star }"
          :style="{ '--x': ray.x, '--y': ray.y }"
        />
      </span>
    </span>

    <span class="draw-label">開始抽牌</span>
  </Button>
</template>

<style scoped>
.draw-button {
  position: relative;
  isolation: isolate;
  height: 48px;
  min-width: 11.5rem;
  padding: 0 1.55rem 0 2.7rem;
  overflow: hidden;
  border: 1px solid rgb(231 195 118 / 0.65);
  border-radius: 9999px;
  color: var(--tarot-gold-light);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  background: linear-gradient(110deg, rgb(74 42 85 / 0.95), rgb(43 25 55 / 0.96));
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.08),
    0 8px 30px rgb(0 0 0 / 0.3),
    0 0 20px rgb(211 168 92 / 0.08);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease;
}

.draw-button::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    100deg,
    transparent 34%,
    rgb(244 227 178 / 0.16) 50%,
    transparent 66%
  );
  pointer-events: none;
  transform: translateX(-130%);
}

.draw-button:hover,
.draw-button:focus-visible {
  border-color: rgb(244 227 178 / 0.9);
  color: var(--tarot-gold-bright);
  background: linear-gradient(110deg, rgb(86 48 98 / 0.98), rgb(48 28 62 / 0.98));
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.1),
    0 10px 35px rgb(0 0 0 / 0.35),
    0 0 28px rgb(218 177 95 / 0.22);
}

.draw-button:hover::after,
.draw-button:focus-visible::after {
  animation: gold-sweep 0.95s ease;
}

.draw-button:focus-visible {
  outline: none;
}

.draw-button:active {
  transform: translateY(0) scale(0.98);
}

.draw-button-icon {
  position: absolute;
  top: 50%;
  left: 1.05rem;
  z-index: 2;
  display: inline-flex;
  width: 1.3rem;
  height: 1.3rem;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
}

.draw-star {
  width: 1.3rem;
  height: 1.3rem;
  fill: var(--tarot-gold-bright);
  color: var(--tarot-gold-bright);
}

.draw-label {
  position: relative;
  z-index: 2;
  margin-right: -0.22em;
}

.draw-burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.draw-burst i {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 3px;
  margin: -1.5px 0 0 -1.5px;
  border-radius: 50%;
  background: var(--tarot-gold-bright);
  opacity: 0;
}

.draw-burst i.is-star {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border-radius: 0;
  clip-path: polygon(
    50% 0,
    62% 38%,
    100% 50%,
    62% 62%,
    50% 100%,
    38% 62%,
    0 50%,
    38% 38%
  );
}

.draw-button.is-casting {
  animation: click-pulse 0.55s ease-out;
}

.draw-button.is-casting .draw-star {
  animation: star-pop 0.55s ease-out;
}

.draw-button.is-casting .draw-burst i {
  animation: spark-burst 0.65s ease-out forwards;
}

@keyframes gold-sweep {
  from {
    transform: translateX(-130%);
  }

  to {
    transform: translateX(130%);
  }
}

@keyframes click-pulse {
  0% {
    transform: scale(0.98);
  }

  45% {
    transform: scale(1.015);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes star-pop {
  0% {
    transform: scale(0.8) rotate(-18deg);
    opacity: 0.4;
  }

  45% {
    transform: scale(1.25) rotate(16deg);
    opacity: 1;
  }

  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes spark-burst {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.4) rotate(0deg);
  }

  30% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate(var(--x), var(--y)) scale(1) rotate(36deg);
  }
}

@media (max-width: 760px) {
  .draw-button {
    width: 100%;
    min-width: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .draw-button,
  .draw-button::after,
  .draw-button.is-casting,
  .draw-button.is-casting .draw-star,
  .draw-button.is-casting .draw-burst i {
    animation: none;
    transition: none;
  }

  .draw-button:hover,
  .draw-button:focus-visible,
  .draw-button:active {
    transform: none;
  }
}
</style>
