<script setup lang="ts">
import { RouterLink } from "vue-router";

const links = [
  { to: "/", label: "抽牌" },
  { to: "/history", label: "歷史紀錄" },
];
</script>

<template>
  <header class="site-nav">
    <RouterLink to="/" class="site-nav-title">Tarot Compass</RouterLink>
    <nav class="site-nav-menu" aria-label="頁面">
      <ul class="site-nav-list">
        <li v-for="link in links" :key="link.to">
          <RouterLink :to="link.to" class="site-nav-link">
            {{ link.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
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
  min-width: 0;
  height: 100%;
  flex: 1 1 auto;
  overflow-x: auto;
  scrollbar-width: none;
}

.site-nav-menu::-webkit-scrollbar {
  display: none;
}

.site-nav-list {
  display: flex;
  width: max-content;
  min-width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  margin: 0;
  padding-inline: 0.75rem;
  list-style: none;
}

.site-nav-list li {
  flex: 0 0 auto;
}

.site-nav-link {
  position: relative;
  display: flex;
  height: var(--site-nav-height);
  align-items: center;
  justify-content: center;
  padding: 0 1.15rem;
  color: color-mix(in srgb, var(--tarot-text) 70%, var(--tarot-gold-dim));
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  white-space: nowrap;
  text-decoration: none;
  outline: none;
  transition: color 0.15s ease;
}

.site-nav-link:hover,
.site-nav-link:focus-visible {
  color: var(--tarot-gold-bright);
}

.site-nav-link.router-link-exact-active {
  color: var(--tarot-gold-bright);
}

.site-nav-link.router-link-exact-active::after {
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

  .site-nav-list {
    justify-content: flex-start;
    padding-inline: 0.35rem;
  }

  .site-nav-link {
    padding-inline: 0.9rem;
    letter-spacing: 0.06em;
  }
}
</style>
