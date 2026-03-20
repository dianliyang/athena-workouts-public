<script setup lang="ts">
import { onMounted } from "vue";
import DefaultTheme from "vitepress/theme";
import PrevNextKeyboardHints from "./PrevNextKeyboardHints.vue";
import SportKielLogo from "./SportKielLogo.vue";

const { Layout } = DefaultTheme;

onMounted(() => {
  document.documentElement.dataset.scheduleView = "timeline";
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
  </Layout>
</template>
