<script setup lang="ts">
import { ref, watch } from "vue";
import { toast } from "vue-sonner";
import DrawButton from "@/components/tarot/draw/DrawButton.vue";
import DrawCountInput from "@/components/tarot/draw/DrawCountInput.vue";

const props = defineProps<{
  modelValue: number;
  min: number;
  max: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number];
  draw: [];
}>();

const rawCount = ref(String(props.modelValue));
const drawActionRef = ref<HTMLElement | null>(null);

/** 同一個點擊若先 blur 再按抽牌，避免修正後又立刻開抽 */
let rejectedAt = 0;

watch(
  () => props.modelValue,
  (value) => {
    rawCount.value = String(value);
  },
);

function commit(value: number) {
  emit("update:modelValue", value);
  rawCount.value = String(value);
}

function warnDrawCount() {
  toast.warning(`請輸入 ${props.min}～${props.max} 之間的整數`);
}

function rejectDrawCount() {
  warnDrawCount();
  rawCount.value = String(props.modelValue);
  return false;
}

function validateDrawCount() {
  const raw = rawCount.value.trim();

  if (!raw || !/^\d+$/.test(raw)) {
    return rejectDrawCount();
  }

  const value = Number(raw);

  if (value < props.min || value > props.max) {
    return rejectDrawCount();
  }

  commit(value);
  return true;
}

function consumeRecentReject() {
  if (performance.now() - rejectedAt > 500) {
    return false;
  }

  rejectedAt = 0;
  return true;
}

function isDirty() {
  return rawCount.value.trim() !== String(props.modelValue);
}

function decreaseCount() {
  if (isDirty()) {
    validateDrawCount();
    return;
  }

  if (props.modelValue <= props.min) {
    warnDrawCount();
    return;
  }

  commit(props.modelValue - 1);
}

function increaseCount() {
  if (isDirty()) {
    validateDrawCount();
    return;
  }

  if (props.modelValue >= props.max) {
    warnDrawCount();
    return;
  }

  commit(props.modelValue + 1);
}

function onCountBlur(next: Element | null) {
  const drawing = next !== null && Boolean(drawActionRef.value?.contains(next));
  const valid = validateDrawCount();

  if (!valid && drawing) {
    rejectedAt = performance.now();
  }
}

function onDrawClick() {
  if (consumeRecentReject()) {
    return;
  }

  if (!validateDrawCount()) {
    return;
  }

  emit("draw");
}
</script>

<template>
  <div class="draw-controls">
    <span class="draw-count-label" id="draw-count-label">抽牌數量</span>

    <DrawCountInput
      v-model="rawCount"
      aria-labelledby="draw-count-label"
      @blur="onCountBlur"
      @decrease="decreaseCount"
      @increase="increaseCount"
    />

    <div ref="drawActionRef" class="draw-action">
      <DrawButton @click="onDrawClick" />
    </div>
  </div>
</template>

<style scoped>
.draw-controls {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-block: 0 0.15rem;
  gap: 0.9rem 1.75rem;
}

.draw-count-label {
  color: var(--text-muted);
  font-size: 0.95rem;
  letter-spacing: 0.22em;
}

.draw-action {
  display: flex;
}

@media (max-width: 760px) {
  .draw-controls {
    flex-direction: column;
    align-items: center;
    width: min(100%, 20rem);
    gap: 0.85rem;
  }

  .draw-action {
    width: 100%;
  }

  .draw-count-label {
    text-align: center;
  }
}
</style>
