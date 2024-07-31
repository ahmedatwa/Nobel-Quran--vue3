<script setup lang="ts">
import { ref, onBeforeMount, provide, watch } from "vue";
// components
import { QuranComponent } from "@/components/quran";
import { HomeComponent } from "@/components/home";
import { HeaderComponent, FooterComponent } from "@/components/common";
import { NavigationComponent } from "@/components/common";

// types
import type { Chapter, IntersectingData } from "@/types/chapter";
import type { Juz } from "@/types/juz";
import type { Page } from "@/types/page"
import type { ChapterHeaderData } from "@/types/chapter";
import type { JuzHeaderData, JuzVersesIntersecting } from "@/types/juz";
import type { PageHeaderData } from "@/types/page";
// utils
import { getStorage, clearStorage, setStorage } from "@/utils/storage";
import { useTheme } from "vuetify";
// Store 
import { useMetaStore, useSettingStore } from "@/stores"

// Stores
const _theme = useTheme();
const metaStore = useMetaStore()
const { isAppLoading } = useSettingStore()
const selectedLanguage = ref("en");
const settingsDrawer = ref(false);
const headerData = ref<{ key: string, value: ChapterHeaderData | JuzHeaderData | PageHeaderData } | null>(null);
const selected = ref<Chapter | Juz | Page | null>(null);
const tab = ref("chapters");
const randomAudioId = ref<number | undefined>()
// when user select specific verse number from chapters Nav
const chapterIntersectingData = ref<IntersectingData>();
const chapterSelectedVerseNumber = ref<number>();
const activeJuzNumber = ref<number>();
const activePageNumber = ref<number>();
const juzManualIntersecting = ref<JuzVersesIntersecting>();
const intersectingPageVerseNumber = ref<number>();

const navigationModelValue = ref(true);
provide("navigationModelValue", navigationModelValue);

onBeforeMount(() => {
  // selected Tab
  const selectedtab = getStorage("tab");
  if (selectedtab) {
    tab.value = selectedtab;
  } else {
    setStorage("tab", tab.value)
  }

  const language = getStorage("language");
  if (language) {
    selectedLanguage.value = language;
  } else {
    setStorage("language", selectedLanguage.value)
  }

  // theme
  if (getStorage("theme")) {
    _theme.global.name.value = getStorage("theme") || "dark";
  }
});

const destroy = () => {
  clearStorage(true);
};

watch(tab, (newVal) => {
  if (newVal) setStorage("tab", tab.value)
})

watch(selectedLanguage, (newLang) => {
  if (newLang) setStorage("language", newLang)
})


</script>

<template>
  <teleport to="head title">{{ metaStore.pageTitle }}</teleport>
  <teleport to="head">
    <meta v-for="(metaItem, i) in metaStore.metaData" :key="i" :name="metaItem.name" :property="metaItem.property"
      :content="metaItem.content">
  </teleport>
  <v-app>
    <v-locale-provider :rtl="$tr.rtl.value">
      <v-overlay :model-value="isAppLoading" class="align-center justify-center">
        <v-progress-circular color="primary" size="64" indeterminate>
        </v-progress-circular>
      </v-overlay>

      <header-component :header-data="headerData" @update:settings-drawer="settingsDrawer = $event"
        @update:selected-language="selectedLanguage = $event" @update-home="destroy">
      </header-component>
      <navigation-component v-model:navigation-model-value="navigationModelValue" :selected="tab" v-if="selected"
        :chapter-intersecting-data="chapterIntersectingData" :juz-manual-intersecting="juzManualIntersecting"
        :active-juz-number="activeJuzNumber" :active-page-number="activePageNumber"
        :intersecting-page-verse-number="intersectingPageVerseNumber"
        @update:model-value="navigationModelValue = $event" @update:selected-tab="tab = $event"
        @update:selected-verse-number="chapterSelectedVerseNumber = $event">
      </navigation-component>
      <v-main>

        <quran-component :selected="tab" v-if="selected" @update:header-data="headerData = $event"
          @update:active-juz-number="activeJuzNumber = $event" @update:active-page-number="activePageNumber = $event"
          @update:chapter-intersection-data="chapterIntersectingData = $event"
          :chapter-selected-verse="chapterSelectedVerseNumber"
          @update:intersecting-page-verse-number="intersectingPageVerseNumber = $event"
          @update:juz-manual-intersecting="juzManualIntersecting = $event"> </quran-component>

        <home-component v-model:model-value="tab" @update-selected="selected = $event"
          @update:play-random-audio="randomAudioId = $event" v-else></home-component>

      </v-main>
      <footer-component></footer-component>
    </v-locale-provider>
  </v-app>
</template>
<style></style>
