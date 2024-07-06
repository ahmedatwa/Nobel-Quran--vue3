<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from "vue";
// stores
import { useChapterStore } from "@/stores";
// utils
import { _range, localizeNumber } from "@/utils/number";
import { isVerseKeyWithinRanges } from "@/utils/verse";
// types
import type { Chapter } from "@/types/chapter";
import { scrollToElement } from "@/utils/useScrollToElement";

// Stores
const chapterStore = useChapterStore();
const selectedVerseID = ref();
const selectedChapterId = ref();
const searchValue = ref("");

const emit = defineEmits<{
  "update:selectedVerseKeyView": [value: string];
}>();

const props = defineProps<{
  intersectingVerseNumber?: number;
}>();

onMounted(async () => {
  if (!chapterStore.selectedChapter) {
    chapterStore.selectedChapter = chapterStore.chaptersList[0]
    selectedChapterId.value = 1
    selectedVerseID.value = 1
    if (!chapterStore.selectedChapter.verses?.length) [
      await chapterStore.getVerses(selectedChapterId.value, true)
    ]
  } else {
    selectedChapterId.value = chapterStore.selectedChapter.id
    selectedVerseID.value = 1
  }

});

watchEffect(() => {
  if (selectedChapterId.value) {
    scrollToElement(`#chapter${selectedChapterId.value}`, 700);
  }
});

/**
 * creates range from verse count
 */
const versesCount = computed(() => {
  if (chapterStore.selectedChapter) {
    return _range(chapterStore.selectedChapter.versesCount, 1);
  }
});

const getSelectedChapter = async (chapter: Chapter) => {
  chapterStore.selectedChapter = chapter;
  selectedChapterId.value = chapter.id;
  selectedVerseID.value = 1;
  // setStorage("chapter", { data: chapter, verse: selectedVerseID.value });
};

const getSelectedVerse = async (id: number) => {
  selectedVerseID.value = id;
  emit("update:selectedVerseKeyView", `${selectedChapterId.value}:${id}`);
  // setStorage("chapter", {
  //   data: chapterStore.selectedChapter,
  //   verse: selectedVerseID.value,
  // });
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
  if (props.intersectingVerseNumber) {
    selectedVerseID.value = props.intersectingVerseNumber;
    if (chapterStore.selectedChapter) {
      if (chapterStore.selectedChapter?.versesCount ===
        chapterStore.selectedChapter.verses?.length
      ) {
        chapterStore.isLoading.verses = false
        return;
      }


      scrollToElement(`#verse${selectedVerseID.value}`, 100);
      if (chapterStore.selectedChapter.verses) {
        if (
          props.intersectingVerseNumber ===
          chapterStore.selectedChapter.verses?.length ||
          props.intersectingVerseNumber ===
          chapterStore.selectedChapter.verses?.length - 3
        ) {
          await getVerseByKey(`${selectedChapterId.value}:${chapterStore.selectedChapter.verses?.length + 1}`);
        }
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
      await chapterStore.getVerses(chapter.id, true);
    }
  }
  if (k === "verse") {
    const verseNumber = value as number;
    // trigger only when hover on verse greater than 
    // default per page value as api will be called 
    // twice for the same verse if chapter selected
    if (verseNumber >= chapterStore.perPage) {
      const verseKey = `${selectedChapterId.value}:${verseNumber}`;
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
  console.log(verseKey);
  
  if (chapterStore.selectedChapter) {
    const verseFound = chapterStore.selectedChapter.verses?.find(
      (cv) => cv.verse_key === verseKey
    );
    console.log(verseFound);
    
    if (!verseFound) {
      await chapterStore.getVerseByKey(selectedChapterId.value, verseKey);
    } else {
      return
    }
  }
};


</script>
<template>
  <v-container fluid class="pa-0 mt-2">
    <v-row no-gutters dense>
      <v-col cols="7">
        <v-card density="compact" flat>
          <v-card-title>
            <v-text-field v-model="chapterStore.searchValue" hide-details variant="filled" density="compact"
              :label="$tr.line('surahNav.textChapters')"></v-text-field>
          </v-card-title>
          <v-divider></v-divider>
          <v-sheet height="650" class="overflow-y-auto">
            <v-skeleton-loader type="list-item" v-for="n in 114" :key="n"
              v-if="chapterStore.isLoading.chapters"></v-skeleton-loader>
            <v-list lines="two" class="mb-5">
              <v-list-item v-for="chapter in chapterStore.chapters" :key="chapter.id" :value="chapter.nameSimple"
                :active="selectedChapterId === chapter.id" @click="getSelectedChapter(chapter)"
                :id="`chapter${chapter.id}`" @mouseenter="mouseEnter('chapter', chapter)">
                <template #title>
                  <span v-if="$tr.rtl.value">{{ localizeNumber(chapter.id, $tr.locale.value) }}-
                    {{ chapter.nameArabic }}</span>
                  <span v-else>{{ chapter.id }}- {{ chapter.nameSimple }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-sheet>
        </v-card>
      </v-col>
      <v-divider vertical></v-divider>
      <v-col cols="5">
        <v-card density="compact" flat>
          <v-card-title>
            <v-text-field v-model="searchValue" hide-details density="compact" :label="$tr.line('surahNav.textVerses')"
              variant="filled"></v-text-field>
          </v-card-title>
          <v-divider></v-divider>
          <v-sheet height="650" class="overflow-y-auto">
            <v-skeleton-loader type="list-item" v-for="n in chapterStore.selectedChapter?.versesCount" :key="n"
              v-if="chapterStore.isLoading.chapters"></v-skeleton-loader>
            <v-list class="mb-5">
              <v-list-item v-for="n in versesCount" :key="n" :value="n" class="text-center"
                :title="localizeNumber(n, $tr.locale.value)" @click="getSelectedVerse(n)"
                :active="selectedVerseID === n" :id="`verse${n}`" @mouseenter="mouseEnter('verse', n)">
              </v-list-item>
            </v-list>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>