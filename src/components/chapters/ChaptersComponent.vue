<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
// stores
import { useAudioPlayerStore, useChapterStore, useTranslationsStore, useSettingStore } from "@/stores";
// components
import { ChapterReadingViewComponent, ChapterTranslationsViewComponent } from "@/components/chapters";
// types
import type { ChapterHeaderData, IntersectingData } from "@/types/chapter";
import type { PlayAudioEmit } from "@/types/audio";

// Stores
const chapterStore = useChapterStore();
const translationsStore = useTranslationsStore();
const audioPlayerStore = useAudioPlayerStore();
const settingStore = useSettingStore()
const wordColor = computed(() => `text-${settingStore.highlightedWordColor}`)

const tab = ref("chaptersTranslationTab");

const props = defineProps<{
  audioPlayer: { audioID: number; isPlaying?: boolean; format?: string } | null;
  selected: boolean;
  selectedVerseNumber?: number;
  cssVars?: Record<"fontSize" | "fontFamily", string>
}>();

const emit = defineEmits<{
  "update:headerData": [value: ChapterHeaderData];
  "update:playAudio": [value: PlayAudioEmit];
  "update:intersectionData": [value: IntersectingData];
}>();

const chapterTranslationsVerseTiming = computed(() => {
  if (audioPlayerStore.verseTiming) {
    if (audioPlayerStore.verseTiming.audioSrc === `chapter-translations-${chapterStore.selectedChapter?.id}`) {
      const chapter = chapterStore.chaptersList.find((c) => c.id === chapterStore.selectedChapter?.id)
      if (chapter) {
        chapter.audioFile = audioPlayerStore.audioFiles
      }
      return audioPlayerStore.verseTiming
    }
  }
})

const chapterReadingVerseTiming = computed(() => {
  if (audioPlayerStore.verseTiming) {
    if (audioPlayerStore.verseTiming.audioSrc === `chapter-reading-${chapterStore.selectedChapter?.id}`) {
      const chapter = chapterStore.chaptersList.find((c) => c.id === chapterStore.selectedChapter?.id)
      if (chapter) {
        chapter.audioFile = audioPlayerStore.audioFiles
      }
      return audioPlayerStore.verseTiming
    }
  }
})
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
      <v-tab value="chaptersTranslationTab" prepend-icon="mdi-book-open">
        {{ $tr.line("quranReader.textTranslation") }}</v-tab>
      <v-tab value="chaptersReadingTab" prepend-icon="mdi-translate-variant">
        {{ $tr.line("quranReader.textReading") }}</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="chaptersTranslationTab" class="mx-5">
        <chapter-translations-view-component :is-audio-playing="audioPlayer"
          :is-translations-view="tab === 'chaptersTranslationTab'" :audio-experience="settingStore.audioPlayerSetting"
          :selected-verse-Number="selectedVerseNumber" :css-vars="cssVars" :word-color="wordColor"
          :grouped-translations-authors="translationsStore.groupedTranslationsAuthors"
          :verse-timing="chapterTranslationsVerseTiming" @update:header-data="emit('update:headerData', $event)"
          @update:intersection-data=" emit('update:intersectionData', $event)"
          @update:play-audio="emit('update:playAudio', $event)">
        </chapter-translations-view-component>
      </v-tabs-window-item>
      <v-tabs-window-item value="chaptersReadingTab">
        <chapter-reading-view-component :is-audio-playing="audioPlayer" :css-vars="cssVars"
          :verse-timing="chapterReadingVerseTiming" :is-reading-view="tab === 'chaptersReadingTab'"
          :audio-experience="settingStore.audioPlayerSetting" @update:header-data="emit('update:headerData', $event)"
          @update:intersection-data="emit('update:intersectionData', $event)" :word-color="wordColor"
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