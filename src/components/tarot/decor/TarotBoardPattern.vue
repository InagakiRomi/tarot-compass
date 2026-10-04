<script setup lang="ts">
import { Sparkle } from "@lucide/vue";

const corners = ["tl", "tr", "bl", "br"] as const;
const ticks = Array.from({ length: 24 }, (_, index) => index * 15);
const orbitPoints = [0, 90, 180, 270] as const;
</script>

<template>
  <div class="tarot-board-pattern" aria-hidden="true">
    <span
      v-for="corner in corners"
      :key="corner"
      class="board-corner"
      :class="`board-corner-${corner}`"
    />

    <div class="celestial-circle">
      <div class="circle-glow" />

      <div class="outer-orbit">
        <div class="outer-ring" />

        <span
          v-for="angle in ticks"
          :key="angle"
          class="orbit-tick"
          :style="{ '--angle': `${angle}deg` }"
        />
      </div>

      <div class="middle-ring" />

      <span
        v-for="angle in orbitPoints"
        :key="angle"
        class="orbit-point"
        :style="{ '--angle': `${angle}deg` }"
      >
        <span class="orbit-dot" />
      </span>

      <span class="axis axis-horizontal" />
      <span class="axis axis-vertical" />
      <span class="axis axis-diagonal axis-diagonal-a" />
      <span class="axis axis-diagonal axis-diagonal-b" />

      <div class="inner-diamond" />
      <div class="inner-ring" />

      <div class="core">
        <span class="core-halo" />
        <Sparkle class="core-star" :stroke-width="1" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tarot-board-pattern {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

/* 四角裝飾 */
.board-corner {
  position: absolute;
  width: 1.4rem;
  height: 1.4rem;
  opacity: 0.42;
}

.board-corner::before,
.board-corner::after {
  content: "";
  position: absolute;
}

.board-corner::before {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--tarot-gold) 55%, transparent),
    transparent
  );
}

.board-corner::after {
  width: 1px;
  height: 100%;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--tarot-gold) 55%, transparent),
    transparent
  );
}

.board-corner-tl {
  top: 1rem;
  left: 1rem;
}

.board-corner-tr {
  top: 1rem;
  right: 1rem;
  transform: rotate(90deg);
}

.board-corner-br {
  right: 1rem;
  bottom: 1rem;
  transform: rotate(180deg);
}

.board-corner-bl {
  bottom: 1rem;
  left: 1rem;
  transform: rotate(270deg);
}

/* 星象魔法陣 */
.celestial-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(33rem, 68%);
  aspect-ratio: 1;
  color: var(--tarot-gold, #d9b56d);
  opacity: 0.72;
  transform: translate(-50%, -50%);
}

.circle-glow {
  position: absolute;
  inset: 19%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--tarot-gold) 8%, transparent) 0%,
    transparent 68%
  );
  filter: blur(18px);
}

/* 外圈 */
.outer-orbit {
  position: absolute;
  inset: 0;
  animation: orbit-spin 120s linear infinite;
}

.outer-ring {
  position: absolute;
  inset: 3%;
  border: 1px solid color-mix(in srgb, var(--tarot-gold) 28%, transparent);
  border-radius: 50%;
  box-shadow: 0 0 22px color-mix(in srgb, var(--tarot-gold) 5%, transparent);
}

.orbit-tick {
  position: absolute;
  inset: 0;
  transform: rotate(var(--angle));
}

.orbit-tick::before {
  content: "";
  position: absolute;
  top: 2.3%;
  left: 50%;
  width: 1px;
  height: 1.2%;
  background: color-mix(in srgb, var(--tarot-gold) 45%, transparent);
  transform: translateX(-50%);
}

.orbit-tick:nth-child(3n + 1)::before {
  height: 2.2%;
  background: color-mix(in srgb, var(--tarot-gold) 62%, transparent);
}

/* 中間圓環 */
.middle-ring {
  position: absolute;
  inset: 14%;
  border: 1px dashed color-mix(in srgb, var(--tarot-gold) 24%, transparent);
  border-radius: 50%;
}

/* 軌道節點 */
.orbit-point {
  position: absolute;
  inset: 0;
  transform: rotate(var(--angle));
}

.orbit-dot {
  position: absolute;
  top: 13.3%;
  left: 50%;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--tarot-gold-light, #ebcd8b);
  box-shadow: 0 0 7px
    color-mix(in srgb, var(--tarot-gold-light) 45%, transparent);
  transform: translate(-50%, -50%);
}

/* 幾何軸線 */
.axis {
  position: absolute;
  top: 50%;
  left: 50%;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--tarot-gold) 24%, transparent),
    transparent
  );
}

.axis-horizontal {
  width: 67%;
  height: 1px;
  transform: translate(-50%, -50%);
}

.axis-vertical {
  width: 67%;
  height: 1px;
  transform: translate(-50%, -50%) rotate(90deg);
}

.axis-diagonal {
  width: 51%;
  height: 1px;
  opacity: 0.65;
}

.axis-diagonal-a {
  transform: translate(-50%, -50%) rotate(45deg);
}

.axis-diagonal-b {
  transform: translate(-50%, -50%) rotate(-45deg);
}

/* 菱形 */
.inner-diamond {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 34%;
  aspect-ratio: 1;
  border: 1px solid color-mix(in srgb, var(--tarot-gold) 29%, transparent);
  transform: translate(-50%, -50%) rotate(45deg);
}

/* 內圈 */
.inner-ring {
  position: absolute;
  inset: 37%;
  border: 1px solid color-mix(in srgb, var(--tarot-gold) 34%, transparent);
  border-radius: 50%;
  box-shadow: inset 0 0 12px
    color-mix(in srgb, var(--tarot-gold) 5%, transparent);
}

/* 中央星芒 */
.core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 9%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
}

.core-halo {
  position: absolute;
  inset: -80%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--tarot-gold-light) 16%, transparent),
    transparent 66%
  );
  filter: blur(6px);
  animation: core-breathe 5s ease-in-out infinite;
}

.core-star {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--tarot-gold-bright, #f6e7be);
  filter: drop-shadow(
    0 0 5px color-mix(in srgb, var(--tarot-gold-bright) 28%, transparent)
  );
}

/* 動畫 */
@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes core-breathe {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.9);
  }

  50% {
    opacity: 0.9;
    transform: scale(1.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .outer-orbit,
  .core-halo {
    animation: none;
  }
}
</style>
