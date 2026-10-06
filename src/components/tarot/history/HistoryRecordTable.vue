<script setup lang="ts">
import { Copy } from "@lucide/vue";

import type { DrawHistoryRecord } from "@/stores/history";

defineProps<{
  records: DrawHistoryRecord[];
}>();

const emit = defineEmits<{
  copy: [record: DrawHistoryRecord];
}>();

const drawnAtFormat = new Intl.DateTimeFormat("zh-TW", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function formatDrawnAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return drawnAtFormat.format(date);
}

function cardLabel(card: DrawHistoryRecord["cards"][number]) {
  return `${card.cardName}${card.reversed ? "逆位" : "正位"}`;
}
</script>

<template>
  <div class="history-table" data-slot="table-container">
    <table data-slot="table">
      <thead data-slot="table-header">
        <tr data-slot="table-row">
          <th data-slot="table-head" class="history-col-time">時間</th>
          <th data-slot="table-head" class="history-col-names">牌名</th>
          <th data-slot="table-head" class="history-col-count">數量</th>
          <th data-slot="table-head" class="history-col-action">
            <span class="sr-only">複製</span>
          </th>
        </tr>
      </thead>
      <tbody data-slot="table-body">
        <tr v-if="records.length === 0" data-slot="table-row">
          <td data-slot="table-cell" colspan="4">
            <div class="history-empty">還沒有抽牌紀錄</div>
          </td>
        </tr>
        <tr v-for="record in records" :key="record.id" data-slot="table-row">
          <td data-slot="table-cell" class="history-col-time">{{
            formatDrawnAt(record.drawnAt)
          }}</td>
          <td data-slot="table-cell" class="history-col-names">
            <ul class="history-names">
              <li
                v-for="(card, index) in record.cards"
                :key="`${record.id}-${card.cardId}-${index}`"
              >
                {{ cardLabel(card) }}
              </li>
            </ul>
          </td>
          <td data-slot="table-cell" class="history-col-count">{{ record.count }}</td>
          <td data-slot="table-cell" class="history-col-action">
            <button
              type="button"
              class="history-copy"
              @click="emit('copy', record)"
            >
              <Copy
                class="history-copy-icon"
                :stroke-width="1.6"
                aria-hidden="true"
              />
              複製
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.history-table {
  overflow: auto;
}

.history-table :deep([data-slot="table"]) {
  width: 100%;
  min-width: 36rem;
  border-collapse: collapse;
  color: var(--tarot-text);
  font-size: var(--font-size-body);
}

.history-table :deep([data-slot="table-header"]) {
  background: rgb(210 174 102 / 0.08);
}

.history-table :deep([data-slot="table-row"]) {
  border-color: rgb(210 174 102 / 0.22);
  transition: background-color 0.15s ease;
}

.history-table :deep([data-slot="table-row"]:hover) {
  background: rgb(210 174 102 / 0.08);
}

.history-table :deep([data-slot="table-head"]),
.history-table :deep([data-slot="table-cell"]) {
  border: 1px solid rgb(210 174 102 / 0.28);
}

.history-table :deep([data-slot="table-head"]) {
  height: 2.75rem;
  padding: 0.7rem 0.95rem;
  color: var(--tarot-gold-light);
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-align: center;
}

.history-table :deep([data-slot="table-cell"]) {
  padding: 0.85rem 0.95rem;
  color: var(--tarot-text);
  white-space: normal;
  vertical-align: top;
}

.history-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-block: 2.5rem;
  white-space: nowrap;
}

.history-col-time {
  width: 7.5rem;
  white-space: nowrap;
}

.history-col-count {
  width: 4.5rem;
  text-align: center;
}

.history-col-action {
  width: 6.5rem;
}

.history-table :deep([data-slot="table-cell"].history-col-action) {
  text-align: right;
}

.history-names {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  gap: 0.35rem 0.85rem;
  list-style: none;
}

.history-names li {
  letter-spacing: 0.04em;
  line-height: 1.55;
}

.history-copy {
  display: inline-flex;
  flex-shrink: 0;
  white-space: nowrap;
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
}

.history-copy:hover,
.history-copy:focus-visible {
  border-color: rgb(231 195 118 / 0.72);
  color: var(--tarot-gold-bright);
  background: rgb(22 12 36 / 0.45);
  outline: none;
}

.history-copy-icon {
  width: 15px;
  height: 15px;
  margin-right: 0.35rem;
  flex: 0 0 auto;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
