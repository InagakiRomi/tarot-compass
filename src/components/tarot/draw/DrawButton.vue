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

    <span class="draw-label">抽牌</span>
  </Button>
</template>

<style scoped>
.draw-button {
  position: relative;
  isolation: isolate;
  height: 54px;
  min-width: 15.5rem;
  padding: 0 2.75rem;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.16);
  border-radius: 9999px;
  color: var(--tarot-text);
  font-size: 1.2rem;
  font-weight: 650;
  letter-spacing: 0.22em;
  background-image: linear-gradient(
    110deg,
    var(--tarot-purple-300),
    var(--tarot-purple-500),
    var(--tarot-purple-400),
    var(--tarot-purple-600)
  );
  background-size: 250% 100%;
  background-position: 0% 50%;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.35),
    0 10px 30px rgb(112 62 180 / 0.35),
    0 0 0 1px rgb(180 140 235 / 0.2);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    filter 0.25s ease;
}

.draw-button:hover,
.draw-button:focus-visible {
  transform: translateY(-2px);
  filter: brightness(1.06);
  animation: button-flow 4s linear infinite;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.42),
    0 16px 42px rgb(124 72 196 / 0.5),
    0 0 28px rgb(168 120 230 / 0.28),
    0 0 0 1px rgb(210 180 245 / 0.35);
}

.draw-button:focus-visible {
  outline: none;
}

.draw-button:active {
  transform: translateY(0) scale(0.98);
  filter: brightness(1.02);
}

.draw-button-icon {
  position: absolute;
  top: 50%;
  left: 1.45rem;
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
  fill: var(--tarot-text);
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
  animation:
    click-pulse 0.55s ease-out,
    button-flow 4s linear infinite;
}

.draw-button.is-casting .draw-star {
  animation: star-pop 0.55s ease-out;
}

.draw-button.is-casting .draw-burst i {
  animation: spark-burst 0.65s ease-out forwards;
}

@keyframes button-flow {
  from {
    background-position: 0% 50%;
  }

  to {
    background-position: 100% 50%;
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
