<script setup lang="ts">
import { ref, onBeforeMount, provide, watch } from "vue";
import { QuranHomeComponent, QuranComponent } from "@/components/quran";
import { HeaderComponent, FooterComponent } from "@/components/common";
import { useChapterStore, useJuzStore, usePageStore } from "@/stores";
import type { Chapter } from "@/types/chapter";
import type { Juz, Pages } from "@/types/juz";
import type { HeaderData } from "@/types";
import { getStorage, clearStorage } from "@/utils/storage";
import { useTheme } from "vuetify";

// Stores
const chapterStore = useChapterStore();
const juzStore = useJuzStore();
const pageStore = usePageStore();
const _theme = useTheme();
const selectedLanguage = ref("");
const settingsDrawer = ref(false);
const chapterHeaderData = ref<HeaderData | null>(null);
const juzHeaderData = ref<HeaderData | null>(null);
const pageHeaderData = ref<HeaderData | null>(null);
const selected = ref<Chapter | Juz | Pages | null>(null);
const tab = ref("surah");
const isLoading = ref(false);

const modelNav = ref(true);
provide("modelNav", modelNav);

onBeforeMount(() => {
  const chapter = getStorage("chapter");
  const juz = getStorage("juz");
  const page = getStorage("page");
  if (chapter) {
    selected.value = chapter.data as Chapter;
    chapterStore.selectedChapter = chapter.data as Chapter;
  }
  if (page) {
    selected.value = page.data as Pages;
    pageStore.selectedPage = page.data as Pages;
  }
  if (juz) {
    selected.value = juz.data as Juz;
    juzStore.selectedJuz = juz.data as Juz;
  }

  // selected Tab
  const selectedtab = getStorage("tab");
  if (selectedtab) {
    tab.value = selectedtab;
  }

  // theme
  if (getStorage("theme")) {
    _theme.global.name.value = getStorage("theme") || "dark";
  }
});

watch(isLoading, (loading) => {
  if (loading) {
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
});

const destroy = () => {
  clearStorage(true, sessionStorage);
};
</script>

<template>
  <v-app>
    <v-overlay :model-value="isLoading" class="align-center justify-center">
      <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
    </v-overlay>
    <v-locale-provider :rtl="$tr.rtl.value">
      <header-component :chapter-header-data="chapterHeaderData" :page-header-data="pageHeaderData"
        :juz-header-data="juzHeaderData" @update:settings-drawer="settingsDrawer = $event"
        @update:selected-language="selectedLanguage = $event" @update-home="destroy">
      </header-component>
      <v-main style="overflow-x: hidden">
        <quran-component :selected="tab" v-if="selected" @update:chapter-header-data="chapterHeaderData = $event"
          @update:navigation-drawer="modelNav = $event" @update:juz-header-data="juzHeaderData = $event"
          @update:page-header-data="pageHeaderData = $event"></quran-component>

        <quran-home-component v-model:model-value="tab" @update-selected="selected = $event"
          @update:is-loading="isLoading = $event" v-else></quran-home-component>
        <footer-component></footer-component>
      </v-main>
    </v-locale-provider>
  </v-app>
</template>
<style></style>
