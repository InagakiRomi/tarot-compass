<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { storeToRefs } from "pinia";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "reka-ui";
import { toast } from "vue-sonner";

import OracleBackdrop from "@/components/tarot/decor/OracleBackdrop.vue";
import PageOrnament from "@/components/tarot/decor/PageOrnament.vue";
import HistoryRecordTable from "@/components/tarot/history/HistoryRecordTable.vue";
import { formatTarotReading } from "@/lib/tarotReading";
import {
  MAX_HISTORY_RECORDS,
  useHistoryStore,
  type DrawHistoryRecord,
} from "@/stores/history";

const historyStore = useHistoryStore();
const { records } = storeToRefs(historyStore);
const { copy } = useClipboard({ legacy: true });

async function copyRecord(record: DrawHistoryRecord) {
  try {
    await copy(formatTarotReading(record.cards));
    toast.success("已複製抽牌結果");
  } catch {
    toast.error("複製失敗，請再試一次");
  }
}

function confirmClear() {
  if (records.value.length === 0) {
    return;
  }

  historyStore.clearHistory();
  toast.success("已清除歷史紀錄");
}
</script>

<template>
  <main class="history-page">
    <OracleBackdrop>
      <div class="history-layout">
        <header class="history-heading">
          <p class="history-heading-en">History</p>
          <h1 class="history-heading-title">歷史紀錄</h1>
          <p class="history-heading-note">
            最近{{ MAX_HISTORY_RECORDS }}次抽牌會留在這台裝置上
          </p>
        </header>
        <PageOrnament />

        <section class="history-board" aria-label="抽牌歷史">
          <HistoryRecordTable :records="records" @copy="copyRecord" />
          <div class="history-actions">
            <AlertDialogRoot>
              <AlertDialogTrigger
                class="history-clear"
                :disabled="records.length === 0"
              >
                清除紀錄
              </AlertDialogTrigger>
              <AlertDialogPortal>
                <AlertDialogOverlay class="history-confirm-overlay" />
                <AlertDialogContent class="history-confirm">
                  <AlertDialogTitle class="history-confirm-title">
                    清除紀錄
                  </AlertDialogTitle>
                  <AlertDialogDescription class="history-confirm-note">
                    刪除後無法復原，這台裝置上的抽牌紀錄都會消失
                  </AlertDialogDescription>
                  <div class="history-confirm-actions">
                    <AlertDialogCancel class="history-confirm-cancel">
                      取消
                    </AlertDialogCancel>
                    <AlertDialogAction
                      class="history-confirm-ok"
                      @click="confirmClear"
                    >
                      確認清除
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialogPortal>
            </AlertDialogRoot>
          </div>
        </section>
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

.history-heading-note {
  width: min(28rem, calc(100vw - 4.5rem));
  margin: 0.35rem 0 0;
  color: var(--text-muted, #afa4c1);
  font-size: calc(0.92rem + 2px);
  letter-spacing: 0.06em;
  line-height: 1.6;
}

.history-board {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-top: 0.85rem;
  padding: 1.15rem 1.15rem 1.25rem;
  border: 1px solid rgb(210 174 102 / 0.32);
  border-radius: 22px;
  background:
    radial-gradient(circle at 50% 0%, rgb(132 84 180 / 0.12), transparent 48%),
    rgb(16 8 27 / 0.48);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.04),
    0 30px 80px rgb(0 0 0 / 0.28);
}

.history-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.15rem;
}

.history-clear {
  height: 2.5rem;
  padding: 0 1.35rem;
  border: 1px solid rgb(210 174 102 / 0.4);
  border-radius: 999px;
  color: var(--tarot-gold-light);
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.12em;
  background: rgb(16 8 27 / 0.35);
  cursor: pointer;
}

.history-clear:hover,
.history-clear:focus-visible {
  border-color: rgb(231 195 118 / 0.72);
  color: var(--tarot-gold-bright);
  background: rgb(22 12 36 / 0.55);
  outline: none;
}

.history-clear:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.history-confirm-overlay {
  position: fixed;
  z-index: 50;
  inset: 0;
  background: rgb(6 2 12 / 0.72);
}

.history-confirm {
  position: fixed;
  z-index: 51;
  top: 50%;
  left: 50%;
  display: flex;
  width: min(28rem, calc(100vw - 2rem));
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.35rem 1.25rem 1.2rem;
  border: 1px solid rgb(210 174 102 / 0.4);
  border-radius: 22px;
  background:
    radial-gradient(circle at 50% 0%, rgb(132 84 180 / 0.16), transparent 52%),
    rgb(16 8 27 / 0.96);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.04),
    0 30px 80px rgb(0 0 0 / 0.45);
  transform: translate(-50%, -50%);
}

.history-confirm:focus {
  outline: none;
}

.history-confirm-title {
  margin: 0;
  color: var(--tarot-gold-light);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-align: center;
  text-indent: 0.18em;
}

.history-confirm-note {
  margin: 0;
  color: var(--text-muted, #afa4c1);
  font-size: calc(0.92rem + 2px);
  letter-spacing: 0.04em;
  line-height: 1.7;
  text-align: center;
}

.history-confirm-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.35rem;
}

.history-confirm-cancel,
.history-confirm-ok {
  height: 2.5rem;
  padding: 0 1.2rem;
  border-radius: 999px;
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.1em;
  cursor: pointer;
}

.history-confirm-cancel {
  border: 1px solid rgb(210 174 102 / 0.32);
  color: var(--tarot-gold-light);
  background: transparent;
}

.history-confirm-cancel:hover,
.history-confirm-cancel:focus-visible,
.history-confirm-ok:hover,
.history-confirm-ok:focus-visible {
  outline: none;
}

.history-confirm-cancel:hover,
.history-confirm-cancel:focus-visible {
  border-color: rgb(231 195 118 / 0.72);
  color: var(--tarot-gold-bright);
}

.history-confirm-ok {
  border: 1px solid rgb(231 195 118 / 0.72);
  color: rgb(28 16 8);
  background: linear-gradient(
    180deg,
    var(--tarot-gold-bright),
    var(--tarot-gold)
  );
}

.history-confirm-ok:hover,
.history-confirm-ok:focus-visible {
  filter: brightness(1.06);
}
</style>
