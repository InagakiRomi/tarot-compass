import tarotData from "@/assets/data/tarot.json";

/** 塔羅牌資料類型 */
export interface TarotCard {
  cardId: number;
  cardName: string;
  cardUrl: string;
  imageSrc: string;
}

/** 塔羅牌資料原始資料 */
interface TarotRecord {
  cardId: number;
  cardName: string;
  cardUrl: string;
}

/** 牌面檔名對應打包後的圖片位址，牌組本身以 JSON 為準 */
const imageModules = import.meta.glob("@/assets/tarot/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

/** 牌面檔名對應打包後的圖片位址 */
const imageByFileName = new Map(
  Object.entries(imageModules).map(([path, src]) => {
    const fileName = path.split(/[/\\]/).pop() ?? "";
    return [fileName, src] as const;
  }),
);

/** 將原始資料轉換為塔羅牌資料 */
function toCard(record: TarotRecord): TarotCard {
  return {
    cardId: record.cardId,
    cardName: record.cardName,
    cardUrl: record.cardUrl,
    imageSrc: imageByFileName.get(record.cardUrl) ?? "",
  };
}

/** 轉換後的塔羅牌資料 */
const cards = (tarotData as TarotRecord[]).map(toCard);

/** 取得牌背 */
function requireBackCard(records: TarotCard[]): TarotCard {
  const card = records.find((item) => item.cardUrl === "tarotBack.jpg");

  if (!card) {
    throw new Error("tarot.json 缺少牌背");
  }

  return card;
}

/** 牌背 */
const backCard = requireBackCard(cards);

/** 可抽出的牌：排除牌背與沒有牌名的資料 */
const deck = cards.filter(
  (card) => card.cardUrl !== "tarotBack.jpg" && card.cardName.length > 0,
);

/** 洗牌 */
function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const current = shuffled[i];
    const target = shuffled[j];

    if (current === undefined || target === undefined) {
      continue;
    }

    shuffled[i] = target;
    shuffled[j] = current;
  }

  return shuffled;
}

/** 抽牌 */
export function useTarotDeck() {
  /** 抽指定數量的塔羅牌 */
  function draw(count: number): TarotCard[] {
    if (count <= 0) {
      return [];
    }

    return shuffle(deck).slice(0, count);
  }

  return {
    backCard,
    deckSize: deck.length,
    draw,
  };
}
