<script setup lang="ts">
import { ref, inject, watchEffect, onMounted, onUnmounted } from "vue";
import { computed, watch, reactive } from "vue";
import { useDisplay } from "vuetify";
// stores
import { useChapterStore } from "@/stores";
// components
import { TitleButtonsComponent } from "@/components/quran";
import { ButtonsActionListComponent } from "@/components/quran";
// types
import type { ChapterHeaderData, IntersectingData } from "@/types/chapter";
import type { VerseWord } from "@/types/verse"
import type { VerseTimingsProps, IsAudioPlayingProps, PlayAudioEmit } from "@/types/audio"

// utils
import { setStorage } from "@/utils/storage";
import { SMOOTH_SCROLL_TO_CENTER, scrollToElement } from "@/utils/useScrollToElement";

const chapterStore = useChapterStore();
const { smAndDown } = useDisplay()
const isIntersecting = ref(false);
const translationsDrawer = inject("translationDrawer");
const headerData = ref<ChapterHeaderData | null>(null);
const intersectingVerseNumber = ref<number>();

const defaultStyles = reactive({
  fontFamily: "var(--font-family-noto-kufi)",
  fontSize: "var(--font-size-2)"
})

const verses = computed(() => {
  if (chapterStore.selectedChapterVerses) {
    return chapterStore.selectedChapterVerses.sort(
      (a, b) => a.verse_number - b.verse_number
    );
  }
});

const isHoveringElement = ref<number | string>("")

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
  wordColor: string
}>();

const emit = defineEmits<{
  "update:playAudio": [value: PlayAudioEmit];
  "update:headerData": [value: ChapterHeaderData];
  "update:intersectionData": [value: IntersectingData];
}>();


// Manual Mode Scroll
const onIntersect = (intersecting: boolean, entries: IntersectionObserverEntry[]) => {
  isIntersecting.value = intersecting;
  let newHeaderData: ChapterHeaderData | null = null

  if (intersecting && entries[0].intersectionRatio >= 0.8) {
    const target = entries[0].target as HTMLDivElement

    if (target) {
      intersectingVerseNumber.value = Number(target.dataset.verseNumber);
      // emit header data
      // Avoid watchers by comparing 2 objects
      newHeaderData = {
        left: chapterStore.selectedChapterName,
        right: {
          pageNumber: target.dataset.pageNumber || "",
          hizbNumber: target.dataset.hizbNumber || "",
          juzNumber: target.dataset.juzNumber || "",
        },
      };

      if (newHeaderData !== headerData.value) {
        headerData.value = newHeaderData
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

/**
 * 
 * @param verseNumber 
 * @returns void
 */
const setBookmarked = (verseNumber: number) => {
  chapterStore.selectedChapter?.verses?.forEach((v) => {
    if (v.verse_number === verseNumber) {
      v.bookmarked = true
      setStorage('bookmarked-verse', {
        key: "chapter-translations",
        value: {
          verseNumber: v.verse_number,
          verseKey: v.verse_key,
          chapterId: v.chapter_id
        }
      })
      return;
    }

  });
};


const isWordHighlighted = (word: VerseWord) => {
  if (props.verseTiming && props.isTranslationsView) {
    return props.verseTiming.wordLocation === word.location
  }
};


// watchers
// auto mode with verse timing and feed header data
watchEffect(async () => {
  if (props.audioExperience.autoScroll) {
    const currentVerseNumber = props.verseTiming?.verseNumber
    const lastVerseNumber = chapterStore.getLastVerseNumberOfChapter
    intersectingVerseNumber.value = Number(props.verseTiming?.verseNumber)

    if (props.isAudioPlaying?.isPlaying && currentVerseNumber) {
      // fetch more Verses
      if (currentVerseNumber === lastVerseNumber || currentVerseNumber >= lastVerseNumber - 5) {
        if (chapterStore.selectedChapterPagination?.next_page) {
          await chapterStore.getVerses(chapterStore.selectedChapterId, true, chapterStore.selectedChapterPagination.next_page)
        }
      }
    }
    // toggle active state
    const element = document.getElementById(`active-${currentVerseNumber}`)
    if (element) {
      isHoveringElement.value = Number(currentVerseNumber)
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
watch(() => props.selectedVerseNumber, (newVerseSelection) => {
  if (newVerseSelection) {
    scroll(`#active-${props.selectedVerseNumber}`)
  }
});

watch(intersectingVerseNumber, (newVerseNumber) => {
  if (newVerseNumber) {
    scroll(`#verse-container-${newVerseNumber}`, newVerseNumber)
  }
})

onMounted(() => {
  console.log(intersectingVerseNumber.value);

  const el = document.querySelector(".smooth-scroll-behaviour")
  if (el) el.addEventListener("scroll", (event) => {
    console.log("scroll", event);

  })
})

onUnmounted(() => {
  intersectingVerseNumber.value = undefined

})
// commit scroll to verse
const scroll = (el: string, _currentVerseNumber?: number) => {
  if(smAndDown.value) {
    scrollToElement(el, 300, SMOOTH_SCROLL_TO_CENTER, 156)
  } else {
    scrollToElement(el, 300)
  }
}

</script>

<template>
  <v-container fluid class="smooth-scroll-behaviour" id="chapters-translations-container">
    <v-card flat>
      <v-row :align="'center'" justify="center" dense>
        <v-col cols="12">
          <title-buttons-component :grouped-translations-authors="groupedTranslationsAuthors"
            :chapter-id="chapterAudioId" :is-audio-player="isAudioPlaying"
            @update:translations-drawer="translationsDrawer = $event"
            :audio-src="`chapter-translations-${chapterAudioId}`"
            @update:play-audio="$emit('update:playAudio', $event)">
          </title-buttons-component>
        </v-col>
        <v-col cols="12" class="mb-2" v-for="(verse, index) in verses" :key="verse.verse_key"
          :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number" :data-chapter-id="verse.chapter_id"
          :data-verse-number="verse.verse_number" :data-verse-key="verse.verse_key"
          :data-page-number="verse.page_number" :data-intersecting="isIntersecting"
          :id="`verse-col-number-${verse.verse_number}`" v-intersect.quite="{
            handler: onIntersect,
            options: {
              threshold: [0, 0.8, 1.0],
            },
          }">
          <v-row :id="`verse-row-${verse.verse_number}`" :class="`active-verse-row`" :tabindex="index">
            <!-- Actions -->
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
              <!-- <v-overlay :key="`overlay-${verse.verse_number}`" contained scrim="#CFD8DC" opacity="0.1"
                v-if="isHoveringElement === verse.verse_number" :model-value="true"
                :activator="`#active-${verse.verse_number}`">
              </v-overlay> -->

              <div class="quran-translation-view" dense :id="`verse-container-${verse.verse_number}`">
                <div v-for="word in verse.words" :key="word.id" :data-hizb-number="verse.hizb_number"
                  :data-verse-number="verse.verse_number" :data-chapter-id="verse.chapter_id"
                  :data-juz-number="verse.juz_number" :data-page-number="verse.page_number" class="item">
                  <div class="word" :id="`word-tooltip-${word.id}`" :class="isWordHighlighted(word)
                    ? wordColor : ''">

                    <h3 v-if="word.char_type_name === 'end'">
                      ({{ word.text_uthmani }})
                    </h3>
                    <h3 :style="[defaultStyles, cssVars]" :data-word-location="word.location" v-else> {{
                      word.text_uthmani }}
                      <v-tooltip v-if="audioExperience.tooltip" activator="parent" :target="`#word-tooltip-${word.id}`"
                        :model-value="isWordHighlighted(word)" location="top center" origin="bottom center"
                        :text="word.translation.text">
                      </v-tooltip>
                      <v-tooltip v-else activator="parent" :target="`#word-tooltip-${word.id}`" location="top center"
                        origin="bottom center" :text="word.translation.text">
                      </v-tooltip>
                    </h3>
                  </div>
                </div>
              </div>
              <div>
                <div class="text-left mt-4" v-for="translation in verse.translations" :key="translation.id">
                  <div class="translation" v-html="translation.text"></div>
                  <v-sheet class="text-caption mt-2 text-disabled quran-translations-font">
                    -- {{ translation.resource_name }}</v-sheet>
                  </div>
              </div>
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

.test {
  top: calc(100% - 200px) !important;
}
</style>
