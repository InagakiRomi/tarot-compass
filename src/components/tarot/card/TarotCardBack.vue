<script setup lang="ts">
import TarotEmblem from "@/components/tarot/card/TarotEmblem.vue";

const corners = ["tl", "tr", "bl", "br"] as const;
</script>

<template>
  <div class="tarot-back">
    <svg class="back-seal" viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="86" />
      <circle cx="100" cy="100" r="64" />
      <circle cx="100" cy="100" r="40" />
      <path d="M100 14v172M14 100h172" />
      <path d="M39 39l122 122M161 39 39 161" />
      <path d="M100 14l6 10M186 100l-10 6M100 186l-6-10M14 100l10-6" />
      <circle cx="100" cy="14" r="2.1" fill="currentColor" />
      <circle cx="186" cy="100" r="2.1" fill="currentColor" />
      <circle cx="100" cy="186" r="2.1" fill="currentColor" />
      <circle cx="14" cy="100" r="2.1" fill="currentColor" />
    </svg>

    <div class="back-frame" />

    <span
      v-for="corner in corners"
      :key="corner"
      class="back-mark"
      :class="`back-mark-${corner}`"
    />

    <TarotEmblem class="back-emblem" />

    <div class="back-sparks">
      <span />
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path
          d="M6 0.4 7.2 4.4 11.4 6 7.2 7.6 6 11.6 4.8 7.6 0.6 6 4.8 4.4Z"
          fill="currentColor"
        />
      </svg>
      <span />
    </div>
  </div>
</template>

<style scoped>
.tarot-back {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid rgb(218 183 110 / 0.48);
  border-radius: 0.55rem;
  background:
    radial-gradient(circle at 50% 25%, rgb(145 93 190 / 0.48), transparent 52%),
    linear-gradient(160deg, #402556, #21132f 68%, #160d22);
  box-shadow:
    0 14px 35px rgb(0 0 0 / 0.34),
    0 0 25px rgb(135 83 181 / 0.08),
    inset 0 1px rgb(255 255 255 / 0.07);
  transition:
    border-color 0.4s ease,
    box-shadow 0.4s ease;
}

.tarot-back::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(
    circle at var(--gx, 50%) var(--gy, 16%),
    rgb(255 248 230 / 0.18),
    transparent 34%
  );
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.tarot-back::after {
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

.tarot-back.is-hovered {
  border-color: rgb(244 227 178 / 0.82);
  box-shadow:
    0 18px 40px rgb(0 0 0 / 0.4),
    0 0 32px rgb(135 83 181 / 0.24),
    inset 0 1px rgb(255 255 255 / 0.12);
}

.tarot-back.is-hovered::before {
  opacity: 1;
}

.tarot-back.is-hovered::after {
  animation: card-shine 0.9s ease;
}

.back-seal {
  position: absolute;
  top: 46%;
  left: 50%;
  z-index: 0;
  width: 78%;
  color: var(--tarot-gold-dim);
  opacity: 0.28;
  stroke: currentColor;
  stroke-width: 1.1;
  transform: translate(-50%, -50%);
}

.back-frame {
  position: absolute;
  inset: 0.42rem;
  z-index: 1;
  border: 1px solid color-mix(in srgb, var(--tarot-gold-dim) 70%, transparent);
  border-radius: 0.28rem;
  pointer-events: none;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tarot-gold-light) 5%, transparent);
}

.back-mark {
  position: absolute;
  z-index: 2;
  width: 0.42rem;
  height: 0.42rem;
}

.back-mark::before,
.back-mark::after {
  content: "";
  position: absolute;
  background: color-mix(in srgb, var(--tarot-gold) 78%, transparent);
}

.back-mark::before {
  width: 100%;
  height: 1px;
}

.back-mark::after {
  width: 1px;
  height: 100%;
}

.back-mark-tl {
  top: 0.72rem;
  left: 0.72rem;
}

.back-mark-tr {
  top: 0.72rem;
  right: 0.72rem;
}

.back-mark-tr::after {
  right: 0;
}

.back-mark-bl {
  bottom: 0.72rem;
  left: 0.72rem;
}

.back-mark-bl::before {
  bottom: 0;
}

.back-mark-br {
  right: 0.72rem;
  bottom: 0.72rem;
}

.back-mark-br::before {
  bottom: 0;
}

.back-mark-br::after {
  right: 0;
}

.back-emblem {
  position: absolute;
  top: 44%;
  left: 50%;
  z-index: 2;
  width: 40%;
  color: color-mix(in srgb, var(--tarot-gold-bright) 92%, transparent);
  transform: translate(-50%, -50%);
  transition:
    color 0.4s ease,
    filter 0.4s ease;
}

.tarot-back.is-hovered .back-emblem {
  color: var(--tarot-gold-bright);
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--tarot-gold-bright) 55%, transparent));
}

.tarot-back.is-hovered .back-sparks {
  color: var(--tarot-gold-bright);
  filter: drop-shadow(0 0 6px rgb(244 227 178 / 0.7));
}

.back-sparks {
  position: absolute;
  bottom: 16%;
  left: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.72rem;
  color: color-mix(in srgb, var(--tarot-gold-light) 82%, transparent);
  transform: translateX(-50%);
  transition:
    color 0.4s ease,
    filter 0.4s ease;
}

.back-sparks span {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
}

.back-sparks svg {
  width: 9px;
  height: 9px;
}

@keyframes card-shine {
  to {
    transform: translateX(130%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tarot-back::after,
  .tarot-back.is-hovered::after {
    animation: none;
    transition: none;
    transform: none;
  }
}
</style>
