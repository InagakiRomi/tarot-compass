<script setup lang="ts">
import { computed, ref } from "vue";
import { usePreferredReducedMotion } from "@vueuse/core";
import { motion } from "motion-v";
import TarotCardBack from "@/components/tarot/card/TarotCardBack.vue";
import type { TarotCard } from "@/composables/useTarotDeck";

/** 單張塔羅牌；null 表示尚未翻開，只顯示牌背 */
const props = withDefaults(
  defineProps<{
    card: TarotCard | null;
    /** 翻牌延遲（秒），用來做依序翻開 */
    revealDelay?: number;
    /** 蓋回牌背；牌面先留著，翻轉途中正面不會先消失 */
    faceDown?: boolean;
  }>(),
  {
    revealDelay: 0,
    faceDown: false,
  },
);

/** 尚未抽出，或抽牌時先蓋回，都顯示牌背 */
const showBack = computed(() => props.faceDown || props.card === null);
const reducedMotion = usePreferredReducedMotion();
const isHovered = ref(false);

const tilt = ref({ x: 0, y: 0, gx: 50, gy: 16 });

const tiltStyle = computed(() => ({
  "--rx": `${tilt.value.x}deg`,
  "--ry": `${tilt.value.y}deg`,
  "--gx": `${tilt.value.gx}%`,
  "--gy": `${tilt.value.gy}%`,
  "--name-delay": `${props.revealDelay + 0.42}s`,
}));

function onPointerMove(event: PointerEvent) {
  if (reducedMotion.value === "reduce") {
    return;
  }

  const el = event.currentTarget;

  if (!(el instanceof HTMLElement)) {
    return;
  }

  const rect = el.getBoundingClientRect();
  const px = (event.clientX - rect.left) / rect.width;
  const py = (event.clientY - rect.top) / rect.height;

  tilt.value = {
    x: (0.5 - py) * 4,
    y: (px - 0.5) * 6,
    gx: px * 100,
    gy: py * 100,
  };
}

function onPointerEnter() {
  isHovered.value = true;
}

function onPointerLeave() {
  isHovered.value = false;
  tilt.value = { x: 0, y: 0, gx: 50, gy: 16 };
}
</script>

<template>
  <div class="tarot-card-body" :style="tiltStyle">
    <div
      class="card-tilt"
      :class="{ 'is-hovered': isHovered }"
      @pointerenter="onPointerEnter"
      @pointermove="onPointerMove"
      @pointerleave="onPointerLeave"
    >
      <div class="card-scene">
        <motion.div
          class="card-flip"
          :animate="{
            rotateY: showBack ? 0 : [0, -18, -90, -162, -180],
          }"
          :transition="{
            duration: reducedMotion === 'reduce' ? 0 : 0.75,
            delay: showBack || reducedMotion === 'reduce' ? 0 : revealDelay,
            ease: [0.2, 0.75, 0.25, 1],
          }"
        >
          <div class="card-face card-back" aria-hidden="true">
            <TarotCardBack :class="{ 'is-hovered': isHovered }" />
          </div>

          <div class="card-face card-front">
            <img
              v-if="card?.imageSrc"
              :src="card.imageSrc"
              :alt="card.cardName"
              class="card-image"
              draggable="false"
            />
          </div>
        </motion.div>
      </div>
    </div>

    <p class="card-name" :class="{ invisible: showBack, 'is-revealed': !showBack }">
      {{ card?.cardName }}
    </p>
  </div>
</template>

<style scoped>
.tarot-card-body {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  flex-direction: column;
  gap: 0.55rem;
  perspective: 900px;
}

.card-tilt {
  border-radius: 0.55rem;
  transform: translateY(0) scale(1) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transform-origin: center center;
  filter: drop-shadow(0 18px 28px rgb(0 0 0 / 0.3));
  transition:
    transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 0.4s ease;
}

.card-tilt.is-hovered {
  transform: translateY(-10px) scale(1.025) rotateX(var(--rx, 0deg))
    rotateY(var(--ry, 0deg));
  filter:
    drop-shadow(0 24px 40px rgb(0 0 0 / 0.42))
    drop-shadow(0 0 22px rgb(151 95 220 / 0.2));
}

.card-scene {
  aspect-ratio: 25 / 44;
  width: 100%;
  min-width: 0;
  perspective: 1200px;
}

.card-flip {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 0.55rem;
}

.card-front::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 4;
  border-radius: inherit;
  background: linear-gradient(
    115deg,
    transparent 20%,
    rgb(255 255 255 / 0.1) 42%,
    rgb(217 188 128 / 0.13) 50%,
    transparent 65%
  );
  pointer-events: none;
  transform: translateX(-130%);
}

.card-tilt.is-hovered .card-front::after {
  animation: card-shine 0.9s ease;
}

.card-back {
  transform: rotateY(0deg) translateZ(1px);
}

.card-front {
  overflow: hidden;
  transform: rotateY(180deg) translateZ(1px);
}

.card-image {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
  object-fit: contain;
}

.card-name {
  min-height: 1.25rem;
  color: var(--tarot-text);
  font-size: 0.95rem;
  line-height: 1.25;
  font-weight: 500;
  text-align: center;
  overflow-wrap: anywhere;
}

.card-name.is-revealed {
  animation: name-rise 0.45s ease both;
  animation-delay: var(--name-delay, 0.4s);
}

@keyframes card-shine {
  to {
    transform: translateX(130%);
  }
}

@keyframes name-rise {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-tilt,
  .card-tilt.is-hovered,
  .card-front::after,
  .card-name.is-revealed {
    animation: none;
    transition: none;
    transform: none;
  }
}
</style>
