<script setup lang="ts">
export type DeckType = "major" | "minor";

defineProps<{
  disabled?: boolean;
}>();

const deckType = defineModel<DeckType>({ required: true });

const options: { value: DeckType; label: string; count: string }[] = [
  { value: "major", label: "大阿爾卡納", count: "22 張" },
  { value: "minor", label: "小阿爾卡納", count: "78 張" },
];
</script>

<template>
  <div class="deck-toggle" role="radiogroup" aria-label="牌組">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="deckType === option.value"
      :class="{ 'is-selected': deckType === option.value }"
      :disabled="disabled"
      @click="deckType = option.value"
    >
      <span>{{ option.label }}</span>
      <span class="deck-toggle-dot" aria-hidden="true">·</span>
      <span class="deck-toggle-count">{{ option.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.deck-toggle {
  display: inline-flex;
  max-width: 100%;
  padding: 0.22rem;
  border: 1px solid rgb(210 174 102 / 0.28);
  border-radius: 999px;
  background: rgb(12 6 20 / 0.5);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.04),
    0 12px 28px rgb(0 0 0 / 0.18);
}

.deck-toggle button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.35rem;
  padding: 0.35rem 0.95rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: rgb(213 203 228 / 0.48);
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.22s ease,
    border-color 0.22s ease,
    color 0.22s ease,
    box-shadow 0.22s ease,
    opacity 0.22s ease;
}

.deck-toggle button:hover:not(:disabled):not(.is-selected) {
  background: rgb(116 72 200 / 0.16);
  color: #e7d7f4;
}

.deck-toggle button:focus-visible {
  outline: none;
  border-color: rgb(231 195 118 / 0.45);
}

.deck-toggle button.is-selected {
  border-color: rgb(231 195 118 / 0.78);
  background: linear-gradient(180deg, rgb(119 72 200 / 0.62), rgb(36 18 58 / 0.88));
  color: var(--tarot-gold-bright, #f4e3b2);
  box-shadow:
    0 0 18px rgb(164 123 234 / 0.38),
    inset 0 0 14px rgb(231 195 118 / 0.14);
}

.deck-toggle button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.deck-toggle-dot {
  margin-inline: 0.28rem;
  opacity: 0.7;
}

.deck-toggle-count {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

@media (max-width: 760px) {
  .deck-toggle {
    width: 100%;
  }

  .deck-toggle button {
    flex: 1;
    padding-inline: 0.4rem;
    font-size: 0.74rem;
    letter-spacing: 0.02em;
  }
}
</style>
