<script setup lang="ts">
import { ref, watchEffect } from "vue";
// stores
import { useAudioPlayerStore, useChapterStore, useTranslationsStore, useSettingStore } from "@/stores";
// components
import { ChapterReadingViewComponent, ChapterTranslationsViewComponent } from "@/components/chapters";
// types
import type { ChapterHeaderData, ManualIntersectingMode } from "@/types/chapter";
import type { PlayAudioEmitEvent } from "@/types/audio";

// Stores
const chapterStore = useChapterStore();
const translationsStore = useTranslationsStore();
const audioPlayerStore = useAudioPlayerStore();
const { audioPlayerSetting } = useSettingStore()
const tab = ref("translationTab");

const props = defineProps<{
  audioPlayer: { audioID: number; isPlaying?: boolean; format?: string } | null;
  selected: boolean;
  selectedVerseNumber?: number;
  settingCssVars?: { size: string; family: string };
}>();

const emit = defineEmits<{
  "update:headerData": [value: ChapterHeaderData];
  "update:playAudio": [value: PlayAudioEmitEvent];
  "update:manualIntersectingMode": [value: ManualIntersectingMode];
}>();


/**
 * initial emit for header data 
 * as it will be lost when switching tabs 
 * fetching verses if selected chapter is null
 */
watchEffect(async () => {
  if (props.selected) {
    if (!chapterStore.selectedChapter) {
      chapterStore.selectedChapter = chapterStore.chaptersList[0];
      await chapterStore.getVerses(1, true);
      if (chapterStore.getFirstVerseHeaderData) {
        emit("update:headerData", chapterStore.getFirstVerseHeaderData)
      }
    } else {
      if (chapterStore.getFirstVerseHeaderData) {
        emit("update:headerData", chapterStore.getFirstVerseHeaderData)
      }
    }
  }
});
</script>
<template>
  <v-card v-show="selected" class="ma-3" :elevation="1"
    :id="`quran-reader-content-surah${chapterStore.selectedChapter?.id}`" :key="chapterStore.selectedChapter?.id">
    <v-tabs v-model="tab" align-tabs="center" color="primary" grow>
      <v-tab value="translationTab" prepend-icon="mdi-book-open">
        {{ $tr.line("quranReader.textTranslation") }}</v-tab>
      <v-tab value="readingTab" prepend-icon="mdi-translate-variant">
        {{ $tr.line("quranReader.textReading") }}</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="translationTab" class="mx-5">
        <chapter-translations-view-component :is-audio-playing="audioPlayer"
          :is-translations-view="tab === 'translationTab'" :audio-experience="audioPlayerSetting"
          :selected-verse-Number="selectedVerseNumber" :css-vars="settingCssVars"
          :grouped-translations-authors="translationsStore.groupedTranslationsAuthors"
          :verse-timing="audioPlayerStore.verseTiming" @update:header-data="emit('update:headerData', $event)"
          @update:manual-intersecting-mode=" emit('update:manualIntersectingMode', $event)"
          @update:play-audio="emit('update:playAudio', $event)">
        </chapter-translations-view-component>
      </v-tabs-window-item>
      <v-tabs-window-item value="readingTab">
        <chapter-reading-view-component :is-audio-playing="audioPlayer" :css-vars="settingCssVars"
          :verse-timing="audioPlayerStore.verseTiming" :is-reading-view="tab === 'readingTab'"
          :audio-experience="audioPlayerSetting" @update:header-data="emit('update:headerData', $event)"
          @update:manual-intersecting-mode="emit('update:manualIntersectingMode', $event)"
          :selected-verse-Number="selectedVerseNumber" @update:play-audio="emit('update:playAudio', $event)">
        </chapter-reading-view-component>
      </v-tabs-window-item>
    </v-tabs-window>
    <v-card-actions>
      <v-row v-if="chapterStore.isLoading.verses">
        <v-col cols="12">
          <v-progress-linear indeterminate color="primary"></v-progress-linear>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>
<style lang="scss">
@use '../../assets/settings';

// .loading {
//   height: settings.$skeleton-loader-text-height;
// }</style>