import { defineStore } from "pinia";
import { ref, computed, onMounted, watch } from "vue";
// stores
import { useTranslationsStore } from "@/stores";
// axios
import { instance } from "@/axios";
// types
import type { Chapter, ChapterInfo } from "@/types/chapter";
import type { Loading } from "@/types/chapter";
import type { Verse } from "@/types/verse";
// utils
import { verseWordFields, verseFields } from "@/utils/verse";
import { verseTranslationFields } from "@/utils/verse";

export const useChapterStore = defineStore("chapter-store", () => {
  const translationsStore = useTranslationsStore();
  const TOTAL_CHAPTERS = ref(114);
  const isLoading = ref<Loading>({ chapters: false, verses: false });
  const chaptersList = ref<Chapter[]>([]);
  const currentSortDir = ref("asc");
  const currentSort = ref("id");
  const searchValue = ref("");
  const selectedChapter = ref<Chapter | null>(null);
  const selectedChapterId = computed(() => {
    if (selectedChapter.value) {
      return selectedChapter.value.id;
    }
    return 1;
  });

  const selectedChapterPagination = computed(() => {
    if (selectedChapter.value) {
      return selectedChapter.value.pagination
    }
  })
  const chapterInfo = ref<ChapterInfo | null>(null);
  const perPage = ref(10);
  // url fields
  const urlFields = computed(() => {
    return `&words=true&translation_fields=${verseTranslationFields.join(
      ","
    )}&fields=${verseFields.join(",")}&word_fields=${verseWordFields.join(
      ","
    )}`;
  });

  const chapters = computed((): Chapter[] | undefined => {
    if (chaptersList.value) {
      const searchableKeys = ["nameSimple", "nameArabic"];
      return chaptersList.value.filter(
        (chapter: { nameSimple: string; nameArabic: string }) => {
          return searchableKeys.some((key) => {
            return chapter[key as keyof typeof chapter]
              .toLocaleLowerCase()
              .replace(/([\-\'])/, "")
              .includes(
                searchValue.value.toLocaleLowerCase().replace(/([\-\'])/, "")
              );
          });
        }
      );
    }
  });

  const getAllChapters = (): Promise<Chapter[]> => {
    return new Promise((resolve, reject) => {
      try {
        import("@/json/chapters.json").then((response) => {
          resolve(response.chapters);
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  /**
   * get all chapters data from json file
   */
  const getChapters = async () => {
    isLoading.value.chapters = true;
    await getAllChapters()
      .then((response) => {
        response.forEach((chapter: Chapter) => {
          chaptersList.value?.push({
            ...chapter,
            verses: [],
            pagination: null,
            chapterInfo: null,
            audioFile: null,
          });
        });
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        isLoading.value.chapters = false;
      });
  };

  /**
   *
   * @param chapterId
   * @returns
   */
  const getChapter = (chapterId: number) => {
    if (chaptersList.value) {
      return chaptersList.value.find((chapter) => chapter.id === chapterId);
    }
  };

  const getChapterNameByChapterId = (chapterId: number) => {
    const chapter = getChapter(chapterId);
    if (chapter) {
      return {
        nameSimple: chapter.nameSimple,
        nameArabic: chapter.nameArabic,
        bismillahPre: chapter.bismillahPre,
      };
    }
  };

  const getVerses = async (
    id: number,
    loading: boolean,
    page?: number,
    limit?: number
  ) => {
    if (!id) return;

    isLoading.value.verses = loading;
    page = page ? page : 1;
    limit = limit ? limit : perPage.value;
    isLoading.value.length = perPage.value;
    await instance
      .get(
        `/verses/by_chapter/${id}?translations=${translationsStore.selectedTranslationsIdsString}&page=${page}&per_page=${limit}&${urlFields.value}`
      )
      .then((response) => {
        const chapter = chaptersList.value.find((s) => s.id === id);
        if (chapter) {
          response.data.verses.forEach((verse: Verse) => {
            const verseFound = chapter.verses?.find(
              (v) => v.verse_key === verse.verse_key
            );

            if (!verseFound) {
              chapter.verses?.push({ ...verse, bookmarked: false });
            }
          });

          chapter.pagination = response.data.pagination;
          if (selectedChapter.value?.id === chapter.id) {
            selectedChapter.value.pagination = chapter.pagination;
            selectedChapter.value.verses = chapter.verses;
          }
        }
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        isLoading.value.verses = false;
      });
  };

  const getVerseByKey = async (id: number, verseKey: string) => {
    if (!verseKey || !id) return;
    isLoading.value.verses = true;
    isLoading.value.length = 1;
    await instance
      .get(
        `/verses/by_key/${verseKey}?translations=${translationsStore.selectedTranslationsIdsString}&${urlFields.value}`
      )
      .then((response) => {
        const chapter = chaptersList.value.find((s) => s.id === id);
        if (chapter) {
          const verseFound = chapter.verses?.find(
            (v) => v.verse_key === verseKey
          );
          if (!verseFound) {
            chapter.verses?.push({ ...response.data.verse, bookmarked: false });
          }
        }
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        isLoading.value.verses = false;
      });
  };

  onMounted(async () => {
    if (!chaptersList.value.length) {
      await getChapters();
    }
  });

  const getchapterInfo = async (id: number, lang: string = "en") => {
    return await instance.get(`/chapters/${id}/info?language=${lang}`);
  };

  // Add New Translations
  watch(
    () => translationsStore.selectedTranslationsIdsString,
    async (resources) => {
      if (resources) {
        if (selectedChapter.value) {
          selectedChapter.value.verses = [];
          await getVerses(selectedChapter.value?.id, true, 1);
        }
      }
    }
  );

  const getChapterName = (chapterId: number | string) => {
    if (chaptersList.value) {
      if (typeof chapterId === "string") chapterId = parseInt(chapterId);
      const found = chaptersList.value.find((c) => c.id === chapterId);
      if (found) {
        return {
          ar: found.nameArabic,
          en: found.nameSimple,
          bismillah: found.bismillahPre,
        };
      }
    }
  };

  const selectedChapterName = computed((): string[] | string => {
    if (selectedChapter.value) {
      return [
        selectedChapter.value.nameSimple,
        selectedChapter.value.nameArabic,
      ];
    }
    return "";
  });

  // selected chapter verses
  const selectedChapterVerses = computed(() => {
    if (selectedChapter.value) {
      return selectedChapter.value.verses;
    }
  });

  const versesKeyMap = computed(() => {
    if (selectedChapterVerses.value) {
      return selectedChapterVerses.value?.map((v) => v.verse_key);
    }
  });

  // first verse in chapter
  const getFirstVerseOfChapter = computed(() => {
    if (selectedChapterVerses.value) {
      return selectedChapterVerses.value[0];
    }
  });

  // last verse in chapter verses length
  const getLastVerseNumberOfChapter = computed(() => {
    if (selectedChapterVerses.value) {
      const verse = selectedChapterVerses.value.slice(-1)[0];
      if (verse) {
        return verse.verse_number;
      }
    }
    return 0;
  });

  // initial header data to be sent onMounted
  const getFirstVerseHeaderData = computed(() => {
    if (getFirstVerseOfChapter.value) {
      return {
        left: selectedChapterName.value,
        right: {
          pageNumber: getFirstVerseOfChapter.value.page_number,
          hizbNumber: getFirstVerseOfChapter.value.hizb_number,
          juzNumber: getFirstVerseOfChapter.value.juz_number,
        },
      };
    }
  });
  return {
    chapters,
    searchValue,
    selectedChapter,
    selectedChapterId,
    isLoading,
    perPage,
    currentSort,
    currentSortDir,
    chapterInfo,
    chaptersList,
    versesKeyMap,
    selectedChapterName,
    getFirstVerseOfChapter,
    getLastVerseNumberOfChapter,
    getFirstVerseHeaderData,
    selectedChapterVerses,
    TOTAL_CHAPTERS,
    selectedChapterPagination,
    getChapterName,
    getchapterInfo,
    getVerses,
    getVerseByKey,
    getChapters,
    getChapter,
    getChapterNameByChapterId,
  };
});
