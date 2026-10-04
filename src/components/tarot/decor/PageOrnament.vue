<template>
  <div class="page-ornament" aria-hidden="true">
    <svg viewBox="0 0 480 28" fill="none">
      <path
        d="M8 14H198"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
      />
      <path
        d="M282 14H472"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
      />
      <circle cx="214" cy="14" r="1.4" fill="currentColor" />
      <circle cx="266" cy="14" r="1.4" fill="currentColor" />
      <path
        d="M240 3.5 243.1 12.2 252 14 243.1 15.8 240 24.5 236.9 15.8 228 14 236.9 12.2Z"
        fill="currentColor"
      />
    </svg>
  </div>
</template>

<style scoped>
.page-ornament {
  width: min(100%, 22rem);
  color: color-mix(in srgb, var(--tarot-gold) 58%, transparent);
}

.page-ornament svg {
  display: block;
  width: 100%;
  height: auto;
}
</style>
