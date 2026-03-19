<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import PrevNextKeyboardHints from "./PrevNextKeyboardHints.vue";
import SportKielLogo from "./SportKielLogo.vue";
import { resolveSnapshotLastModified } from "./snapshotLastModified";

const { Layout } = DefaultTheme;
const { frontmatter, lang } = useData();

const snapshotLastModified = computed(() => {
  const locale =
    lang.value === "de-DE"
      ? "de"
      : lang.value === "ja-JP"
        ? "ja"
        : lang.value === "ko-KR"
          ? "ko"
          : lang.value === "zh-CN"
            ? "zh-CN"
            : "en";

  return resolveSnapshotLastModified(locale, frontmatter.value);
});
</script>

<template>
  <Layout>
    <template #nav-bar-title-before>
      <SportKielLogo />
    </template>
    <template #doc-footer-before>
      <PrevNextKeyboardHints />
    </template>
    <template #doc-after>
      <div
        v-if="snapshotLastModified"
        class="snapshot-last-modified"
      >
        <span class="snapshot-last-modified-label">{{ snapshotLastModified.label }}:</span>
        <time :datetime="snapshotLastModified.datetime">{{ snapshotLastModified.text }}</time>
      </div>
    </template>
  </Layout>
</template>
