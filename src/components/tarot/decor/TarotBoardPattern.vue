<script setup lang="ts">
/** 牌桌四角的小型角花 */
const corners = ["tl", "tr", "bl", "br"] as const;

/** 星盤外圈的星位，避免再堆菱形花紋 */
const starPoints = [
  { cx: 400, cy: 58 },
  { cx: 612, cy: 268 },
  { cx: 400, cy: 478 },
  { cx: 188, cy: 268 },
  { cx: 550, cy: 118 },
  { cx: 250, cy: 418 },
  { cx: 546, cy: 412 },
  { cx: 254, cy: 124 },
];
</script>

<template>
  <div class="tarot-board-pattern" aria-hidden="true">
    <svg class="board-chart" viewBox="0 0 800 536" fill="none">
      <circle cx="400" cy="268" r="210" />
      <circle cx="400" cy="268" r="148" />
      <circle cx="400" cy="268" r="84" />
      <path d="M400 58v420M190 268h420" />
      <path d="M251 119 549 417M549 119 251 417" />
      <path d="M292 78 508 458M508 78 292 458M188 176l424 184M612 176 188 360" />
      <circle
        v-for="(point, index) in starPoints"
        :key="index"
        :cx="point.cx"
        :cy="point.cy"
        r="2.4"
        fill="currentColor"
      />
    </svg>

    <span
      v-for="corner in corners"
      :key="corner"
      class="board-corner"
      :class="`board-corner-${corner}`"
    />
  </div>
</template>

<style scoped>
.tarot-board-pattern {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
  color: var(--tarot-gold-light);
}

.board-chart {
  position: absolute;
  left: 50%;
  top: 48%;
  width: min(760px, 94%);
  height: auto;
  opacity: 0.08;
  stroke: currentColor;
  stroke-width: 1.15;
  transform: translate(-50%, -50%);
}

.board-corner {
  position: absolute;
  width: 0.85rem;
  height: 0.85rem;
  opacity: 0.7;
}

.board-corner::before,
.board-corner::after {
  content: "";
  position: absolute;
  background: color-mix(in srgb, var(--tarot-gold) 50%, transparent);
}

.board-corner::before {
  width: 100%;
  height: 1px;
}

.board-corner::after {
  width: 1px;
  height: 100%;
}

.board-corner-tl {
  top: 0.7rem;
  left: 0.7rem;
}

.board-corner-tr {
  top: 0.7rem;
  right: 0.7rem;
}

.board-corner-tr::after {
  right: 0;
}

.board-corner-bl {
  bottom: 0.7rem;
  left: 0.7rem;
}

.board-corner-bl::before {
  bottom: 0;
}

.board-corner-br {
  right: 0.7rem;
  bottom: 0.7rem;
}

.board-corner-br::before {
  bottom: 0;
}

.board-corner-br::after {
  right: 0;
}
</style>
