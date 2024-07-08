<script setup lang="ts">
import { ref, inject, watch } from "vue";
import { computed, provide, onBeforeMount } from "vue";
// components
import { AudioPlayerComponent } from "@/components/audio";
import { PagesComponent } from "@/components/pages";
import { TranslationListComponent } from "@/components/translations";
import { JuzsComponent } from "@/components/juzs";
import { ChaptersComponent } from "@/components/chapters";
import { NavigationComponent } from "@/components/common";
// stores
import {
  useTranslationsStore,
  useSettingStore,
  useAudioPlayerStore,
} from "@/stores";
// types
import type { ChapterHeaderData, ManualIntersectingMode } from "@/types/chapter";
import type { JuzHeaderData, JuzVersesIntersecting } from "@/types/juz";
import type { PageHeaderData } from "@/types/page";
import type { PlayAudioEmitEvent } from "@/types/audio";
// utils
import { getStorage } from "@/utils/storage";

// Stores
const translationsStore = useTranslationsStore();
const settingStore = useSettingStore();
const audioPlayerStore = useAudioPlayerStore();

const translationDrawer = ref(false);
provide("translationDrawer", translationDrawer);
const navigationModelValue = inject<boolean>("navigationModelValue");

// Refs
const selectedTab = ref("");
const selectedPage = ref(1);
const chapterManualIntersectingModeData = ref<ManualIntersectingMode>();
const juzManualIntersecting = ref<JuzVersesIntersecting>();
const intersectingPageVerseNumber = ref<number>();
const audioPlayerModelValue = ref(false);
// when user select specific verse number from chapters Nav
const chapterSelectedVerseNumber = ref<number>();
const activeJuzNumber = ref<number>();
const activePageNumber = ref<number>();
const audioPlayer = ref<{
  audioID: number;
  verseKey?: string;
  isPlaying?: boolean;
  format?: string;
} | null>(null);

defineProps<{
  selected: string;
}>();

const emit = defineEmits<{
  "update:headerData": [{ key: string, value: JuzHeaderData | PageHeaderData | ChapterHeaderData }];
  "update:navigationModelValue": [value: boolean];
}>();

const playAudio = (event: PlayAudioEmitEvent) => {
  audioPlayerStore.getAudio(event);
  audioPlayer.value = event
  audioPlayerModelValue.value = true;
};

// watchEffect(() => {
//   if (props.selected) {
//     selectedTab.value = props.selected;
//   }
// });

watch(
  () => audioPlayer.value?.isPlaying,
  (newV) => {
    emit("update:navigationModelValue", !newV);
  }
);
// Front Styles
const settingCssVars = computed(() => {
  if (settingStore.cssVars) {
    return {
      size: `var(--quran-font-size-${settingStore.cssVars.quranFontFamily.toLowerCase()})`,
      family: `var(--quran-reader-font-family-${settingStore.cssVars.quranFrontSize})`,
      translationsSize: `var(--translation-font-size-${settingStore.cssVars.translationsFontSize})`,
    };
  }
});

// update Selected Translations
const updateTranslations = ($event: number[]) => {
  translationsStore.selectedTranslationIds = $event;
};

onBeforeMount(() => {
  const tab = getStorage("tab");
  if (tab) selectedTab.value = tab;
});
</script>
<template>
  <navigation-component v-model:navigation-model-value="navigationModelValue" :selected="selected"
    @update:selected-tab="selectedTab = $event" :chapter-manual-intersecting-mode="chapterManualIntersectingModeData"
    :juz-manual-intersecting="juzManualIntersecting" @update:selected-page="selectedPage = $event"
    :active-juz-number="activeJuzNumber" :active-page-number="activePageNumber"
    :intersecting-page-verse-number="intersectingPageVerseNumber"
    @update:selected-verse-number="chapterSelectedVerseNumber = $event"></navigation-component>
  <!-- Juz -->
  <juzs-component :selected="selectedTab === 'juzs'" :selected-tab="selectedTab" :audio-player="audioPlayer"
    :setting-css-vars="settingCssVars" @update:translation-drawer="translationDrawer = $event"
    @update:manual-intersecting="juzManualIntersecting = $event" @update:play-audio="playAudio"
    @update:header-data="$emit('update:headerData', { key: 'juz', value: $event as JuzHeaderData })"
    @update:active-juz-number="activeJuzNumber = $event"></juzs-component>
  <!-- Chapters -->
  <chapters-component :selected="selectedTab === 'chapters'" :audio-player="audioPlayer" :selected-tab="selectedTab"
    :selected-verse-number="chapterSelectedVerseNumber" :setting-css-vars="settingCssVars"
    @update:manual-intersecting-mode="chapterManualIntersectingModeData = $event"
    @update:header-data="$emit('update:headerData', { key: 'chapter', value: $event as ChapterHeaderData })"
    @update:play-audio="playAudio">
  </chapters-component>
  <!-- Pages -->
  <pages-component :selected="selectedTab === 'pages'" :selected-page="selectedPage" :audio-player="audioPlayer"
    :setting-css-vars="settingCssVars" @update:intersecting-page-verse-number="intersectingPageVerseNumber = $event"
    @update:translation-drawer="translationDrawer = $event" @update:active-page-number="activePageNumber = $event"
    @update:header-data="$emit('update:headerData', { key: 'page', value: $event as PageHeaderData })"
    @update:play-audio="playAudio"></pages-component>

  <translation-list-component @update:selected-translations="updateTranslations"></translation-list-component>

  <audio-player-component :audio-player="audioPlayer" @update:is-audio="audioPlayer = $event"
    @update:model-value="audioPlayerModelValue = $event" :model-value="audioPlayerModelValue"></audio-player-component>
</template>
