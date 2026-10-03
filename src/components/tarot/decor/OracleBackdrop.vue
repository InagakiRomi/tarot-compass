<template>
  <div class="mystic-background">
    <div class="mystic-scenery" aria-hidden="true">
      <div class="aurora aurora-a" />
      <div class="aurora aurora-b" />

      <div
        v-for="orbit in orbits"
        :key="orbit"
        class="mystic-orbit"
        :class="`mystic-orbit-${orbit}`"
      />

      <svg class="mystic-moon" viewBox="0 0 80 80" fill="currentColor">
        <path
          d="M48 8c-2.4 0-4.7.3-6.9.8A26 26 0 1 0 62 58.2 22 22 0 1 1 48 8z"
        />
      </svg>

      <span
        v-for="star in stars"
        :key="star.id"
        class="mystic-star"
        :class="[
          `mystic-star-${star.tier}`,
          { 'is-breathing': star.duration },
        ]"
        :style="{
          top: star.top,
          left: star.left,
          width: star.size,
          height: star.size,
          opacity: star.duration ? undefined : star.opacity,
          animationDelay: star.delay,
          animationDuration: star.duration,
        }"
      />
    </div>

    <div class="mystic-stage">
      <slot />
    </div>

    <div class="mystic-frame" aria-hidden="true" />

    <svg
      v-for="corner in corners"
      :key="corner"
      class="mystic-corner-decoration"
      :class="`mystic-corner-${corner}`"
      viewBox="0 0 160 160"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 112C8 52 46 14 112 8"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
      />
      <path
        d="M8 112c16-4 30-18 30-36-12 4-22 14-24 28-2 2-4 6-6 8z"
        fill="currentColor"
      />
      <path
        d="M112 8c-4 16-18 30-36 30 4-12 14-22 28-24 2-2 6-4 8-6z"
        fill="currentColor"
      />
      <path d="M54 54l5.2-12.4L64.4 54 52 59.2 54 54z" fill="currentColor" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { orbits, stars } from "@/components/tarot/decor/oracleBackdrop.config";

/**
 * 四角植物不互相鏡像：
 * 左上、右下較完整，右上、左下較小。
 */
const corners = ["tl", "tr", "bl", "br"] as const;
</script>

<style scoped>
.mystic-background {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 100svh;
  flex: 1 1 auto;
  flex-direction: column;
  color: var(--tarot-gold);
}

.mystic-scenery {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.mystic-stage {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  min-height: 100%;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  padding: 3.25rem 2.15rem 3.5rem;
}

.aurora {
  position: absolute;
  width: 850px;
  height: 550px;
  background: radial-gradient(ellipse, rgb(107 64 178 / 0.18), transparent 65%);
  filter: blur(90px);
  animation: aurora-float 14s ease-in-out infinite alternate;
}

.aurora-a {
  top: -8%;
  left: -4%;
}

.aurora-b {
  top: 6%;
  right: -10%;
  width: 680px;
  height: 460px;
  background: radial-gradient(ellipse, rgb(141 83 170 / 0.16), transparent 68%);
  animation-duration: 18s;
  animation-direction: alternate-reverse;
}

.mystic-orbit {
  position: absolute;
  border: 1px solid color-mix(in srgb, var(--tarot-gold) 14%, transparent);
  border-radius: 50%;
}

.mystic-orbit-a {
  width: 520px;
  height: 520px;
  left: -200px;
  top: 180px;
  animation: orbit-rotate 96s linear infinite;
}

.mystic-orbit-b {
  width: 360px;
  height: 360px;
  right: -150px;
  top: 64px;
}

.mystic-orbit-c {
  width: 700px;
  height: 700px;
  right: -280px;
  bottom: -340px;
}

.mystic-orbit-d {
  width: 240px;
  height: 240px;
  left: 18%;
  top: -90px;
}

.mystic-orbit-e {
  width: 480px;
  height: 480px;
  left: -40px;
  bottom: -230px;
}

.mystic-orbit-f {
  width: 620px;
  height: 620px;
  left: 46%;
  top: -380px;
  animation: orbit-rotate 120s linear infinite reverse;
}

.mystic-moon {
  position: absolute;
  top: 30px;
  right: -25px;
  width: 140px;
  height: 140px;
  color: var(--tarot-gold-light);
  opacity: 0.2;
}

.mystic-star {
  position: absolute;
}

.mystic-star-primary,
.mystic-star-secondary {
  background:
    linear-gradient(var(--tarot-gold-bright), var(--tarot-gold-bright)) center / 18% 100% no-repeat,
    linear-gradient(var(--tarot-gold-bright), var(--tarot-gold-bright)) center / 100% 18% no-repeat;
}

.mystic-star-primary.is-breathing,
.mystic-star-secondary.is-breathing {
  animation: star-breathe 4.5s ease-in-out infinite;
}

.mystic-star-primary {
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--tarot-gold-bright) 45%, transparent));
}

.mystic-star-secondary {
  opacity: 0.55;
}

.mystic-star-dust {
  border-radius: 50%;
  background: var(--tarot-gold-light);
}

.mystic-frame {
  position: absolute;
  inset: 0.85rem;
  z-index: 5;
  border: 1px solid color-mix(in srgb, var(--tarot-gold) 42%, transparent);
  box-shadow: inset 0 0 0 8px color-mix(in srgb, var(--tarot-gold) 5%, transparent);
  pointer-events: none;
}

.mystic-corner-decoration {
  position: absolute;
  z-index: 6;
  color: var(--tarot-gold);
  pointer-events: none;
}

.mystic-corner-tl {
  top: 0.45rem;
  left: 0.45rem;
  width: 8.5rem;
  height: 8.5rem;
}

.mystic-corner-tr {
  top: 0.7rem;
  right: 0.7rem;
  width: 4.25rem;
  height: 4.25rem;
  transform: scaleX(-1);
}

.mystic-corner-bl {
  bottom: 0.85rem;
  left: 0.85rem;
  width: 4rem;
  height: 4rem;
  transform: scaleY(-1);
}

.mystic-corner-br {
  right: 0.4rem;
  bottom: 0.4rem;
  width: 8rem;
  height: 8rem;
  transform: scale(-1);
}

@keyframes aurora-float {
  from {
    transform: translate(-5%, -3%) scale(1);
  }

  to {
    transform: translate(8%, 5%) scale(1.12);
  }
}

@keyframes orbit-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes star-breathe {
  0%,
  100% {
    opacity: 0.25;
    transform: scale(0.9);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

@media (max-width: 760px) {
  .mystic-stage {
    padding: 4.5rem 1.5rem 2.75rem;
  }
}

@media (max-width: 640px) {
  .mystic-moon {
    top: 12px;
    right: -36px;
    width: 108px;
    height: 108px;
  }

  .mystic-corner-tl,
  .mystic-corner-br {
    width: 5rem;
    height: 5rem;
  }

  .mystic-corner-tr,
  .mystic-corner-bl {
    width: 2.75rem;
    height: 2.75rem;
  }

  .mystic-frame {
    inset: 0.45rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .aurora,
  .mystic-orbit-a,
  .mystic-orbit-f,
  .mystic-star-primary.is-breathing,
  .mystic-star-secondary.is-breathing {
    animation: none;
  }
}
</style>
