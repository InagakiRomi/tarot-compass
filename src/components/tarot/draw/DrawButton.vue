<script setup lang="ts">
import { nextTick, ref } from "vue";
import { Sparkle } from "@lucide/vue";

withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: "抽牌",
  },
);

const emit = defineEmits<{
  click: [];
}>();

const isCasting = ref(false);

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
  <button
    class="draw-button relative isolate inline-flex h-14 w-60 min-w-57.5 shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-full border px-[1.35rem] pl-[2.7rem] text-(length:--font-size-button) font-medium leading-none tracking-[0.16em] transition-[transform,box-shadow,border-color,background,color] duration-200 max-[720px]:w-full max-[720px]:min-w-0"
    :class="{ 'is-casting': isCasting }"
    type="button"
    @click="handleClick"
  >
    <span
      class="draw-button-icon absolute left-[1.05rem] top-1/2 z-2 inline-flex size-5 -translate-y-1/2 items-center justify-center"
      aria-hidden="true"
    >
      <Sparkle class="draw-star size-5" :stroke-width="1.4" />

      <span
        class="draw-burst pointer-events-none absolute inset-0"
        @animationend="handleAnimationEnd"
      >
        <i
          v-for="(ray, index) in burstRays"
          :key="index"
          class="absolute left-1/2 top-1/2 size-0.75 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          :class="{ 'is-star': ray.star }"
          :style="{ '--x': ray.x, '--y': ray.y }"
        />
      </span>
    </span>

    <span class="draw-label relative z-2 mr-[-0.16em]">
      {{ label }}
    </span>
  </button>
</template>

<style scoped>
.draw-button {
  border-color: color-mix(in srgb, var(--tarot-gold, #d9b56d) 48%, transparent);

  color: var(--tarot-gold-bright, #f4e3b2);

  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.045), rgb(255 255 255 / 0.015)),
    rgb(29 20 34 / 0.72);

  backdrop-filter: blur(12px);

  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.06),
    inset 0 0 20px rgb(217 181 109 / 0.025),
    0 10px 30px rgb(0 0 0 / 0.22);
}

.draw-button::before {
  content: "";
  position: absolute;
  inset: 1px;
  z-index: 0;
  border-radius: inherit;
  background: radial-gradient(
    circle at 50% 0%,
    rgb(217 181 109 / 0.09),
    transparent 55%
  );
  pointer-events: none;
}

.draw-button::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgb(246 231 190 / 0.14) 48%,
    rgb(255 255 255 / 0.12) 52%,
    transparent 70%
  );
  pointer-events: none;
  transform: translateX(-140%);
}

.draw-button:hover,
.draw-button:focus-visible {
  color: #fff1c9;

  border-color: color-mix(in srgb, var(--tarot-gold, #d9b56d) 76%, transparent);

  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.065), rgb(217 181 109 / 0.025)),
    rgb(34 23 39 / 0.82);

  transform: translateY(-2px);

  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.09),
    inset 0 0 24px rgb(217 181 109 / 0.045),
    0 12px 34px rgb(0 0 0 / 0.28),
    0 0 18px rgb(217 181 109 / 0.08);
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

  background:
    linear-gradient(180deg, rgb(217 181 109 / 0.06), rgb(255 255 255 / 0.015)),
    rgb(30 20 35 / 0.88);
}

.draw-star {
  fill: rgb(217 181 109 / 0.13);
  color: var(--tarot-gold-light, #e7c376);
  filter: drop-shadow(0 0 5px rgb(217 181 109 / 0.16));
}

.draw-burst i {
  margin: -1.5px 0 0 -1.5px;
  background: #f6e7be;
  box-shadow: 0 0 6px rgb(246 231 190 / 0.5);
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
    transform: translateX(-140%);
  }

  to {
    transform: translateX(140%);
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
