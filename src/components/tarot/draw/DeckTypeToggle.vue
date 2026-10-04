<script setup lang="ts">
export type DeckType = "major" | "minor";

defineProps<{
  disabled?: boolean;
}>();

const deckType = defineModel<DeckType>({ required: true });

const options: { value: DeckType; label: string; count: string }[] = [
  { value: "minor", label: "小阿爾卡納", count: "78" },
  { value: "major", label: "大阿爾卡納", count: "22" },
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
  flex: 0 0 auto;
  flex-wrap: nowrap;
  gap: 0.45rem;
}

.deck-toggle button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  padding: 0.28rem 0.72rem;
  border: 1px solid rgb(210 174 102 / 0.28);
  border-radius: 999px;
  background: transparent;
  color: rgb(232 224 244 / 0.9);
  font-size: var(--font-size-body);
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0.03em;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.22s ease,
    border-color 0.22s ease,
    color 0.22s ease,
    opacity 0.22s ease;
}

.deck-toggle button:hover:not(:disabled):not(.is-selected) {
  border-color: rgb(210 174 102 / 0.48);
  color: #e7d7f4;
}

.deck-toggle button:focus-visible {
  outline: none;
  border-color: rgb(231 195 118 / 0.55);
}

.deck-toggle button.is-selected {
  border-color: rgb(231 195 118 / 0.72);
  background: rgb(22 12 36 / 0.55);
  color: var(--tarot-gold-bright, #f4e3b2);
  font-weight: 600;
}

.deck-toggle button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.deck-toggle-dot {
  margin-inline: 0.35rem 0.28rem;
  color: currentColor;
  opacity: 0.72;
}

.deck-toggle button.is-selected .deck-toggle-dot {
  opacity: 0.85;
}

.deck-toggle-count {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  opacity: 1;
}

.deck-toggle button.is-selected .deck-toggle-count {
  opacity: 1;
}

@media (max-width: 520px) {
  .deck-toggle button {
    padding-inline: 0.55rem;
    font-size: var(--font-size-label);
    letter-spacing: 0.02em;
  }
}

@media (max-width: 420px) {
  .deck-toggle {
    gap: 0.35rem;
  }

  .deck-toggle button {
    padding-inline: 0.42rem;
  }
}
</style>
