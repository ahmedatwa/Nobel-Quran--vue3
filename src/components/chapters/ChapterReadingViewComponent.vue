<script setup lang="ts">
import { ref, computed, watch, watchEffect, reactive } from "vue";
// stores
import { useChapterStore } from "@/stores";
// components
import { TitleButtonsComponent } from "@/components/quran";
// types
import type { ChapterHeaderData, ManualIntersectingMode } from "@/types/chapter";
import type { MapVersesByPage } from "@/types/verse";
import type { VerseTimingsProps, IsAudioPlayingProps, PlayAudioEmit } from "@/types/audio"
// utils
import { scrollToElement, isInViewport } from "@/utils/useScrollToElement";

const chapterStore = useChapterStore();
const isIntersecting = ref(false);
const headerData = ref<ChapterHeaderData | null>(null);
const intersectingVerseNumber = ref<number>();

const defaultStyles = reactive({
  fontSize: "var(--quran-font-size-3)",
  fontFamily: "var(--quran-font-family-noto-kufi)"
})

const verses = computed(() => {
  if (chapterStore.selectedChapterVerses) {
    return chapterStore.selectedChapterVerses.sort(
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
  "update:playAudio": [value: PlayAudioEmit];
  "update:headerData": [value: ChapterHeaderData];
  "update:manualIntersectingMode": [value: ManualIntersectingMode];
}>();

const props = defineProps<{
  isReadingView: boolean;
  isAudioPlaying: IsAudioPlayingProps
  audioExperience: { autoScroll: boolean; tooltip: boolean };
  verseTiming?: VerseTimingsProps
  cssVars?: Record<"fontSize" | "fontFamily", string>
  selectedVerseNumber?: number;
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
  if (intersecting && entries[0].intersectionRatio === 1) {
    intersectingVerseNumber.value = Number(
      entries[0].target.dataset.verseNumber
    );

    if (intersectingVerseNumber.value === 1) {
      return
    }
    // emit header data
    const newHeaderData = ref<ChapterHeaderData>()
    newHeaderData.value = {
      left: chapterStore.selectedChapterName,
      right: {
        pageNumber: entries[0].target.dataset.pageNumber,
        hizbNumber: entries[0].target.dataset.hizbNumber,
        juzNumber: entries[0].target.dataset.juzNumber,
      },
    };

    if (newHeaderData.value !== headerData.value) {
      headerData.value = newHeaderData.value
      emit("update:headerData", headerData.value);
    }

    // emit verse id for scroll in verses list
    // help to fetch new verses
    // sending current/last verse Numbers to the chapters Nav
    emit("update:manualIntersectingMode", {
      lastVerseNumber: chapterStore.getLastVerseNumberOfChapter,
      currentVerseNumber: intersectingVerseNumber.value
    });
  }
};

// emitting header data on mounted so 
// access to dismiss the navigation menu is available
// will be done only once as it will be triggred from scroll source
watch(() => chapterStore.getFirstVerseOfChapter, (newVal) => {
  if (newVal) {
    headerData.value = {
      left: chapterStore.selectedChapterName,
      right: {
        pageNumber: newVal.page_number,
        hizbNumber: newVal.hizb_number,
        juzNumber: newVal.juz_number,
      },
    };
    // emit header Data
    emit("update:headerData", headerData.value);
  }

}, { once: true })

// auto mode with verse timing and feed header data
watchEffect(async () => {
  if (props.verseTiming) {
    if (props.audioExperience.autoScroll) {
      const el = document.querySelector(`#line-${props.verseTiming.verseNumber}`) as HTMLDivElement
      let newHeaderData: ChapterHeaderData | null = null
      if (!isInViewport(el)) {
        // Avoid watchers by comparing 2 objects
        newHeaderData = {
          left: chapterStore.selectedChapterName,
          right: {
            pageNumber: el.getAttribute("data-page-number") || "",
            hizbNumber: el.getAttribute("data-hizb-number") || "",
            juzNumber: el.getAttribute("data-juz-number") || "",
          },
        };


        if (newHeaderData !== headerData.value) {
          headerData.value = newHeaderData
          // emit header Data
          emit("update:headerData", headerData.value)
        }
        // Scroll into View
        scrollToElement(`#line-${props.verseTiming.verseNumber}`)
        // toggle active state
        const element = document.querySelector(`#active-${props.verseTiming.verseNumber}`)
        if (element) {
          //isHoveringElement.value = `active-${props.verseTiming.verseNumber}`
        }
      }
    }
  }
});

/**
 * watch if user selected verse number 
 * scroll to the verse after fetching
 */
watchEffect(() => {
  if (props.selectedVerseNumber) {
    console.log(props.selectedVerseNumber);
    scrollToElement(`#verse-row-${props.selectedVerseNumber}`)
  }
});
</script>

<template>
  <v-container class="smooth-scroll-behaviour">
    <v-row justify="center" :align="'center'" no-gutters>
      <v-col cols="12">
        <title-buttons-component :is-audio-player="isAudioPlaying" :chapter-id="chapterAudioId"
          @update:play-audio="$emit('update:playAudio', $event)" :audio-src="`chapter-reading-${chapterAudioId}`"
          isInfoDialog>
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
              <div class="d-inline-flex flex-wrap justify-center" v-for="verse in verses" :key="verse.id"
                :id="`line-${verse.verse_number}`" :data-hizb-number="verse.hizb_number"
                :data-chapter-id="verse.chapter_id" :data-juz-number="verse.juz_number" :data-page-number="page"
                :data-verse-number="verse.verse_number" v-intersect.quite="{
                  handler: onIntersect,
                  options: {
                    threshold: [0, 0.5, 1.0],
                  },
                }">
                <h3 v-for="word in verse.words" :key="word.id" :data-word-position="word.position" class=""
                  :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
                  :data-chapter-id="verse.chapter_id" :data-page-number="page">
                  <div :class="isWordHighlighted(word.location, word.verse_key)
                    ? 'text-blue'
                    : ''
                    " class="word">
                    <div v-if="word.char_type_name === 'end'">({{ word.text_uthmani }})
                    </div>
                    <div :style="[defaultStyles, cssVars]" v-else>{{ word.text_uthmani }}</div>
                  </div>
                </h3>
              </div>
            </v-col>
            <v-col cols="12" class="my-4">
              <v-divider><span class="text-caption">{{ $tr.line('quranReader.textPage') }} {{ page }}</span></v-divider>
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

// .quran-reader-container .verse-col {
//   font-size: v-bind("props.cssVars?.size");
//   font-family: v-bind("props.cssVars?.family");
// }</style>
