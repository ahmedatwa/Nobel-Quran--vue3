<script setup lang="ts">
import { ref, watchEffect, inject, watch } from "vue";
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
import type { HeaderData } from "@/types";
// utils
import { getStorage } from "@/utils/storage";

// Stores
const translationsStore = useTranslationsStore();
const settingStore = useSettingStore();
const audioPlayerStore = useAudioPlayerStore();

const translationDrawer = ref(false);
provide("translationDrawer", translationDrawer);
const navigationDrawer = inject<boolean>("modelNav");

// Refs
const selectedTab = ref("");
const selectedPage = ref(1);
const intersectingVerseNumber = ref<number>();
const intersectingJuzVerseNumber = ref<number>();
const audioPlayerModelValue = ref(false);
const selectedVerseKeyView = ref("");
const activeJuzNumber = ref<number>();
const audioPlayer = ref<{
  audioID: number;
  verseKey?: string;
  isPlaying?: boolean;
  format?: string;
} | null>(null);

const props = defineProps<{
  selected: string;
}>();

const emit = defineEmits<{
  "update:chapterHeaderData": [value: HeaderData];
  "update:juzHeaderData": [value: HeaderData];
  "update:pageHeaderData": [value: HeaderData];
  "update:navigationDrawer": [value: boolean];
}>();

const playAudio = (event: { audioID: number; verseKey?: string }) => {
  audioPlayerStore.getAudio({ ...event });
  audioPlayer.value = { ...event };
  audioPlayerModelValue.value = true;
};

watchEffect(() => {
  if (props.selected) {
    selectedTab.value = props.selected;
  }
});

watch(
  () => audioPlayer.value?.isPlaying,
  (newV) => {
    emit("update:navigationDrawer", !newV);
  }
);
// Front Styles
const settingCssVars = computed(() => {
  if (settingStore.cssVars) {
    return {
      size: settingStore.cssVars?.quranFrontSize
        ? "var(--quran-font-size-" + settingStore.cssVars.quranFrontSize + ")"
        : "var(--quran-font-size-3)",
      family: settingStore.cssVars?.quranFontFamily
        ? "var(--quran-reader-font-family-" +
        settingStore.cssVars.quranFontFamily +
        ")"
        : "var(--quran-reader-font-family-indoPak)",
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
  <navigation-component v-model:model-nav="navigationDrawer" :selected="selected"
    @update:selected-tab="selectedTab = $event" :intersecting-verse-number="intersectingVerseNumber"
    :intersecting-juz-verse-number="intersectingJuzVerseNumber" @update:selected-page="selectedPage = $event"
    :active-juz-number="activeJuzNumber"
    @update:selected-verse-key-view="selectedVerseKeyView = $event"></navigation-component>
  <!-- Juz -->
  <juzs-component :selected="selectedTab === 'juz'" :selected-tab="selectedTab" :audio-player="audioPlayer"
    :setting-css-vars="settingCssVars" @update:translation-drawer="translationDrawer = $event"
    @update:intersecting-juz-verse-number="intersectingJuzVerseNumber = $event"
    :selected-verse-key-View="selectedVerseKeyView" @update:play-audio="playAudio"
    @update:juz-header-data="$emit('update:juzHeaderData', $event)"
    @update:active-juz-number="activeJuzNumber = $event"></juzs-component>
  <!-- Chapters -->
  <chapters-component :selected="selectedTab === 'surah'" :audio-player="audioPlayer" :selected-tab="selectedTab"
    :selected-verse-key-View="selectedVerseKeyView" :setting-css-vars="settingCssVars"
    @update:intersecting-verse-number="intersectingVerseNumber = $event"
    @update:chapter-header-data="$emit('update:chapterHeaderData', $event)" @update:play-audio="playAudio">
  </chapters-component>
  <!-- Pages -->
  <pages-component :selected="selectedTab === 'page'" :selected-page="selectedPage" :audio-player="audioPlayer"
    :setting-css-vars="settingCssVars" @update:verse-id="intersectingVerseNumber = $event"
    @update:translation-drawer="translationDrawer = $event"
    @update:page-header-data="$emit('update:pageHeaderData', $event)" @update:play-audio="playAudio"></pages-component>

  <translation-list-component @update:selected-translations="updateTranslations"></translation-list-component>

  <audio-player-component :audio-player="audioPlayer" :auto-play="settingStore.autoPlay"
    @update:is-audio="audioPlayer = $event" @update:model-value="audioPlayerModelValue = $event"
    :model-value="audioPlayerModelValue"></audio-player-component>
</template>
