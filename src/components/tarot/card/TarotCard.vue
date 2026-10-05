<script setup lang="ts">
import { computed, ref, watch } from "vue";
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
    /** 略過翻牌與牌名進場 */
    skipMotion?: boolean;
  }>(),
  {
    revealDelay: 0,
    faceDown: false,
    skipMotion: false,
  },
);

/** 尚未抽出，或抽牌時先蓋回，都顯示牌背 */
const showBack = computed(() => props.faceDown || props.card === null);
const reducedMotion = usePreferredReducedMotion();
const isHovered = ref(false);
const revealInstant = ref(prefersInstant());

function prefersInstant() {
  return props.skipMotion || reducedMotion.value === "reduce";
}

watch(showBack, (back) => {
  if (!back) {
    revealInstant.value = prefersInstant();
  }
});

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
            rotateY: showBack ? 0 : revealInstant ? -180 : [0, -18, -90, -162, -180],
          }"
          :transition="{
            duration: revealInstant ? 0 : 0.75,
            delay: showBack || revealInstant ? 0 : revealDelay,
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
              :class="{ 'is-reversed': card.reversed }"
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          </div>
        </motion.div>
      </div>
    </div>

    <p
      class="card-name"
      :class="{ invisible: showBack, 'is-revealed': !showBack && !revealInstant }"
    >
      <template v-if="card">
        {{ card.cardName }}
        <span class="card-orientation">{{ card.reversed ? "逆位" : "正位" }}</span>
      </template>
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
  position: relative;
  border-radius: 0.55rem;
  transform: translateY(0) scale(1) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transform-origin: center center;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.card-tilt::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: 48%;
  left: 50%;
  width: 128%;
  height: 62%;
  background: radial-gradient(ellipse, rgb(145 93 190 / 0.42), rgb(83 47 122 / 0.1) 46%, transparent 72%);
  filter: blur(16px);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: opacity 0.4s ease;
}

.card-tilt.is-hovered {
  transform: translateY(-8px) scale(1.025) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
}

.card-tilt.is-hovered::before {
  opacity: 1;
}

.card-scene {
  aspect-ratio: 25 / 44;
  width: 100%;
  min-width: 0;
  border-radius: 0.55rem;
  perspective: 1200px;
  box-shadow: 0 14px 28px rgb(0 0 0 / 0.28);
  transition: box-shadow 0.4s ease;
}

.card-tilt.is-hovered .card-scene {
  box-shadow:
    0 18px 36px rgb(0 0 0 / 0.38),
    0 0 26px rgb(135 83 181 / 0.28);
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

.card-image.is-reversed {
  transform: rotate(180deg);
}

.card-name {
  min-height: calc(var(--font-size-card-name) * 1.4);
  color: var(--tarot-text);
  font-size: var(--font-size-card-name);
  font-weight: 500;
  line-height: 1.4;
  text-align: center;
}

.card-name.is-revealed {
  animation: name-rise 0.45s ease both;
  animation-delay: var(--name-delay, 0.4s);
}

.card-orientation {
  margin-left: 0.5rem;
  color: var(--tarot-gold-light, #e7c376);
  font-size: var(--font-size-body);
  font-weight: 500;
  letter-spacing: 0.04em;
  white-space: nowrap;
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
  .card-tilt::before,
  .card-front::after,
  .card-name.is-revealed {
    animation: none;
    transition: none;
  }

  .card-tilt,
  .card-tilt.is-hovered {
    transform: none;
  }
}
</style>
