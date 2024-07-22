<script setup lang="ts">
import { ref, computed, watch, watchEffect, reactive } from "vue";
import { useDisplay } from "vuetify";

// stores
import { useChapterStore } from "@/stores";
// components
import { TitleButtonsComponent } from "@/components/quran";
// types
import type { ChapterHeaderData, IntersectingData } from "@/types/chapter";
import type { MapVersesByPage } from "@/types/verse";
import type { VerseTimingsProps, IsAudioPlayingProps, PlayAudioEmit } from "@/types/audio"
// utils
import { scrollToElement, SMOOTH_SCROLL_TO_CENTER } from "@/utils/useScrollToElement";

const chapterStore = useChapterStore();
const isIntersecting = ref(false);
const { mobile } = useDisplay()
const headerData = ref<ChapterHeaderData | null>(null);
const intersectingVerseNumber = ref<number>();

const defaultStyles = reactive({
  fontSize: mobile.value ? "var(--quran-font-size-1)" : "var(--quran-font-size-3)",
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
  "update:intersectionData": [value: IntersectingData];
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
    const target = entries[0].target as HTMLDivElement

    if (target) {
      intersectingVerseNumber.value = Number(target.dataset.verseNumber);


      // emit header data
      const newHeaderData = ref<ChapterHeaderData>()
      newHeaderData.value = {
        left: chapterStore.selectedChapterName,
        right: {
          pageNumber: target.dataset.pageNumber || "",
          hizbNumber: target.dataset.hizbNumber || "",
          juzNumber: target.dataset.juzNumber || "",
        },
      };

      if (newHeaderData.value !== headerData.value) {
        headerData.value = newHeaderData.value
        emit("update:headerData", headerData.value);
      }

      // emit verse id for scroll in verses list
      // help to fetch new verses
      // sending current/last verse Numbers to the chapters Nav
      emit("update:intersectionData", {
        lastVerseNumber: chapterStore.getLastVerseNumberOfChapter,
        currentVerseNumber: intersectingVerseNumber.value
      });
    }
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
    if (props.audioExperience.autoScroll) {
      const currentVerseNumber = props.verseTiming?.verseNumber
      const lastVerseNumber = chapterStore.getLastVerseNumberOfChapter

      if (props.isAudioPlaying?.isPlaying && currentVerseNumber) {
        // fetch more Verses
        if (currentVerseNumber === lastVerseNumber || currentVerseNumber >= lastVerseNumber - 5) {
          if (chapterStore.selectedChapterPagination?.next_page) {
            await chapterStore.getVerses(chapterStore.selectedChapterId, true, chapterStore.selectedChapterPagination.next_page)
          }
        }
        // Scroll into View
        const verseElement = `#verse-row-${currentVerseNumber}`
        if (verseElement) {
          if (currentVerseNumber !== intersectingVerseNumber.value) {

            if (mobile.value) {
              scrollToElement(verseElement, 50, SMOOTH_SCROLL_TO_CENTER, 250)
            } else {
              scrollToElement(verseElement)
            }
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
      <v-card flat class="quran-reader-container">
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
            <v-col class="verse-col" :id="`page-${page}`" cols="10">
              <div class="" v-for="verse in verses" :key="verse.id" :id="`line-${verse.verse_number}`"
                :data-hizb-number="verse.hizb_number" :data-chapter-id="verse.chapter_id"
                :data-juz-number="verse.juz_number" :data-page-number="page" :data-verse-number="verse.verse_number"
                v-intersect.quite="{
                  handler: onIntersect,
                  options: {
                    threshold: [0, 0.5, 1.0],
                  },
                }">
                <h3 v-for="word in verse.words" :key="word.id" :data-word-position="word.position"
                  class="d-flex flex-wrap d-inline-flex" :data-hizb-number="verse.hizb_number"
                  :data-juz-number="verse.juz_number" :data-chapter-id="verse.chapter_id" :data-page-number="page">
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
