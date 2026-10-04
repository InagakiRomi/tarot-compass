<script setup lang="ts">
import { ref, watch } from "vue";
import { Copy } from "@lucide/vue";
import { toast } from "vue-sonner";
import DeckTypeToggle, {
  type DeckType,
} from "@/components/tarot/draw/DeckTypeToggle.vue";
import DrawButton from "@/components/tarot/draw/DrawButton.vue";
import DrawCountInput from "@/components/tarot/draw/DrawCountInput.vue";
import SkipMotionSwitch from "@/components/tarot/draw/SkipMotionSwitch.vue";

const props = defineProps<{
  modelValue: number;
  min: number;
  max: number;
  disabled?: boolean;
}>();

const skipMotion = defineModel<boolean>("skipMotion", { required: true });
const deckType = defineModel<DeckType>("deckType", { required: true });

const emit = defineEmits<{
  "update:modelValue": [value: number];
  draw: [];
  copy: [];
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

function warnMaxDrawCount() {
  if (deckType.value === "major") {
    toast.warning(`大阿爾卡納最多只能抽 ${props.max} 張牌`);
    return;
  }

  toast.warning(`目前牌組最多只能抽 ${props.max} 張牌`);
}

function rejectDrawCount(overMax = false) {
  if (overMax) {
    warnMaxDrawCount();
  } else {
    warnDrawCount();
  }

  rawCount.value = String(props.modelValue);
  return false;
}

function validateDrawCount() {
  const raw = rawCount.value.trim();

  if (!raw || !/^\d+$/.test(raw)) {
    return rejectDrawCount();
  }

  const value = Number(raw);

  if (value > props.max) {
    return rejectDrawCount(true);
  }

  if (value < props.min) {
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
    warnMaxDrawCount();
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
    <DeckTypeToggle v-model="deckType" :disabled="disabled" />

    <span class="draw-count-label" id="draw-count-label">抽牌數量</span>

    <div class="draw-dock">
      <DrawCountInput
        v-model="rawCount"
        :min="min"
        :max="max"
        aria-labelledby="draw-count-label"
        @blur="onCountBlur"
        @decrease="decreaseCount"
        @increase="increaseCount"
      />

      <span class="draw-dock-rule" aria-hidden="true" />

      <div ref="drawActionRef" class="draw-action">
        <DrawButton @click="onDrawClick" />
      </div>
    </div>

    <label class="skip-motion" :class="{ 'is-disabled': disabled }">
      <span class="skip-motion-label">跳過動畫</span>
      <SkipMotionSwitch v-model="skipMotion" :disabled="disabled" />
    </label>

    <button type="button" class="copy-result" @click="emit('copy')">
      <Copy class="copy-result-icon" :stroke-width="1.6" aria-hidden="true" />
      複製結果
    </button>
  </div>
</template>

<style scoped>
.draw-controls {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  margin-block: 0 0.15rem;
  gap: 0.7rem;
}

.draw-count-label {
  color: #d5cbe4;
  font-size: 0.72rem;
  letter-spacing: 0.32em;
}

.draw-dock {
  display: flex;
  align-items: center;
  padding: 0.28rem 0.28rem 0.28rem 0.2rem;
  border: 1px solid rgb(210 174 102 / 0.26);
  border-radius: 999px;
  background: rgb(12 6 20 / 0.5);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.04),
    0 18px 40px rgb(0 0 0 / 0.24);
  backdrop-filter: blur(12px);
}

.draw-dock-rule {
  width: 1px;
  height: 1.35rem;
  flex: 0 0 auto;
  margin-inline: 0.2rem 0.45rem;
  background: rgb(143 115 70 / 0.55);
}

.draw-action {
  display: flex;
}

.skip-motion {
  display: inline-flex;
  align-items: center;
  margin-top: 0.15rem;
  cursor: pointer;
  gap: 0.55rem;
  user-select: none;
}

.skip-motion.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.skip-motion-label {
  color: #d5cbe4;
  font-size: 0.72rem;
  letter-spacing: 0.28em;
}

.copy-result {
  display: inline-flex;
  align-items: center;
  height: 2.15rem;
  margin-top: 0.15rem;
  padding: 0 1.05rem;
  border: 1px solid rgb(210 174 102 / 0.38);
  border-radius: 999px;
  color: #e7c376;
  font-size: 0.82rem;
  letter-spacing: 0.22em;
  background: rgb(12 6 20 / 0.42);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.copy-result:hover,
.copy-result:focus-visible {
  border-color: rgb(231 195 118 / 0.8);
  color: #f4e3b2;
  background: rgb(28 16 42 / 0.72);
  outline: none;
}

.copy-result-icon {
  width: 0.95rem;
  height: 0.95rem;
  margin-right: 0.4rem;
}

@media (max-width: 760px) {
  .draw-controls {
    width: min(100%, 22rem);
  }

  .draw-dock {
    flex-direction: column;
    width: 100%;
    padding: 0.4rem;
    border-radius: 1.4rem;
    gap: 0.2rem;
  }

  .draw-dock-rule {
    width: 72%;
    height: 1px;
    margin: 0.2rem 0 0.15rem;
  }

  .draw-action {
    width: 100%;
  }
}
</style>
