<script setup lang="ts">
/** 舞台四角的細線，不再加內框或圓形星盤 */
const corners = ["tl", "tr", "bl", "br"] as const;
</script>

<template>
  <div class="tarot-board-pattern" aria-hidden="true">
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
  color: var(--tarot-gold-dim);
}

.board-corner {
  position: absolute;
  width: 0.7rem;
  height: 0.7rem;
  opacity: 0.55;
}

.board-corner::before,
.board-corner::after {
  content: "";
  position: absolute;
  background: color-mix(in srgb, var(--tarot-gold) 42%, transparent);
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
