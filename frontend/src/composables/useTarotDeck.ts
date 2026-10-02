import tarotBack from "@/assets/tarot/tarotBack.jpg";

/** 引入所有塔羅牌 */
const tarotModules = import.meta.glob("@/assets/tarot/tarot*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

/** 排除背面牌，只保留正面的塔羅牌 */
const deck = Object.entries(tarotModules)
  .filter(([path]) => !path.endsWith("tarotBack.jpg"))
  .map(([, src]) => src);

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
  function draw(count: number): string[] {
    if (count <= 0) {
      return [];
    }

    // 洗牌後，取出指定數量的塔羅牌
    return shuffle(deck).slice(0, count);
  }

  return {
    tarotBack,
    draw,
  };
}
