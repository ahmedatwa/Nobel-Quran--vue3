<script setup lang="ts">
import { ref, inject, watchEffect, computed } from "vue";
// stores
import { useChapterStore } from "@/stores";
// components
import { TitleButtonsComponent } from "@/components/quran";
import { ButtonsActionListComponent } from "@/components/quran";
// types
import type { HeaderData } from "@/types";

const chapterStore = useChapterStore();
const isIntersecting = ref(false);
const translationsDrawer = inject("translationDrawer");
const headerData = ref<HeaderData | null>(null);
const intersectingVerseNumber = ref<number>();
const verses = computed(() => {
  if (chapterStore.selectedChapter?.verses) {
    return chapterStore.selectedChapter?.verses.sort(
      (a, b) => a.verse_number - b.verse_number
    );
  }
});
const chapterAudioId = computed(() => {
  if (chapterStore.selectedChapter) {
    return chapterStore.selectedChapter?.id;
  }
  return 0;
});

const props = defineProps<{
  isAudioPlaying: {
    audioID: number;
    isPlaying?: boolean;
    format?: string;
  } | null;
  groupedTranslationsAuthors?: string;
  verseTiming: {
    chapterId: number;
    verseKey: String;
    inRange: boolean;
    wordLocation: number;
  };
  audioExperience: { autoScroll: boolean; tooltip: boolean };
  cssVars?: { size: string; family: string };
}>();

const emit = defineEmits<{
  "update:playAudio": [value: { audioID: number; verseKey?: string }];
  "update:headerData": [value: HeaderData];
  "update:intersectingVerseNumber": [value: number];
}>();

// Manual Mode Scroll
const onIntersect = async (intersecting: boolean, entries: any) => {
  isIntersecting.value = intersecting;
  if (intersecting) {
    // emit header data
    headerData.value = {
      left: chapterStore.selectedChapter?.nameSimple.concat(",", chapterStore.selectedChapter?.nameArabic),
      right: {
        pageNumber: entries[0].target.dataset.pageNumber,
        hizbNumber: entries[0].target.dataset.hizbNumber,
        juzNumber: entries[0].target.dataset.juzNumber,
      },
    };

    emit("update:headerData", headerData.value);

    if (entries[0].intersectionRatio === 1) {
      intersectingVerseNumber.value = Number(
        entries[0].target.dataset.verseNumber
      );
      // emit verse id for scroll in verses list
      // help to fetch new verses
      emit("update:intersectingVerseNumber", intersectingVerseNumber.value);
    }
  }
};

const setBookmarked = (verseNumber: number) => {
  chapterStore.selectedChapter?.verses?.forEach((v) => {
    if (v.verse_number === verseNumber) v.bookmarked = true;
    return;
  });
};

// Highlight Active Words
const isWordHighlighted = (position: number, verseKey: string) => {
  if (props.verseTiming)
    return (
      props.verseTiming.wordLocation === position &&
      verseKey === props.verseTiming.verseKey
    );
};

// watchers
// auto mode with verse timing and feed header data
watchEffect(async () => {
  if (props.verseTiming.verseKey) {
    if (props.audioExperience.autoScroll) {
      const el = document.getElementById(
        `verse-word${props.verseTiming.verseKey}`
      );
      headerData.value = {
        left: chapterStore.selectedChapter?.nameSimple.concat(",", chapterStore.selectedChapter?.nameArabic),
        right: {
          pageNumber: el?.getAttribute("data-page-number") || 0,
          hizbNumber: el?.getAttribute("data-hizb-number") || 0,
          juzNumber: el?.getAttribute("data-juz-number") || 0,
        },
      };
      // emit header Data
      emit("update:headerData", headerData.value);
      // Scroll into View
      // Verse Column
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
});
</script>

<template>
  <v-container fluid>
    <v-row :align="'center'" justify="center" dense>
      <v-col cols="12">
        <title-buttons-component :grouped-translations-authors="groupedTranslationsAuthors" :chapter-id="chapterAudioId"
          :is-audio-player="isAudioPlaying" @update:translations-drawer="translationsDrawer = $event"
          @update:play-audio="$emit('update:playAudio', $event)">
        </title-buttons-component>
      </v-col>
      <v-col cols="12" class="mb-2" v-for="verse in verses" :key="verse.verse_key" :data-hizb-number="verse.hizb_number"
        :data-juz-number="verse.juz_number" :data-verse-number="verse.verse_number" :data-verse-key="verse.verse_key"
        :data-page-number="verse.page_number" :data-intersecting="isIntersecting" v-intersect.quite="{
          handler: onIntersect,
          options: {
            threshold: [0, 0.5, 1.0],
          },
        }">
        <v-row :id="`verse-row${verse.verse_number}`">
          <v-col cols="1" class="action-list" :order="$tr.rtl.value ? 2 : 1">
            <buttons-action-list-component @update:play-audio="$emit('update:playAudio', $event)" size="small"
              :is-audio-player="isAudioPlaying" :verse="verse" @update:bookmarked="setBookmarked">
            </buttons-action-list-component>
          </v-col>
          <v-col cols="11" class="text-right pt-3" :order="$tr.rtl.value ? 1 : 2">
            <v-list class="quran-content" dense>
              <v-list-item v-for="word in verse.words" :key="word.id" :id="`verse-word${verse.verse_key}`"
                :data-hizb-number="verse.hizb_number" :data-verse-number="verse.verse_number"
                :data-juz-number="verse.juz_number" :data-page-number="verse.page_number" class="item">
                <v-list-item-title class="quran-content title" :id="`target${word.id}`" :class="isWordHighlighted(word.position, word.verse_key)
                  ? 'text-blue'
                  : ''
                  ">
                  <p v-if="word.char_type_name === 'end'">
                    ({{ word.text_uthmani }})
                  </p>
                  <p v-else>
                    {{ word.text_uthmani }}

                    <v-tooltip activator="parent" :target="`#target${word.id}`" v-if="audioExperience.tooltip"
                      :model-value="isWordHighlighted(word.position, word.verse_key)
                        " location="top center" origin="bottom center" :text="word.translation.text">
                    </v-tooltip>
                    <v-tooltip activator="parent" :target="`#target${word.id}`" v-else location="top center"
                      origin="bottom center" :text="word.translation.text">
                    </v-tooltip>
                  </p>
                </v-list-item-title>
              </v-list-item>
            </v-list>
            <v-list>
              <v-list-item class="text-left" v-for="translation in verse.translations" :key="translation.id">
                <div class="translation" v-html="translation.text"></div>
                <v-sheet class="text-caption mt-2 text-disabled">
                  -- {{ translation.resource_name }}</v-sheet>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
        <v-divider class="mb-3"></v-divider>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped>
:deep(.v-card-item__append) {
  align-items: start !important;
}

.quran-content {
  font-family: v-bind("props.cssVars?.family");
}

.quran-content .title {
  font-size: v-bind("props.cssVars?.size");
}

.action-list {
  padding: 2px !important;
}
</style>
