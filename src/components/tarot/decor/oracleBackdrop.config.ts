export type BackdropStar = {
  id: number;
  tier: "primary" | "secondary" | "dust";
  top: string;
  left: string;
  size: string;
  opacity: number;
  delay: string;
  duration?: string;
};

export const orbits = ["a", "b", "c", "d", "e", "f"] as const;

/**
 * 星星只落在三個區域：左上、月亮旁、左下。
 * 中央牌陣留白。有 duration 的才會呼吸。
 */
export const stars: BackdropStar[] = [
  { id: 1, tier: "primary", top: "11%", left: "8%", size: "13px", opacity: 0.72, delay: "0s", duration: "4.2s" },
  { id: 2, tier: "secondary", top: "8%", left: "14%", size: "6px", opacity: 0.4, delay: "1.2s", duration: "5.1s" },
  { id: 3, tier: "secondary", top: "16%", left: "5%", size: "5px", opacity: 0.34, delay: "0.4s" },
  { id: 4, tier: "dust", top: "7%", left: "10%", size: "2px", opacity: 0.22, delay: "0.8s" },
  { id: 5, tier: "dust", top: "14%", left: "12%", size: "2px", opacity: 0.18, delay: "1.6s" },
  { id: 6, tier: "dust", top: "18%", left: "7%", size: "1px", opacity: 0.16, delay: "2.1s" },

  { id: 7, tier: "primary", top: "13%", left: "84%", size: "11px", opacity: 0.58, delay: "1.1s", duration: "5.6s" },
  { id: 8, tier: "secondary", top: "8%", left: "76%", size: "5px", opacity: 0.36, delay: "0.6s" },
  { id: 9, tier: "secondary", top: "19%", left: "90%", size: "6px", opacity: 0.32, delay: "2.2s", duration: "4.4s" },
  { id: 10, tier: "dust", top: "10%", left: "80%", size: "2px", opacity: 0.18, delay: "0.2s" },
  { id: 11, tier: "dust", top: "16%", left: "78%", size: "1px", opacity: 0.14, delay: "1.4s" },
  { id: 12, tier: "dust", top: "22%", left: "86%", size: "2px", opacity: 0.16, delay: "2.6s" },

  { id: 13, tier: "primary", top: "78%", left: "9%", size: "12px", opacity: 0.55, delay: "0.7s", duration: "4.8s" },
  { id: 14, tier: "secondary", top: "84%", left: "15%", size: "6px", opacity: 0.34, delay: "1.8s" },
  { id: 15, tier: "secondary", top: "73%", left: "5%", size: "5px", opacity: 0.28, delay: "0.3s", duration: "6s" },
  { id: 16, tier: "dust", top: "76%", left: "13%", size: "2px", opacity: 0.16, delay: "1.1s" },
  { id: 17, tier: "dust", top: "82%", left: "7%", size: "1px", opacity: 0.14, delay: "2.4s" },
  { id: 18, tier: "dust", top: "86%", left: "18%", size: "2px", opacity: 0.15, delay: "0.9s" },
];
