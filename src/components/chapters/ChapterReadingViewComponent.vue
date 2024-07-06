<script setup lang="ts">
import { ref, computed } from "vue";
// stores
import { useChapterStore } from "@/stores";
// components
import { TitleButtonsComponent } from "@/components/quran";
// types
import type { ChapterHeaderData } from "@/types/chapter";
import type { Verse, MapVersesByPage } from "@/types/verse";
import type { VerseTimingsProps, IsAudioPlayingProps } from "@/types/audio"

const chapterStore = useChapterStore();
const isIntersecting = ref(false);
const headerData = ref<ChapterHeaderData | null>(null);
const intersectingVerseNumber = ref<number>();
const verses = computed((): Verse[] | undefined => {
  if (chapterStore.selectedChapter) {
    return chapterStore.selectedChapter.verses?.sort(
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
const emit = defineEmits<{
  "update:playAudio": [value: { audioID: number; verseKey?: string }];
  "update:headerData": [value: ChapterHeaderData];
  "update:intersectingVerseNumber": [value: number];
}>();

const props = defineProps<{
  isReadingView: boolean;
  isAudioPlaying: IsAudioPlayingProps
  verseTiming: VerseTimingsProps
  cssVars?: { size: string; family: string };
}>();

// Highlight Active Words
const isWordHighlighted = (loaction: string, verseKey: string) => {
  if (props.isReadingView) {    
    if (props.verseTiming) {
      return (
        props.verseTiming.wordLocation === loaction &&
        verseKey === props.verseTiming.verseKey
      );
    }
  }
};

const mapVersesByPage = computed((): MapVersesByPage | undefined => {
  if (verses.value) {
    return verses.value.reduce((acc: any, obj) => {
      (acc[obj.page_number] = acc[obj.page_number] || []).push(obj);
      return acc;
    }, {});
  }
});

const onIntersect = async (intersecting: boolean, entries: any) => {
  isIntersecting.value = intersecting;
  if (intersecting) {
    // emit header data
    headerData.value = {
      left: chapterStore.selectedChapterName,
      right: {
        pageNumber: entries[0].target.dataset.pageNumber,
        hizbNumber: entries[0].target.dataset.hizbNumber,
        juzNumber: entries[0].target.dataset.juzNumber,
      },
    };

    emit("update:headerData", headerData.value);

    if (entries[0].intersectionRatio === 0.8) {
      intersectingVerseNumber.value = Number(
        entries[0].target.dataset.verseNumber
      );
      // emit verse id for scroll in verses list
      // help to fetch new verses
      emit("update:intersectingVerseNumber", intersectingVerseNumber.value);
    }
  }
};
</script>

<template>
  <v-container>
    <v-row justify="center" :align="'center'" no-gutters>
      <v-col cols="12">
        <title-buttons-component :is-audio-player="isAudioPlaying" :chapter-id="chapterAudioId"
          @update:play-audio="$emit('update:playAudio', $event)" isInfoDialog>
        </title-buttons-component>
      </v-col>
      <v-card width="auto" flat class="quran-reader-container">
        <template #title>
          <h2>{{ $tr.rtl
            ? chapterStore.selectedChapter?.nameArabic
            : chapterStore.selectedChapter?.nameSimple }}
          </h2>
        </template>
        <template #subtitle>
          <h3>{{ chapterStore.selectedChapter?.bismillahPre
            ? $tr.line("quranReader.textBismillah")
            : "" }}
          </h3>
        </template>
        <v-container>
          <v-row class="verse-row" no-gutters justify="center" :align="'start'"
            v-for="(verses, page) in mapVersesByPage" :key="page" :id="`row-page-${page}`">
            <v-col class="verse-col" :id="`page-${page}`">

              <div class="d-inline-flex" v-for="verse in verses" :key="verse.id"
                :id="`page-${page}-line-${verse.verse_number}`" :data-hizb-number="verse.hizb_number"
                :data-chapter-id="verse.chapter_id" :data-juz-number="verse.juz_number"
                :data-verse-number="verse.verse_number" v-intersect.quite="{
                  handler: onIntersect,
                  options: {
                    threshold: [0, 0.5, 1.0],
                  },
                }">
                <h3 v-for="word in verse.words" :key="word.id" :data-word-position="word.position" class=""
                  :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
                  :data-chapter-id="verse.chapter_id">
                  <div :class="isWordHighlighted(word.location, word.verse_key)
                    ? 'text-blue'
                    : ''
                    " class="word">
                    <div v-if="word.char_type_name === 'end'">({{ word.text_uthmani }})
                    </div>
                    <div v-else>{{ word.text_uthmani }}</div>
                  </div>
                </h3>
              </div>
            </v-col>
            <v-col cols="12" class="my-4">
              <v-divider><span class="text-caption">{{ page }}</span></v-divider>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-row>
  </v-container>
</template>
<style scoped lang="scss">
:deep(.v-list-item--density-default.v-list-item--one-line) {
  min-height: 10px !important;
}

:deep(.v-list-item--density-default:not(.v-list-item--nav).v-list-item--one-line) {
  padding-inline: 0px;
}

.quran-reader-container .verse-col {
  font-size: v-bind("props.cssVars?.size");
  font-family: v-bind("props.cssVars?.family");
}
</style>
