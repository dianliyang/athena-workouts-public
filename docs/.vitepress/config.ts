import { defineConfig } from "vitepress";
import { ensureWorkoutPages, repoRoot } from "./workouts/workoutPageBuilder";

const sidebar = await ensureWorkoutPages();

export default defineConfig({
  title: "Sports in Kiel",
  lang: "en-US",
  description:
    "Static workouts catalog rendered from published workout snapshots.",
  lastUpdated: true,

  locales: {
    de: {
      label: "Deutsch",
      lang: "de-DE",
      link: "/de/",
      themeConfig: {
        siteTitle: false,
        search: { provider: "local" },
        docFooter: { prev: "Vorherige Seite", next: "Nächste Seite" },
        lastUpdated: { text: "Zuletzt aktualisiert" },
        outline: { label: "Auf dieser Seite" },
        socialLinks: [
          { icon: "github", link: "https://github.com/dianliyang/athena-workouts-public" },
        ],
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
        siteTitle: false,
        search: { provider: "local" },
        docFooter: { prev: "Previous page", next: "Next page" },
        lastUpdated: { text: "Last updated" },
        outline: { label: "On this page" },
        socialLinks: [
          { icon: "github", link: "https://github.com/dianliyang/athena-workouts-public" },
        ],
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
        siteTitle: false,
        search: { provider: "local" },
        docFooter: { prev: "前のページ", next: "次のページ" },
        lastUpdated: { text: "最終更新" },
        outline: { label: "このページ" },
        socialLinks: [
          { icon: "github", link: "https://github.com/dianliyang/athena-workouts-public" },
        ],
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
        siteTitle: false,
        search: { provider: "local" },
        docFooter: { prev: "이전 페이지", next: "다음 페이지" },
        lastUpdated: { text: "마지막 업데이트" },
        outline: { label: "이 페이지" },
        socialLinks: [
          { icon: "github", link: "https://github.com/dianliyang/athena-workouts-public" },
        ],
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
        siteTitle: false,
        search: { provider: "local" },
        docFooter: { prev: "上一页", next: "下一页" },
        lastUpdated: { text: "最后更新" },
        outline: { label: "本页内容" },
        socialLinks: [
          { icon: "github", link: "https://github.com/dianliyang/athena-workouts-public" },
        ],
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
    siteTitle: false,
    search: { provider: "local" },
    docFooter: { prev: "Previous page", next: "Next page" },
    lastUpdated: { text: "Last updated" },
    outline: { label: "On this page" },
    socialLinks: [
      { icon: "github", link: "https://github.com/dianliyang/athena-workouts-public" },
    ],
    nav: [
      { text: "Workout", link: "/en/workouts" },
      { text: "About", link: "/en/about" },
    ],
    sidebar: { "/en/workouts/": sidebar.en },
  },

  vite: {
    server: {
      fs: { allow: [repoRoot] },
    },
  },
});
