<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
// stores
import { useAudioPlayerStore, useChapterStore, useTranslationsStore, useSettingStore } from "@/stores";
// components
import { ChapterReadingViewComponent, ChapterTranslationsViewComponent } from "@/components/chapters";
// types
import type { ChapterHeaderData, ManualIntersectingMode } from "@/types/chapter";
import type { PlayAudioEmit } from "@/types/audio";

// Stores
const chapterStore = useChapterStore();
const translationsStore = useTranslationsStore();
const audioPlayerStore = useAudioPlayerStore();
const { audioPlayerSetting } = useSettingStore()
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
  "update:manualIntersectingMode": [value: ManualIntersectingMode];
}>();

const chapterTranslationsVerseTiming = computed(() => {
  if (audioPlayerStore.verseTiming) {
    if (audioPlayerStore.verseTiming.audioSrc === `chapter-translations-${chapterStore.selectedChapter?.id}`) {
      return audioPlayerStore.verseTiming
    }
  }
})

const chapterReadingVerseTiming = computed(() => {
  if (audioPlayerStore.verseTiming) {
    if (audioPlayerStore.verseTiming.audioSrc === `chapter-reading-${chapterStore.selectedChapter?.id}`) {
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
          :is-translations-view="tab === 'chaptersTranslationTab'" :audio-experience="audioPlayerSetting"
          :selected-verse-Number="selectedVerseNumber" :css-vars="cssVars"
          :grouped-translations-authors="translationsStore.groupedTranslationsAuthors"
          :verse-timing="chapterTranslationsVerseTiming" @update:header-data="emit('update:headerData', $event)"
          @update:manual-intersecting-mode=" emit('update:manualIntersectingMode', $event)"
          @update:play-audio="emit('update:playAudio', $event)">
        </chapter-translations-view-component>
      </v-tabs-window-item>
      <v-tabs-window-item value="chaptersReadingTab">
        <chapter-reading-view-component :is-audio-playing="audioPlayer" :css-vars="cssVars"
          :verse-timing="chapterReadingVerseTiming" :is-reading-view="tab === 'chaptersReadingTab'"
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