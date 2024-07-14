<script setup lang="ts">
import { ref, inject, watchEffect } from "vue";
import { computed, watch, reactive } from "vue";
import { useDisplay } from "vuetify";
// stores
import { useChapterStore } from "@/stores";
// components
import { TitleButtonsComponent } from "@/components/quran";
import { ButtonsActionListComponent } from "@/components/quran";
// types
import type { ChapterHeaderData, ManualIntersectingMode } from "@/types/chapter";
import type { VerseTimingsProps, IsAudioPlayingProps, PlayAudioEmit } from "@/types/audio"

// utils
import { scrollToElement, isInViewport, SMOOTH_SCROLL_TO_CENTER } from "@/utils/useScrollToElement";
import { setStorage } from "@/utils/storage";

const chapterStore = useChapterStore();
const { mobile } = useDisplay()
const isIntersecting = ref(false);
const translationsDrawer = inject("translationDrawer");
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

const isHoveringElement = ref("")

const chapterAudioId = computed(() => {
  if (chapterStore.selectedChapter) {
    return chapterStore.selectedChapter?.id;
  }
  return 0;
});

const props = defineProps<{
  isTranslationsView: boolean;
  isAudioPlaying: IsAudioPlayingProps
  groupedTranslationsAuthors?: string;
  verseTiming?: VerseTimingsProps
  audioExperience: { autoScroll: boolean; tooltip: boolean };
  cssVars?: Record<"fontSize" | "fontFamily", string>
  selectedVerseNumber?: number;
}>();

const emit = defineEmits<{
  "update:playAudio": [value: PlayAudioEmit];
  "update:headerData": [value: ChapterHeaderData];
  "update:manualIntersectingMode": [value: ManualIntersectingMode];
}>();

// Manual Mode Scroll
const onIntersect = (intersecting: boolean, entries: any) => {
  isIntersecting.value = intersecting;
  let newHeaderData: ChapterHeaderData | null = null
  if (intersecting && entries[0].intersectionRatio === 1) {
    intersectingVerseNumber.value = Number(
      entries[0].target.dataset.verseNumber
    );
    // emit header data
    // Avoid watchers by comparing 2 objects
    newHeaderData = {
      left: chapterStore.selectedChapterName,
      right: {
        pageNumber: entries[0].target.dataset.pageNumber,
        hizbNumber: entries[0].target.dataset.hizbNumber,
        juzNumber: entries[0].target.dataset.juzNumber,
      },
    };

    if (newHeaderData !== headerData.value) {
      headerData.value = newHeaderData
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

const setBookmarked = (verseNumber: number) => {

  chapterStore.selectedChapter?.verses?.forEach((v) => {
    if (v.verse_number === verseNumber) {
      v.bookmarked = true
      setStorage('bookmarked-verse', { key: "chapter-translations", value: v })
      return;
    }

  });
};

// Highlight Active Words
const isWordHighlighted = (location: string, verseKey: string) => {
  if (props.verseTiming && props.isTranslationsView) {
    return (
      props.verseTiming.wordLocation === location &&
      verseKey === props.verseTiming.verseKey
    );
  }
};

// watchers
// auto mode with verse timing and feed header data
watchEffect(() => {
  if (props.verseTiming) {
    if (props.audioExperience.autoScroll) {
      const el = document.querySelector(`#verse-row-${props.verseTiming.verseNumber}`) as HTMLDivElement
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
        ;
        // Scroll into View
        if (props.isAudioPlaying?.isPlaying) {
          if (mobile.value) {
            scrollToElement(`#verse-row-${props.verseTiming.verseNumber}`, 50, SMOOTH_SCROLL_TO_CENTER, 200)
          } else {
            scrollToElement(`#verse-row-${props.verseTiming.verseNumber}`)
          }

        }
        // toggle active state
        const element = document.querySelector(`#active-${props.verseTiming.verseNumber}`)
        if (element) {
          //isHoveringElement.value = `active-${props.verseTiming.verseNumber}`
        }
      }
    }
  }
});



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

/**
 * watch if user selected verse number 
 * scroll to the verse after fetching
 */
watchEffect(() => {
  if (props.selectedVerseNumber) {
    scrollToElement(`#verse-row-${props.selectedVerseNumber}`)
  }
});

</script>

<template>
  <v-container fluid class="smooth-scroll-behaviour" id="chapters-translations-container">
    <v-card :loading="chapterStore.isLoading.verses">
      <v-row :align="'center'" justify="center" dense>
        <v-col cols="12">
          <title-buttons-component :grouped-translations-authors="groupedTranslationsAuthors"
            :chapter-id="chapterAudioId" :is-audio-player="isAudioPlaying"
            @update:translations-drawer="translationsDrawer = $event"
            :audio-src="`chapter-translations-${chapterAudioId}`"
            @update:play-audio="$emit('update:playAudio', $event)">
          </title-buttons-component>
        </v-col>
        <v-col cols="12" class="mb-2" v-for="verse in verses" :key="verse.verse_key"
          :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number" :data-chapter-id="verse.chapter_id"
          :data-verse-number="verse.verse_number" :data-verse-key="verse.verse_key"
          :data-page-number="verse.page_number" :data-intersecting="isIntersecting"
          :id="`verse-col-number-${verse.verse_number}`" v-intersect="{
            handler: onIntersect,
            options: {
              threshold: [0, 0.5, 1.0],
            },
          }">
          <v-row :id="`verse-row-${verse.verse_number}`">
            <v-col class="action-list verse-col" :order="$tr.rtl.value ? 2 : 1"
              :cols="$vuetify.display.smAndDown ? '12' : '1'">
              <buttons-action-list-component @update:play-audio="$emit('update:playAudio', $event)" size="small"
                :is-audio-player="isAudioPlaying" :verse="verse" :audio-src="`chapter-translations-${chapterAudioId}`"
                @update:bookmarked="setBookmarked">
              </buttons-action-list-component>
            </v-col>

            <v-col cols="11" class="text-right pt-3" :order="$tr.rtl.value ? 1 : 2" style="position: relative;"
              :id="`active-${verse.verse_number}`">
              <!-- overLay -->
              <v-overlay :key="`overlay-${verse.verse_number}`" contained scrim="#CFD8DC" opacity="0.1"
                :model-value="isHoveringElement === `active-${verse.verse_number}` ? true : false"></v-overlay>
              <v-list class="quran-translation-view" dense>
                <v-list-item v-for="word in verse.words" :key="word.id" :data-hizb-number="verse.hizb_number"
                  :data-verse-number="verse.verse_number" :data-chapter-id="verse.chapter_id"
                  :data-juz-number="verse.juz_number" :data-page-number="verse.page_number" class="item">
                  <v-list-item-title class="word" :id="`word-tooltip-${word.id}`" :class="isWordHighlighted(word.location, word.verse_key)
                    ? 'text-blue'
                    : ''">
                    <h3 v-if="word.char_type_name === 'end'">
                      ({{ word.text_uthmani }})
                    </h3>
                    <h3 :style="[defaultStyles, cssVars]" v-else> {{ word.text_uthmani }}
                      <v-tooltip v-if="audioExperience.tooltip" activator="parent" :target="`#word-tooltip-${word.id}`"
                        :model-value="isWordHighlighted(word.location, word.verse_key)
                          " location="top center" origin="bottom center" :text="word.translation.text">
                      </v-tooltip>
                      <v-tooltip v-else activator="parent" :target="`#word-tooltip-${word.id}`" location="top center"
                        origin="bottom center" :text="word.translation.text">
                      </v-tooltip>
                    </h3>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
              <v-list>
                <v-list-item class="text-left" v-for="translation in verse.translations" :key="translation.id">
                  <div class="translation" v-html="translation.text"></div>
                  <v-sheet class="text-caption mt-2 text-disabled quran-translations-font">
                    -- {{ translation.resource_name }}</v-sheet>
                </v-list-item>
              </v-list>
            </v-col>

          </v-row>
          <v-col cols="12" class="my-3">
            <v-divider></v-divider>
          </v-col>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
<style scoped>
:deep(.v-card-item__append) {
  align-items: start !important;
}

:deep(.v-list-item--density-default:not(.v-list-item--nav).v-list-item--one-line) {
  padding-inline: 3px;
}
</style>
