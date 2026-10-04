<script setup lang="ts">
import { Input } from "@/components/ui/input";

defineProps<{
  modelValue: string;
  min: number;
  max: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  /** 焦點離開這組控制；next 是下一個焦點，留給外面判斷要不要開抽 */
  blur: [next: Element | null];
  decrease: [];
  increase: [];
}>();

function onInput(value: string | number) {
  emit("update:modelValue", String(value));
}

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget;
  const root = event.currentTarget;

  if (
    next instanceof Node &&
    root instanceof Element &&
    root.contains(next)
  ) {
    return;
  }

  emit("blur", next instanceof Element ? next : null);
}

function onEnter(event: KeyboardEvent) {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  (event.target as HTMLInputElement).blur();
}

function onFocus(event: FocusEvent) {
  if (event.target instanceof HTMLInputElement) {
    event.target.select();
  }
}
</script>

<template>
  <div class="draw-count" role="group" aria-label="抽牌數量" @focusout="onFocusOut">
    <button
      type="button"
      aria-label="減少張數"
      @mousedown.prevent
      @click="emit('decrease')"
    >
      −
    </button>

    <Input
      :model-value="modelValue"
      :min="min"
      :max="max"
      class="draw-count-input"
      inputmode="numeric"
      autocomplete="off"
      spellcheck="false"
      aria-label="抽牌數量"
      @update:model-value="onInput"
      @focus="onFocus"
      @keydown="onEnter"
    />

    <button
      type="button"
      aria-label="增加張數"
      @mousedown.prevent
      @click="emit('increase')"
    >
      +
    </button>
  </div>
</template>

<style scoped>
.draw-count {
  display: flex;
  align-items: center;
  height: 48px;
  padding-inline: 0.1rem;
  color: var(--tarot-text);
}

.draw-count button {
  width: 48px;
  height: 100%;
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--tarot-gold-light) 72%, var(--tarot-text));
  font-size: 20px;
  line-height: 1;
  opacity: 0.82;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.2s,
    color 0.2s;
}

.draw-count button:hover,
.draw-count button:focus-visible {
  opacity: 1;
  color: var(--tarot-gold-light);
  transform: scale(1.06);
}

.draw-count button:focus-visible {
  outline: none;
}

.draw-count :deep(.draw-count-input) {
  width: 56px;
  height: auto;
  flex: 0 0 56px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  box-shadow: none;
  caret-color: var(--tarot-gold-light);
}

.draw-count :deep(.draw-count-input:focus),
.draw-count :deep(.draw-count-input:focus-visible) {
  outline: none;
  border: 0;
  box-shadow: none;
}
</style>
