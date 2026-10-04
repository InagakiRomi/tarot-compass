<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute, type RouteLocationRaw } from "vue-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

type NavLink = {
  name: string;
  to: RouteLocationRaw;
  label: string;
};

const route = useRoute();

const links: NavLink[] = [
  { name: "draw-tarot", to: { name: "draw-tarot" }, label: "抽牌" },
  { name: "history", to: { name: "history" }, label: "歷史紀錄" },
];

const activeName = computed(() => route.name);
</script>

<template>
  <header class="site-nav">
    <RouterLink :to="{ name: 'draw-tarot' }" class="site-nav-title">Tarot Compass</RouterLink>
    <NavigationMenu :viewport="false" class="site-nav-menu" aria-label="頁面">
      <NavigationMenuList class="site-nav-list">
        <NavigationMenuItem v-for="link in links" :key="link.name">
          <NavigationMenuLink as-child :active="activeName === link.name">
            <RouterLink :to="link.to" class="site-nav-link">
              {{ link.label }}
            </RouterLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
    <span class="site-nav-balance" aria-hidden="true">Tarot Compass</span>
  </header>
</template>

<style scoped>
.site-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  width: 100%;
  height: var(--site-nav-height);
  border-bottom: 1px solid color-mix(in srgb, var(--tarot-gold) 42%, transparent);
  background: color-mix(in srgb, var(--bg-dark) 86%, transparent);
  box-shadow: 0 10px 28px rgb(8 4 16 / 0.28);
  backdrop-filter: blur(16px);
}

.site-nav-title,
.site-nav-balance {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  padding-inline: 1.35rem;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  white-space: nowrap;
}

.site-nav-title {
  background: linear-gradient(180deg, var(--tarot-gold-bright) 0%, var(--tarot-gold) 100%);
  background-clip: text;
  color: transparent;
  text-decoration: none;
}

.site-nav-title:hover,
.site-nav-title:focus-visible {
  background: linear-gradient(180deg, #fff8e8 0%, var(--tarot-gold-light) 100%);
  background-clip: text;
  color: transparent;
  outline: none;
}

.site-nav-balance {
  visibility: hidden;
  pointer-events: none;
}

.site-nav-menu {
  width: auto;
  max-width: none;
  min-width: 0;
  height: 100%;
  flex: 1 1 auto;
}

.site-nav :deep([data-slot="navigation-menu"] > *) {
  width: 100%;
  min-width: 0;
  height: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}

.site-nav :deep([data-slot="navigation-menu"] > *)::-webkit-scrollbar {
  display: none;
}

.site-nav :deep([data-slot="navigation-menu-list"]) {
  width: max-content;
  min-width: 100%;
  height: 100%;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 0.15rem;
  margin: 0;
  padding-inline: 0.75rem;
}

.site-nav :deep([data-slot="navigation-menu-item"]) {
  flex: 0 0 auto;
}

.site-nav :deep([data-slot="navigation-menu-link"]) {
  position: relative;
  height: var(--site-nav-height);
  justify-content: center;
  padding: 0 1.15rem;
  border-radius: 0;
  background: transparent;
  color: color-mix(in srgb, var(--tarot-text) 70%, var(--tarot-gold-dim));
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  white-space: nowrap;
  text-decoration: none;
  outline: none;
  box-shadow: none;
}

.site-nav :deep([data-slot="navigation-menu-link"]:hover),
.site-nav :deep([data-slot="navigation-menu-link"]:focus-visible) {
  background: transparent;
  color: var(--tarot-gold-bright);
}

.site-nav :deep([data-slot="navigation-menu-link"][data-active]),
.site-nav :deep([data-slot="navigation-menu-link"][data-active]:hover),
.site-nav :deep([data-slot="navigation-menu-link"][data-active]:focus-visible) {
  background: transparent;
  color: var(--tarot-gold-bright);
  box-shadow: none;
}

.site-nav :deep([data-slot="navigation-menu-link"][data-active])::after {
  content: "";
  position: absolute;
  right: 1rem;
  bottom: 0.42rem;
  left: 1rem;
  height: 2px;
  border-radius: 999px;
  background: var(--tarot-gold-light);
  box-shadow: 0 0 10px color-mix(in srgb, var(--tarot-gold-light) 75%, transparent);
}

@media (max-width: 760px) {
  .site-nav-balance {
    display: none;
  }

  .site-nav-title,
  .site-nav-balance {
    padding-inline: 0.85rem;
    letter-spacing: 0.08em;
  }

  .site-nav :deep([data-slot="navigation-menu-list"]) {
    justify-content: flex-start;
    padding-inline: 0.35rem;
  }

  .site-nav :deep([data-slot="navigation-menu-link"]) {
    padding-inline: 0.9rem;
    letter-spacing: 0.06em;
  }
}
</style>
