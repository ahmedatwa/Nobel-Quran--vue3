<script setup lang="ts">
import { computed, ref } from "vue";
import { ChaptersNavComponent } from "@/components/chapters";
// stores
import { useAudioPlayerStore, useChapterStore, useTranslationsStore, useSettingStore } from "@/stores";
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
  // audioPlayer: { audioID: number; isPlaying?: boolean; format?: string } | null;
  // selected: boolean;
  // selectedVerseNumber?: number;
  // cssVars?: Record<"fontSize" | "fontFamily", string>
}>();

const emit = defineEmits<{
  "update:headerData": [value: ChapterHeaderData];
  "update:playAudio": [value: PlayAudioEmit];
  "update:manualIntersectingMode": [value: ManualIntersectingMode];
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
// watchEffect(async () => {
//   if (props.selected) {
//     if (!chapterStore.selectedChapter) {
//       chapterStore.selectedChapter = chapterStore.chaptersList[0];
//       await chapterStore.getVerses(1, true);
//       if (chapterStore.getFirstVerseHeaderData) {
//         emit("update:headerData", chapterStore.getFirstVerseHeaderData)
//       }
//     } else {
//       if (chapterStore.getFirstVerseHeaderData) {
//         emit("update:headerData", chapterStore.getFirstVerseHeaderData)
//       }
//     }
//   }
// });
</script>
<template>
   
  <v-card class="ma-3" :elevation="1" :id="`quran-reader-content-surah${chapterStore.selectedChapter?.id}`"
    :key="chapterStore.selectedChapter?.id">
    <v-tabs v-model="tab" align-tabs="center" color="primary" grow>
      <v-tab value="chaptersTranslationTab" prepend-icon="mdi-book-open" :to="{ name: 'chapterTranslations' }">
        {{ $tr.line("quranReader.textTranslation") }}</v-tab>
      <v-tab value="chaptersReadingTab" prepend-icon="mdi-translate-variant" :to="{ name: 'chapterReading' }">
        {{ $tr.line("quranReader.textReading") }}</v-tab>
    </v-tabs>
    <router-view :isTranslationsView="tab === 'chaptersTranslationTab'" :audio-experience="audioPlayerSetting"
      :grouped-translations-authors="translationsStore.groupedTranslationsAuthors" :is-audio-playing="null"
      :verse-timing="chapterTranslationsVerseTiming" @update:header-data="emit('update:headerData', $event)"
      @update:manual-intersecting-mode=" emit('update:manualIntersectingMode', $event)"
      @update:play-audio="emit('update:playAudio', $event)"></router-view>
  </v-card>
</template>