<script setup lang="ts">
import { ref, watch } from "vue";
import { computed, provide } from "vue";
// components
import { AudioPlayerComponent } from "@/components/audio";
import { PagesComponent } from "@/components/pages";
import { TranslationListComponent } from "@/components/translations";
import { JuzsComponent } from "@/components/juzs";
import { ChaptersComponent } from "@/components/chapters";

// stores
import {
  useTranslationsStore,
  useSettingStore,
  useAudioPlayerStore,
} from "@/stores";
// types
import type { ChapterHeaderData, IntersectingData } from "@/types/chapter";
import type { JuzHeaderData, JuzVersesIntersecting } from "@/types/juz";
import type { PageHeaderData } from "@/types/page";
import type { PlayAudioEmit } from "@/types/audio";

// Stores
const translationsStore = useTranslationsStore();
const settingStore = useSettingStore();
const audioPlayerStore = useAudioPlayerStore();

const translationDrawer = ref(false);
provide("translationDrawer", translationDrawer);

// Refs
const selectedTab = ref("");
const selectedPage = ref(1);
const audioPlayerModelValue = ref(false);
const audioPlayer = ref<{
  audioID: number;
  verseKey?: string;
  isPlaying?: boolean;
  format?: string;
} | null>(null);

defineProps<{
  selected: string;
  chapterSelectedVerse?: number
}>();

const emit = defineEmits<{
  "update:headerData": [{ key: string, value: JuzHeaderData | PageHeaderData | ChapterHeaderData }];
  "update:navigationModelValue": [value: boolean];
  "update:activeJuzNumber": [value: number]
  "update:chapterSelectedVerse": [value: number]
  "update:chapterIntersectionData": [value: IntersectingData]
  "update:activePageNumber": [value: number]
  "update:juzManualIntersecting": [value: JuzVersesIntersecting]
  "update:intersectingPageVerseNumber": [value: number]
  "update:chapterAutoScrollData": [value: { activeVerseNumber: number }]

}>();

const playAudio = (event: PlayAudioEmit) => {    
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
const quranCssVars = computed(() => {
  if (settingStore.cssVars) {
    return {
      fontFamily: `var(--font-family-${settingStore.cssVars.quranFontFamily.toLowerCase()})`,
      fontSize: `var(--font-size-${settingStore.cssVars.quranFrontSize})`,
    };
  }
});

// update Selected Translations
const updateTranslations = ($event: number[]) => {
  translationsStore.selectedTranslationIds = $event;
};

// onBeforeMount(() => {
//   const tab = getStorage("tab");
//   if (tab) selectedTab.value = tab;
// });
</script>
<template>
  <!-- Juz -->
  <juzs-component :selected="selected === 'juzs'" :selected-tab="selectedTab" :audio-player="audioPlayer"
    :css-vars="quranCssVars" @update:translation-drawer="translationDrawer = $event"
    @update:manual-intersecting="$emit('update:juzManualIntersecting', $event)" @update:play-audio="playAudio"
    @update:header-data="$emit('update:headerData', { key: 'juz', value: $event as JuzHeaderData })"
    @update:active-juz-number="$emit('update:activeJuzNumber', $event)"></juzs-component>
  <!-- Chapters -->
  <chapters-component :selected="selected === 'chapters'" :audio-player="audioPlayer" :selected-tab="selectedTab"
    :selected-verse-number="chapterSelectedVerse" :css-vars="quranCssVars"
    @update:intersection-data="$emit('update:chapterIntersectionData', $event)"
    @update:header-data="$emit('update:headerData', { key: 'chapter', value: $event as ChapterHeaderData })"
    @update:play-audio="playAudio">
  </chapters-component>
  <!-- Pages -->
  <pages-component :selected="selected === 'pages'" :selected-page="selectedPage" :audio-player="audioPlayer"
    :css-vars="quranCssVars"
    @update:intersecting-page-verse-number="$emit('update:intersectingPageVerseNumber', $event)"
    @update:translation-drawer="translationDrawer = $event"
    @update:active-page-number="$emit('update:activePageNumber', $event)"
    @update:header-data="$emit('update:headerData', { key: 'page', value: $event as PageHeaderData })"
    @update:play-audio="playAudio"></pages-component>

  <translation-list-component @update:selected-translations="updateTranslations"></translation-list-component>

  <audio-player-component :audio-player="audioPlayer" @update:is-audio="audioPlayer = $event"
    @update:model-value="audioPlayerModelValue = $event" :model-value="audioPlayerModelValue"></audio-player-component>
</template>
