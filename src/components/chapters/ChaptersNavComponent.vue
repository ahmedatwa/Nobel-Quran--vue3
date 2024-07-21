<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, watch } from "vue";
// stores
import { useChapterStore } from "@/stores";
// utils
import { _range, localizeNumber } from "@/utils/number";
import { isVerseKeyWithinRanges } from "@/utils/verse";
// types
import type { Chapter, IntersectingData } from "@/types/chapter";
import { scrollToElement, SMOOTH_SCROLL_TO_TOP } from "@/utils/useScrollToElement";

// Stores
const chapterStore = useChapterStore();
const selectedVerseID = ref(1);
const searchValue = ref("");

const selectedChapterVersesCount = computed(() => {
  if (chapterStore.selectedChapter) {
    return chapterStore.selectedChapter?.versesCount
  }
})

const emit = defineEmits<{
  "update:selectedVerseNumber": [value: number];
}>();

const props = defineProps<{
  intersectingData?: IntersectingData
}>();

onMounted(async () => {
  if (!chapterStore.selectedChapter) {
    chapterStore.selectedChapter = chapterStore.chaptersList[0]
    selectedVerseID.value = 1
    if (!chapterStore.selectedChapter.verses?.length) {
      await chapterStore.getVerses(chapterStore.selectedChapterId, true)
    }
  }
});

watch(() => chapterStore.selectedChapterId, (newId) => {
  if (newId) {
    scrollToElement(`#chapter${chapterStore.selectedChapterId}`, 700, SMOOTH_SCROLL_TO_TOP);
  }
}, { once: true });

/**
 * creates range from verse count
 */
const versesCount = computed(() => {
  if (chapterStore.selectedChapter) {
    return _range(chapterStore.selectedChapter.versesCount, 1).filter((n) => n.toLocaleString().includes(searchValue.value))
  }
});

const getSelectedChapter = async (chapter: Chapter) => {
  chapterStore.selectedChapter = chapter;
};

const getSelectedVerse = async (id: number) => {
  selectedVerseID.value = id;
  const verseKey = chapterStore.selectedChapterId + ":" + id
  await getVerseByKey(verseKey)
  emit("update:selectedVerseNumber", id);
};


/**
 * watch the verse number when
 * user scroll the translations View manually
 * receive the verse number to define the column
 * scroll into the verse number in verse list
 * fetch the verse by key so we don't count on pagniation received from quran api
 * duplicate verses will be handeled by the chapter store
 */
watchEffect(async () => {
  if (props.intersectingData) {
    // console.log("nav", props.intersectingData);
    const intersectingData = props.intersectingData
    selectedVerseID.value = intersectingData.currentVerseNumber;

    if (selectedChapterVersesCount.value === intersectingData.lastVerseNumber) {
      chapterStore.isLoading.verses = false
      return;
    }


    scrollToElement(`#verse-list-${selectedVerseID.value}`, 50);

    if (
      intersectingData.currentVerseNumber ===
      intersectingData.lastVerseNumber ||
      intersectingData.currentVerseNumber >=
      intersectingData.lastVerseNumber - 5
    ) {


      if (chapterStore.selectedChapterPagination) {
        await chapterStore.getVerses(chapterStore.selectedChapterId, true, chapterStore.selectedChapterPagination.next_page)
      }
    }
  }
});
/**
 * on Mouse enter fetch the verse if it doesn't fall with the range
 * given by verses length
 * or fetch the chapter which help to minimize api calls
 */
const mouseEnter = async (k: string, value: Chapter | number) => {
  if (k === "chapter") {
    const chapter = value as Chapter;
    if (!chapter.verses?.length) {
      await chapterStore.getVerses(chapter.id, false);
    }
  }
  if (k === "verse") {
    const verseNumber = value as number;
    // trigger only when hover on verse greater than 
    // default per page value as api will be called 
    // twice for the same verse if chapter selected
    if (verseNumber >= chapterStore.perPage) {
      const verseKey = `${chapterStore.selectedChapterId}:${verseNumber}`;
      const verseInRange = isVerseKeyWithinRanges(
        verseKey,
        chapterStore.versesKeyMap
      );

      if (!verseInRange) {
        await getVerseByKey(verseKey);
      }
    }
  }
};

const getVerseByKey = async (verseKey: string) => {
  if (chapterStore.selectedChapter) {
    const verseFound = chapterStore.selectedChapter.verses?.find(
      (cv) => cv.verse_key === verseKey
    );

    if (!verseFound) {
      await chapterStore.getVerseByKey(chapterStore.selectedChapterId, verseKey);
    } else {
      return
    }
  }
};


</script>
<template>
  <!-- <v-container fluid class="pa-0 mt-2">
    <v-row no-gutters dense>
      <v-col cols="7"> -->
  <v-card density="compact" flat style="overflow: initial; z-index: initial" height="700">
    <v-container fluid class="pa-1">
      <v-row no-gutters dense>
        <v-col cols="7">
          <v-card-title>
            <v-text-field v-model="chapterStore.searchValue" hide-details variant="filled" density="compact"
              :label="$tr.line('surahNav.textChapters')"></v-text-field>
          </v-card-title>
          <v-card-text class="mb-4 pa-0 ma-0" >
            <v-skeleton-loader type="list-item" v-for="n in chapterStore.TOTAL_CHAPTERS" :key="n"
              v-if="chapterStore.isLoading.chapters"></v-skeleton-loader>
            <v-list lines="two" height="650" class="overflow-y-auto">
              <v-list-item v-for="chapter in chapterStore.chapters" :key="chapter.id" :value="chapter.nameSimple"
                :active="chapterStore.selectedChapterId === chapter.id" @click="getSelectedChapter(chapter)"
                :id="`chapter${chapter.id}`" @mouseenter="mouseEnter('chapter', chapter)">
                <template #title>
                  <span v-if="$tr.rtl.value">{{ localizeNumber(chapter.id, $tr.locale.value) }}-
                    {{ chapter.nameArabic }}</span>
                  <span v-else>{{ chapter.id }}- {{ chapter.nameSimple }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col>
          <v-card-title class="w-100">
            <v-text-field v-model="searchValue" hide-details density="compact" :label="$tr.line('surahNav.textVerses')"
              variant="filled"></v-text-field>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="mb-4 pa-0 ma-0" >
            <v-skeleton-loader type="list-item" v-for="n in versesCount" :key="n"
              v-if="chapterStore.isLoading.chapters"></v-skeleton-loader>
            <v-list height="650" class="overflow-y-auto">
              <v-list-item v-for="n in versesCount" :key="n" :value="n" class="text-center"
                :title="localizeNumber(n, $tr.locale.value)" @click="getSelectedVerse(n)"
                :active="selectedVerseID === n" :id="`verse-list-${n}`" @mouseenter="mouseEnter('verse', n)">
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-col>
      </v-row>
    </v-container>



  </v-card>
  <!-- </v-col> -->

  <!-- <v-col cols="5"> -->

  <!-- </v-col>
    </v-row>
  </v-container> -->
</template>