import { defineStore } from "pinia";
import { ref, computed, onMounted, watch } from "vue";
import { useTranslationsStore } from "@/stores";
import { instance } from "@/axios";
import type { Chapter, Verse, ChapterInfo } from "@/types";

export const useSurahStore = defineStore("chapter-store", () => {
  const translationsStore = useTranslationsStore();
  const isLoading = ref({
    chapters: false,
    verses: false,
    info: false,
  });
  const surahList = ref<Chapter[]>([]);
  const currentSortDir = ref("asc");
  const currentSort = ref("id");
  const searchValue = ref("");
  const selectedSurah = ref<Chapter | null>(null);
  const surahInfo = ref<ChapterInfo | null>(null);
  const perPage = ref(10);

  const surahs = computed((): Chapter[] | undefined => {
    if (surahList.value) {
      const searchableKeys = ["name_simple", "name_arabic"];
      return surahList.value
        .filter((chapter: { name_simple: string; name_arabic: string }) => {
          return searchableKeys.some((key) => {
            return chapter[key as keyof typeof chapter]
              .toLocaleLowerCase()
              .replace(/([\-\'])/, "")
              .includes(
                searchValue.value.toLocaleLowerCase().replace(/([\-\'])/, "")
              );
          });
        })
        .sort((a: any, b: any) => {
          let modifier = 1;
          if (currentSortDir.value === "desc") modifier = -1;
          if (a[currentSort.value] < b[currentSort.value]) return -1 * modifier;
          if (a[currentSort.value] > b[currentSort.value]) return 1 * modifier;
          return 0;
        });
    }
  });

  const getChapters = async () => {
    isLoading.value.chapters = true;
    await instance
      .get("/chapters")
      .then((response) => {
        response.data.chapters.forEach((c: Chapter) => {
          surahList.value?.push({
            ...c,
            verses: [],
            pagination: null,
            chapterInfo: null,
            audioFile: null,
          });
        });
      })
      .catch((error: any) => {
        throw error;
      })
      .finally(() => {
        isLoading.value.chapters = false;
      });
  };

  const getVerses = async (
    id: number,
    loading: boolean,
    page?: number,
    limit?: number
  ) => {
    isLoading.value.verses = loading;
    page = page ? page : 1;
    limit = limit ? limit : perPage.value;

    await instance
      .get(
        `/verses/by_chapter/${id}?translations=${translationsStore.selectedTranslationsIdsString}&words=true&translation_fields=id,language_id,resource_id,resource_name,text,verse_key,verse_number&page=${page}&per_page=${limit}&fields=text_uthmani,chapter_id,hizb_number,text_imlaei_simple&word_fields=verse_key,verse_id,verse_number,page_number,location,text_uthmani,code_v1,qpc_uthmani_hafs`
      )
      .then((response) => {
        const chapter = surahList.value.find((s) => s.id === id);
        if (chapter) {
          response.data.verses.forEach((verse: Verse) => {
            const isVerseFound = chapter.verses.find(
              (v) => v.verse_key === verse.verse_key
            );
            if (!isVerseFound) {
              chapter.verses.push({ ...verse, bookmarked: false });
            }
          });
        }

        // pagination
          // if (selectedSurah.value) {
          //   const pagination = response.data.pagination;
          //   const totalRecordsFetched =
          //     pagination.total_records - selectedSurah.value?.verses.length;
          //   selectedSurah.value.pagination = {
          //     ...pagination,
          //     totalRecordsFetched,
          //   };
          // }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        isLoading.value.verses = false;
      });
  };

  const getVerseByKey = async (id: number, verseKey: string) => {
    if(!verseKey) return 
    
    isLoading.value.verses = true;
    await instance
      .get(
        `/verses/by_key/${verseKey}?translations=${translationsStore.selectedTranslationsIdsString}&words=true&translation_fields=id,language_id,resource_id,resource_name,text,verse_key,verse_number&fields=text_uthmani,chapter_id,hizb_number,text_imlaei_simple&word_fields=verse_key,verse_id,verse_number,page_number,location,text_uthmani,code_v1,qpc_uthmani_hafs`
      )
      .then((response) => {
        const chapter = surahList.value.find((s) => s.id === id);
        if (chapter) {
          const isVerseFound = chapter.verses.find(
            (v) => v.verse_key === verseKey
          );
          if (!isVerseFound) {
            chapter.verses.push({
              ...response.data.verse,
              bookmarked: false,
            });
          }
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        isLoading.value.verses = false;
      });
  };

  onMounted(async () => {
    if (!surahList.value.length) await getChapters();
  });

  const getSurahInfo = async (id: number) => {
    return await instance.get(`/chapters/${id}/info`);
  };

  const sort = (s: string) => {
    if (s === currentSort.value) {
      currentSortDir.value = currentSortDir.value === "asc" ? "desc" : "asc";
    }
    currentSort.value = s;
  };

  // Add New Translations
  watch(
    () => translationsStore.selectedTranslationsIdsString,
    async (resources) => {
      if (resources) {
        if (selectedSurah.value) {
          await getVerses(selectedSurah.value?.id, true, 1);
        }
      }
    }
  );

  const getChapterName = (id: number | string) => {
    if (typeof id === "string") id = parseInt(id);
    if (surahs.value) {
      const found = surahs.value.find((c) => c.id === id);
      if (found) {
        return {
          ar: found.name_arabic,
          en: found.name_simple,
          bismillah: found.bismillah_pre,
        };
      }
    }
  };

  /**
   * Given list of verses, get all the first and the last verseKeys
   *
   * @param {Record<string, Verse>} verses
   * @returns {string[]} [firstVerseKey, lastVerseKey]
   */

  const getFirstAndLastVerseKeys = (
    verses: Record<string, Verse>
  ): string[] => {
    const verseKeys = Object.keys(verses).sort();
    return [verseKeys[0], verseKeys[verseKeys.length - 1]];
  };

  const isVerseKeyWithinRanges = (verseKey: string, range?: string[]) => {
    if (range) return range.includes(verseKey);
  };

  const versesKeyMap = computed(() => {
    return selectedSurah.value?.verses.map((v) => v.verse_key);
  });

  return {
    surahs,
    searchValue,
    selectedSurah,
    isLoading,
    currentSort,
    currentSortDir,
    surahInfo,
    surahList,
    getChapterName,
    versesKeyMap,
    getSurahInfo,
    getVerses,
    getVerseByKey,
    getFirstAndLastVerseKeys,
    isVerseKeyWithinRanges,
    sort,
    getChapters,
  };
});
