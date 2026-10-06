import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

const STORAGE_KEY = "tarot-compass.history";
export const MAX_HISTORY_RECORDS = 10;

export interface HistoryCard {
  cardId: number;
  cardName: string;
  reversed: boolean;
}

export interface DrawHistoryRecord {
  id: string;
  drawnAt: string;
  count: number;
  cards: HistoryCard[];
}

function isCard(value: unknown): value is HistoryCard {
  if (!value || typeof value !== "object") {
    return false;
  }

  const card = value as Partial<HistoryCard>;
  const cardId = Number(card.cardId);

  return Number.isInteger(cardId) && typeof card.cardName === "string" && card.cardName.length > 0;
}

function toCard(value: HistoryCard): HistoryCard {
  return {
    cardId: Number(value.cardId),
    cardName: value.cardName,
    reversed: Boolean(value.reversed),
  };
}

function normalizeRecords(value: unknown): DrawHistoryRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Partial<DrawHistoryRecord>;

      if (typeof record.id !== "string" || typeof record.drawnAt !== "string") {
        return null;
      }

      const cards = Array.isArray(record.cards) ? record.cards.filter(isCard).map(toCard) : [];

      if (cards.length === 0) {
        return null;
      }

      return {
        id: record.id,
        drawnAt: record.drawnAt,
        count: cards.length,
        cards,
      };
    })
    .filter((record): record is DrawHistoryRecord => record !== null)
    .slice(0, MAX_HISTORY_RECORDS);
}

export const useHistoryStore = defineStore("history", () => {
  const records = useLocalStorage<DrawHistoryRecord[]>(STORAGE_KEY, [], {
    listenToStorageChanges: false,
    writeDefaults: false,
    serializer: {
      read: (raw) => {
        try {
          return normalizeRecords(JSON.parse(raw));
        } catch {
          return [];
        }
      },
      write: JSON.stringify,
    },
  });

  function recordDraw(cards: HistoryCard[]) {
    const nextCards = cards.filter(isCard).map(toCard);

    if (nextCards.length === 0) {
      return;
    }

    const entry: DrawHistoryRecord = {
      id: crypto.randomUUID(),
      drawnAt: new Date().toISOString(),
      count: nextCards.length,
      cards: nextCards,
    };

    records.value = [entry, ...records.value].slice(0, MAX_HISTORY_RECORDS);
  }

  function clearHistory() {
    records.value = [];
  }

  return {
    records,
    recordDraw,
    clearHistory,
  };
});
