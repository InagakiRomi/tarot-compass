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

/** 星星刻意避開畫面中央，讓牌陣區域留白。有 duration 的才會呼吸。 */
export const stars: BackdropStar[] = [
  { id: 1, tier: "primary", top: "9%", left: "7%", size: "16px", opacity: 0.85, delay: "0s", duration: "3.6s" },
  { id: 2, tier: "primary", top: "16%", left: "78%", size: "12px", opacity: 0.7, delay: "1.4s", duration: "5.4s" },
  { id: 3, tier: "primary", top: "72%", left: "11%", size: "14px", opacity: 0.75, delay: "0.6s", duration: "4.2s" },
  { id: 4, tier: "primary", top: "84%", left: "86%", size: "11px", opacity: 0.62, delay: "2.1s", duration: "6.2s" },

  { id: 5, tier: "secondary", top: "6%", left: "22%", size: "7px", opacity: 0.5, delay: "0.3s", duration: "4.8s" },
  { id: 6, tier: "secondary", top: "13%", left: "41%", size: "5px", opacity: 0.38, delay: "1.8s" },
  { id: 7, tier: "secondary", top: "22%", left: "91%", size: "6px", opacity: 0.46, delay: "0.9s", duration: "3.4s" },
  { id: 8, tier: "secondary", top: "31%", left: "4%", size: "5px", opacity: 0.4, delay: "2.4s" },
  { id: 9, tier: "secondary", top: "58%", left: "96%", size: "6px", opacity: 0.42, delay: "1.1s" },
  { id: 10, tier: "secondary", top: "67%", left: "3%", size: "5px", opacity: 0.36, delay: "0.2s" },
  { id: 11, tier: "secondary", top: "79%", left: "28%", size: "7px", opacity: 0.48, delay: "1.6s", duration: "5.8s" },
  { id: 12, tier: "secondary", top: "88%", left: "62%", size: "5px", opacity: 0.34, delay: "2.6s" },
  { id: 13, tier: "secondary", top: "27%", left: "86%", size: "4px", opacity: 0.4, delay: "0.7s", duration: "4.5s" },
  { id: 14, tier: "secondary", top: "93%", left: "18%", size: "6px", opacity: 0.32, delay: "1.9s" },
  { id: 15, tier: "secondary", top: "4%", left: "58%", size: "4px", opacity: 0.3, delay: "2.2s" },
  { id: 16, tier: "secondary", top: "48%", left: "2%", size: "5px", opacity: 0.28, delay: "0.5s" },

  { id: 17, tier: "dust", top: "8%", left: "14%", size: "2px", opacity: 0.28, delay: "0s" },
  { id: 18, tier: "dust", top: "11%", left: "33%", size: "1px", opacity: 0.2, delay: "1s" },
  { id: 19, tier: "dust", top: "18%", left: "63%", size: "2px", opacity: 0.22, delay: "0.4s" },
  { id: 20, tier: "dust", top: "7%", left: "88%", size: "1px", opacity: 0.18, delay: "1.5s" },
  { id: 21, tier: "dust", top: "24%", left: "12%", size: "2px", opacity: 0.24, delay: "2s" },
  { id: 22, tier: "dust", top: "21%", left: "94%", size: "1px", opacity: 0.16, delay: "0.8s" },
  { id: 23, tier: "dust", top: "34%", left: "8%", size: "2px", opacity: 0.2, delay: "1.2s" },
  { id: 24, tier: "dust", top: "39%", left: "97%", size: "1px", opacity: 0.15, delay: "2.3s" },
  { id: 25, tier: "dust", top: "52%", left: "6%", size: "2px", opacity: 0.18, delay: "0.6s" },
  { id: 26, tier: "dust", top: "61%", left: "93%", size: "2px", opacity: 0.2, delay: "1.7s" },
  { id: 27, tier: "dust", top: "69%", left: "9%", size: "1px", opacity: 0.16, delay: "0.1s" },
  { id: 28, tier: "dust", top: "74%", left: "21%", size: "2px", opacity: 0.22, delay: "2.5s" },
  { id: 29, tier: "dust", top: "81%", left: "8%", size: "1px", opacity: 0.14, delay: "1.3s" },
  { id: 30, tier: "dust", top: "86%", left: "38%", size: "2px", opacity: 0.18, delay: "0.9s" },
  { id: 31, tier: "dust", top: "91%", left: "74%", size: "1px", opacity: 0.16, delay: "1.8s" },
  { id: 32, tier: "dust", top: "77%", left: "92%", size: "2px", opacity: 0.2, delay: "0.3s" },
  { id: 33, tier: "dust", top: "15%", left: "52%", size: "1px", opacity: 0.12, delay: "2.1s" },
  { id: 34, tier: "dust", top: "95%", left: "48%", size: "2px", opacity: 0.14, delay: "1.1s" },
  { id: 35, tier: "dust", top: "28%", left: "73%", size: "1px", opacity: 0.15, delay: "0.5s" },
  { id: 36, tier: "dust", top: "43%", left: "89%", size: "2px", opacity: 0.12, delay: "1.6s" },
  { id: 37, tier: "dust", top: "5%", left: "71%", size: "1px", opacity: 0.18, delay: "2.4s" },
  { id: 38, tier: "dust", top: "64%", left: "17%", size: "1px", opacity: 0.14, delay: "0.7s" },
  { id: 39, tier: "dust", top: "89%", left: "93%", size: "2px", opacity: 0.16, delay: "1.4s" },
  { id: 40, tier: "dust", top: "12%", left: "4%", size: "1px", opacity: 0.2, delay: "2.2s" },
  { id: 41, tier: "dust", top: "46%", left: "95%", size: "1px", opacity: 0.12, delay: "0.2s" },
  { id: 42, tier: "dust", top: "97%", left: "27%", size: "2px", opacity: 0.13, delay: "1.9s" },
];
