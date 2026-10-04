import DrawTarotView from "@/views/DrawTarotView.vue";
import HistoryView from "@/views/HistoryView.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "draw-tarot", component: DrawTarotView },
    { path: "/history", name: "history", component: HistoryView },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

export default router;
