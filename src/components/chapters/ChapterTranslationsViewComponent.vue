<script setup lang="ts">
import { ref, inject, watchEffect, computed, watch } from "vue";
// stores
import { useChapterStore } from "@/stores";
// components
import { TitleButtonsComponent } from "@/components/quran";
import { ButtonsActionListComponent } from "@/components/quran";
// types
import type { ChapterHeaderData, ManualIntersectingMode } from "@/types/chapter";
import type { VerseTimingsProps, IsAudioPlayingProps } from "@/types/audio"
// utils
import { scrollToElement, isInViewport } from "@/utils/useScrollToElement";

const chapterStore = useChapterStore();
const isIntersecting = ref(false);
const translationsDrawer = inject("translationDrawer");
const headerData = ref<ChapterHeaderData | null>(null);
const intersectingVerseNumber = ref<number>();
const verses = computed(() => {
  if (chapterStore.selectedChapter?.verses) {
    return chapterStore.selectedChapter?.verses.sort(
      (a, b) => a.verse_number - b.verse_number
    );
  }
});

const isHoveringElement = ref("")

const getFirstVerseOfChapter = computed(() => {
  if (chapterStore.selectedChapter?.verses) {
    return chapterStore.selectedChapter?.verses[0]
  }
})

const getLastVerseOfChapter = computed(() => {
  if (chapterStore.selectedChapter?.verses) {
    const verse = chapterStore.selectedChapter?.verses.slice(-1)[0]
    if (verse) {
      return verse.verse_number
    }
  }
  return 0
})

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
  verseTiming: VerseTimingsProps
  audioExperience: { autoScroll: boolean; tooltip: boolean };
  cssVars?: { size: string; family: string };
}>();

const emit = defineEmits<{
  "update:playAudio": [value: { audioID: number; verseKey?: string }];
  "update:headerData": [value: ChapterHeaderData];
  "update:manualIntersectingMode": [value: ManualIntersectingMode];
}>();

// Manual Mode Scroll
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
    // Avoid watchers by comparing 2 objects
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
      lastVerseNumber: getLastVerseOfChapter.value,
      currentVerseNumber: intersectingVerseNumber.value
    });

  }
};

const setBookmarked = (verseNumber: number) => {
  chapterStore.selectedChapter?.verses?.forEach((v) => {
    if (v.verse_number === verseNumber) v.bookmarked = true;
    return;
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
watchEffect(async () => {
  if (props.verseTiming.verseNumber) {
    if (props.audioExperience.autoScroll) {
      const el = document.querySelector(`#verse-row-${props.verseTiming.verseNumber}`) as HTMLDivElement
      if (!isInViewport(el)) {
        // Avoid watchers by comparing 2 objects
        const newHeaderData = ref<ChapterHeaderData>()
        newHeaderData.value = {
          left: chapterStore.selectedChapterName,
          right: {
            pageNumber: el.getAttribute("data-page-number") || "",
            hizbNumber: el.getAttribute("data-hizb-number") || "",
            juzNumber: el.getAttribute("data-juz-number") || "",
          },
        };


        if (newHeaderData.value !== headerData.value) {
          headerData.value = newHeaderData.value
          // emit header Data
          emit("update:headerData", headerData.value)
        }
        ;
        // Scroll into View
        scrollToElement(`#verse-row-${props.verseTiming.verseNumber}`)
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
watch(() => getFirstVerseOfChapter, (newVal) => {
  if (newVal.value) {
    headerData.value = {
      left: chapterStore.selectedChapterName,
      right: {
        pageNumber: newVal.value.page_number,
        hizbNumber: newVal.value.hizb_number,
        juzNumber: newVal.value.juz_number,
      },
    };
    // emit header Data
    emit("update:headerData", headerData.value);
  }

}, { once: true })
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
        :data-juz-number="verse.juz_number" :data-chapter-id="verse.chapter_id" :data-verse-number="verse.verse_number"
        :data-verse-key="verse.verse_key" :data-page-number="verse.page_number" :data-intersecting="isIntersecting"
        :id="`verse-col-number-${verse.verse_number}`" v-intersect="{
          handler: onIntersect,
          options: {
            threshold: [0, 0.5, 1.0],
          },
        }">
        <v-row :id="`verse-row-${verse.verse_number}`">
          <v-col class="action-list verse-col" :order="$tr.rtl.value ? 2 : 1" :cols="$vuetify.display.smAndDown ? '12' : '1'">
            <buttons-action-list-component @update:play-audio="$emit('update:playAudio', $event)" size="small"
              :is-audio-player="isAudioPlaying" :verse="verse" @update:bookmarked="setBookmarked">
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
                  <h3 v-else> {{ word.text_uthmani }}
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
                <v-sheet class="text-caption mt-2 text-disabled">
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
  </v-container>
</template>
<style scoped>
:deep(.v-card-item__append) {
  align-items: start !important;
}

:deep(.v-list-item--density-default:not(.v-list-item--nav).v-list-item--one-line) {
  padding-inline: 3px;
}

.quran-translation-view h3 {
  font-size: v-bind("props.cssVars?.size");
  font-family: v-bind("props.cssVars?.family");
}
</style>
