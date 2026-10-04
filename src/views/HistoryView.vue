<script setup lang="ts">
import OracleBackdrop from "@/components/tarot/decor/OracleBackdrop.vue";
import PageOrnament from "@/components/tarot/decor/PageOrnament.vue";
</script>

<template>
  <main class="history-page">
    <OracleBackdrop>
      <div class="history-layout">
        <header class="history-heading">
          <p class="history-heading-en">History</p>
          <h1 class="history-heading-title">歷史紀錄</h1>
        </header>
        <PageOrnament />
      </div>
    </OracleBackdrop>
  </main>
</template>

<style scoped>
.history-page {
  position: relative;
  isolation: isolate;
  display: flex;
  width: 100%;
  max-width: 100vw;
  min-width: 0;
  min-height: 100svh;
  flex-direction: column;
  color: var(--tarot-text);
  background:
    radial-gradient(ellipse at 50% 38%, rgb(90 48 140 / 0.07), transparent 46%),
    linear-gradient(180deg, var(--bg-purple) 0%, var(--bg-dark) 100%);
}

.history-layout {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 76rem;
  margin-inline: auto;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
}

.history-heading {
  display: flex;
  width: 100%;
  max-width: 36rem;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  text-align: center;
}

.history-heading-en {
  margin: 0;
  color: color-mix(in srgb, var(--tarot-gold) 72%, transparent);
  font-size: calc(0.72rem + 2px);
  font-weight: 500;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  text-transform: uppercase;
}

.history-heading-title {
  margin: 0;
  background: linear-gradient(
    180deg,
    var(--tarot-gold-bright) 0%,
    var(--tarot-gold) 58%,
    var(--tarot-gold-dim) 100%
  );
  background-clip: text;
  color: transparent;
  font-size: clamp(calc(1.85rem + 2px), calc(3.4vw + 2px), calc(2.45rem + 2px));
  font-weight: 600;
  letter-spacing: 0.28em;
  line-height: 1.2;
  text-indent: 0.28em;
}
</style>
