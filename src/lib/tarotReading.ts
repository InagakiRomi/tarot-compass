export interface TarotReadingCard {
  cardName: string;
  reversed?: boolean;
}

export function formatTarotCard(card: TarotReadingCard) {
  return `${card.cardName}${card.reversed ? "逆位" : "正位"}`;
}

export function formatTarotReading(cards: readonly TarotReadingCard[]) {
  return cards.map(formatTarotCard).join("\n");
}
