import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, toRefs, watch } from "vue";

import type { DeckType } from "@/components/tarot/draw/DeckTypeToggle.vue";
import { tarotCards, type TarotCard } from "@/composables/useTarotDeck";

const STORAGE_KEY = "tarot-compass.draw";
const MIN_DRAW_COUNT = 1;
const DEFAULT_COUNT = 5;

interface DrawnSlot {
  cardId: number;
  reversed: boolean;
}

interface DrawSnapshot {
  deckType: DeckType;
  drawCount: number;
  skipMotion: boolean;
  slots: (DrawnSlot | null)[];
}

const cardById = new Map(tarotCards.map((card) => [card.cardId, card]));

function maxFor(deckType: DeckType) {
  return deckType === "major" ? 22 : 78;
}

function emptySlots(count: number): (DrawnSlot | null)[] {
  return Array.from({ length: count }, () => null);
}

function isDeckType(value: unknown): value is DeckType {
  return value === "major" || value === "minor";
}

function toCard(slot: DrawnSlot | null): TarotCard | null {
  if (!slot) {
    return null;
  }

  const card = cardById.get(slot.cardId);

  if (!card) {
    return null;
  }

  return {
    ...card,
    reversed: slot.reversed,
  };
}

function createDefaultSnapshot(): DrawSnapshot {
  return {
    deckType: "minor",
    drawCount: DEFAULT_COUNT,
    skipMotion: false,
    slots: emptySlots(DEFAULT_COUNT),
  };
}

function normalizeSnapshot(value: unknown): DrawSnapshot {
  const fallback = createDefaultSnapshot();

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const data = value as Partial<DrawSnapshot>;
  const deckType = isDeckType(data.deckType) ? data.deckType : fallback.deckType;
  const max = maxFor(deckType);
  const count = Number(data.drawCount);
  const drawCount = Number.isInteger(count)
    ? Math.min(max, Math.max(MIN_DRAW_COUNT, count))
    : DEFAULT_COUNT;
  const incoming = Array.isArray(data.slots) ? data.slots : [];
  const slots = Array.from({ length: drawCount }, (_, index) => {
    const slot = incoming[index];

    if (!slot || typeof slot !== "object") {
      return null;
    }

    const cardId = Number(slot.cardId);

    if (!cardById.has(cardId)) {
      return null;
    }

    return {
      cardId,
      reversed: Boolean(slot.reversed),
    };
  });

  return {
    deckType,
    drawCount,
    skipMotion: Boolean(data.skipMotion),
    slots,
  };
}

export const useDrawStore = defineStore("draw", () => {
  const snapshot = useLocalStorage<DrawSnapshot>(STORAGE_KEY, createDefaultSnapshot(), {
    listenToStorageChanges: false,
    writeDefaults: false,
    serializer: {
      read: (raw) => {
        try {
          return normalizeSnapshot(JSON.parse(raw));
        } catch {
          return createDefaultSnapshot();
        }
      },
      write: JSON.stringify,
    },
  });
  const { deckType, drawCount, skipMotion, slots } = toRefs(snapshot.value);

  const maxDrawCount = computed(() => maxFor(deckType.value));

  const cards = computed<(TarotCard | null)[]>({
    get: () => slots.value.map(toCard),
    set: (next) => {
      slots.value = next.map((card) =>
        card
          ? {
              cardId: card.cardId,
              reversed: Boolean(card.reversed),
            }
          : null,
      );
    },
  });

  watch(deckType, () => {
    if (drawCount.value > maxDrawCount.value) {
      drawCount.value = maxDrawCount.value;
    }
  });

  return {
    deckType,
    drawCount,
    skipMotion,
    cards,
    maxDrawCount,
  };
});
