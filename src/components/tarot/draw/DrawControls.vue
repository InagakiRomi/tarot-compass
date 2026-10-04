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
  canCopy?: boolean;
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
  <div class="draw-stage">
    <div class="stage-settings">
      <DeckTypeToggle v-model="deckType" :disabled="disabled" />

      <label class="skip-motion" :class="{ 'is-disabled': disabled }">
        <span class="skip-motion-label">跳過動畫</span>
        <SkipMotionSwitch v-model="skipMotion" :disabled="disabled" />
      </label>
    </div>

    <div v-if="canCopy" class="stage-header">
      <button
        v-if="canCopy"
        type="button"
        class="copy-result"
        @click="emit('copy')"
      >
        <Copy class="copy-result-icon" :stroke-width="1.6" aria-hidden="true" />
        複製結果
      </button>
    </div>

    <div class="stage-spread">
      <slot />
    </div>

    <div class="stage-actions">
      <div class="count-field">
        <span class="count-label" id="draw-count-label">抽牌數量</span>
        <div class="count-stepper">
          <DrawCountInput
            v-model="rawCount"
            :min="min"
            :max="max"
            aria-labelledby="draw-count-label"
            @blur="onCountBlur"
            @decrease="decreaseCount"
            @increase="increaseCount"
          />
        </div>
      </div>

      <div ref="drawActionRef" class="draw-action">
        <DrawButton label="抽牌" @click="onDrawClick" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.draw-stage {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
}

.stage-settings {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.25rem;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem 1.25rem;
  min-height: 2rem;
  margin-top: 1.35rem;
}

.stage-spread {
  width: 100%;
  min-width: 0;
  margin-top: 1.15rem;
}

.stage-actions {
  display: flex;
  width: min(720px, 100%);
  align-items: flex-end;
  justify-content: space-between;
  margin-inline: auto;
  margin-top: 56px;
  gap: 1.5rem;
}

.count-field {
  display: flex;
  width: min(20rem, 48%);
  min-width: 13.75rem;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.38rem;
}

.count-label {
  color: rgb(228 218 242 / 0.9);
  font-size: var(--font-size-label);
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0.08em;
}

.count-stepper {
  width: 100%;
  border: 1px solid rgb(210 174 102 / 0.28);
  border-radius: 14px;
  background: rgb(16 8 27 / 0.38);
}

.draw-action {
  display: flex;
  flex: 0 0 auto;
}

.skip-motion {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  margin-left: auto;
  cursor: pointer;
  gap: 8px;
  user-select: none;
}

.skip-motion.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.skip-motion-label {
  color: rgb(228 218 242 / 0.92);
  font-size: var(--font-size-label);
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0.04em;
}

.copy-result {
  display: inline-flex;
  align-items: center;
  height: 2rem;
  padding: 0 0.85rem;
  border: 1px solid rgb(210 174 102 / 0.32);
  border-radius: 999px;
  color: rgb(231 195 118 / 0.92);
  font-size: var(--font-size-label);
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.06em;
  background: transparent;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.copy-result:hover,
.copy-result:focus-visible {
  border-color: rgb(231 195 118 / 0.72);
  color: #f4e3b2;
  background: rgb(22 12 36 / 0.45);
  outline: none;
}

.copy-result-icon {
  width: 15px;
  height: 15px;
  margin-right: 0.4rem;
  flex: 0 0 auto;
}

@media (max-width: 720px) {
  .stage-settings {
    flex-wrap: wrap;
    align-items: center;
    row-gap: 0.55rem;
  }

  .stage-header {
    margin-top: 1rem;
  }

  .stage-spread {
    margin-top: 1rem;
  }

  .stage-actions {
    flex-direction: column;
    align-items: stretch;
    margin-top: 48px;
    gap: 0.9rem;
  }

  .count-field {
    width: 100%;
    min-width: 0;
  }

  .draw-action {
    width: 100%;
  }
}
</style>
