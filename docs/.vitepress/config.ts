import { defineConfig } from "vitepress";
import { ensureWorkoutPages, repoRoot } from "./workouts/workoutPageBuilder";

const sidebar = await ensureWorkoutPages();

export default defineConfig({
  title: "Sports in Kiel",
  description:
    "Static workouts catalog rendered from the R2-backed workouts API.",
  lastUpdated: true,

  locales: {
    de: {
      label: "Deutsch",
      lang: "de-DE",
      link: "/de/",
      themeConfig: {
        docFooter: { prev: "Vorherige Seite", next: "Nächste Seite" },
        lastUpdated: { text: "Zuletzt aktualisiert" },
        nav: [
          { text: "Workout", link: "/de/workouts" },
          { text: "About", link: "/de/about" },
        ],
        sidebar: { "/de/workouts/": sidebar.de },
      },
    },

    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      themeConfig: {
        docFooter: { prev: "Previous page", next: "Next page" },
        lastUpdated: { text: "Last updated" },
        nav: [
          { text: "Workout", link: "/en/workouts" },
          { text: "About", link: "/en/about" },
        ],
        sidebar: { "/en/workouts/": sidebar.en },
      },
    },

    ja: {
      label: "日本語",
      lang: "ja-JP",
      link: "/ja/",
      themeConfig: {
        docFooter: { prev: "前のページ", next: "次のページ" },
        lastUpdated: { text: "最終更新" },
        nav: [
          { text: "ワークアウト", link: "/ja/workouts" },
          { text: "このサイトについて", link: "/ja/about" },
        ],
        sidebar: { "/ja/workouts/": sidebar.ja },
      },
    },

    ko: {
      label: "한국어",
      lang: "ko-KR",
      link: "/ko/",
      themeConfig: {
        docFooter: { prev: "이전 페이지", next: "다음 페이지" },
        lastUpdated: { text: "마지막 업데이트" },
        nav: [
          { text: "운동", link: "/ko/workouts" },
          { text: "소개", link: "/ko/about" },
        ],
        sidebar: { "/ko/workouts/": sidebar.ko },
      },
    },

    "zh-cn": {
      label: "简体中文",
      lang: "zh-CN",
      link: "/zh-cn/",
      themeConfig: {
        docFooter: { prev: "上一页", next: "下一页" },
        lastUpdated: { text: "最后更新" },
        nav: [
          { text: "运动", link: "/zh-cn/workouts" },
          { text: "关于", link: "/zh-cn/about" },
        ],
        sidebar: { "/zh-cn/workouts/": sidebar["zh-CN"] },
      },
    },
  },

  // The root locale theme config is repeated here as VitePress requires it
  // on the top-level themeConfig as well.
  themeConfig: {
    docFooter: { prev: "Vorherige Seite", next: "Nächste Seite" },
    lastUpdated: { text: "Zuletzt aktualisiert" },
    nav: [
      { text: "Workout", link: "/de/workouts" },
      { text: "About", link: "/de/about" },
    ],
    sidebar: { "/de/workouts/": sidebar.de },
  },

  vite: {
    server: {
      fs: { allow: [repoRoot] },
    },
  },
});
