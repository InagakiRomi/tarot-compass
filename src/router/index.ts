import DrawTarotView from "@/views/DrawTarotView.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "draw-tarot", component: DrawTarotView },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

export default router;
