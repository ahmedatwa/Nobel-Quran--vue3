import { defineStore } from "pinia";
import { ref, computed, onMounted, watch } from "vue";
// stores
import { useTranslationsStore } from "@/stores";
// axios
import { instance } from "@/axios";

// types
import type {
  Chapter,
  ChapterInfo,
  Loading,
  ChapterSchema,
} from "@/types/chapter";
import type { Verse } from "@/types/verse";

export const useChapterStore = defineStore("chapter-store", () => {
  const translationsStore = useTranslationsStore();
  const isLoading = ref<Loading>({
    chapters: false,
    verses: false,
    info: false,
    length: 0,
  });
  const chaptersList = ref<Chapter[]>([]);
  const currentSortDir = ref("asc");
  const currentSort = ref("id");
  const searchValue = ref("");
  const selectedChapter = ref<Chapter | null>(null);
  const chapterInfo = ref<ChapterInfo | null>(null);
  const perPage = ref(10);

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

  const getChapters = async () => {
    isLoading.value.chapters = true;
    await instance
      .get("/chapters")
      .then((response) => {
        response.data.chapters.forEach((chapter: ChapterSchema) => {
          chaptersList.value?.push({
            id: chapter.id,
            revelationPlace: chapter.revelation_place,
            revelationOrder: chapter.revelation_order,
            bismillahPre: chapter.bismillah_pre,
            nameSimple: chapter.name_simple,
            nameComplex: chapter.name_complex,
            nameArabic: chapter.name_arabic,
            versesCount: chapter.verses_count,
            pages: chapter.pages,
            translatedName: {
              name: chapter.translated_name.name,
              languageName: chapter.translated_name.language_name,
            },
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
    if (!id) return;

    isLoading.value.verses = loading;
    page = page ? page : 1;
    limit = limit ? limit : perPage.value;
    isLoading.value.length = perPage.value;
    await instance
      .get(
        `/verses/by_chapter/${id}?translations=${translationsStore.selectedTranslationsIdsString}&words=true&translation_fields=id,language_id,resource_id,resource_name,text,verse_key,verse_number&page=${page}&per_page=${limit}&fields=text_uthmani,text_uthmani_simple,text_imlaei,text_imlaei_simple,text_indopak,juz_number,hizb_number,sajdah_type,page_number,text_uthmani_tajweed&word_fields=position,text_uthmani,text_indopak,text_imlaei,verse_key,page_number,line_number,location,char_type_name,code_v1,code_v2`
      )
      .then((response) => {
        const chapter = chaptersList.value.find((s) => s.id === id);
        if (chapter) {
          response.data.verses.forEach((verse: Verse) => {
            const isVerseFound = chapter.verses?.find((v) => v.id === id);
            if (!isVerseFound) {
              chapter.verses?.push({ ...verse, bookmarked: false });
              if (selectedChapter.value?.id === chapter.id) {
                selectedChapter.value.verses?.push({
                  ...verse,
                  bookmarked: false,
                });
              }
            }
          });
        }
      })
      .catch((e) => {
        console.log(e);
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
        `/verses/by_key/${verseKey}?translations=${translationsStore.selectedTranslationsIdsString}&words=true&translation_fields=id,language_id,resource_id,resource_name,text,verse_key,verse_number&fields=text_uthmani,chapter_id,hizb_number,text_imlaei_simple&word_fields=verse_key,verse_id,verse_number,page_number,location,text_uthmani,code_v1,qpc_uthmani_hafs`
      )
      .then((response) => {
        const chapter = chaptersList.value.find((s) => s.id === id);
        if (chapter) {
          const isVerseFound = chapter.verses?.find(
            (v) => v.verse_key === verseKey
          );
          if (!isVerseFound) {
            chapter.verses?.push({ ...response.data.verse, bookmarked: false });
            if (selectedChapter.value?.id === chapter.id) {
              selectedChapter.value.verses?.push({
                ...response.data.verse,
                bookmarked: false,
              });
            }
          }
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        // isLoading.value.verses = false;
      });
  };

  onMounted(async () => {
    if (!chaptersList.value.length) {
      await getChapters();
    }
  });

  const getchapterInfo = async (id: number) => {
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
        if (selectedChapter.value) {
          selectedChapter.value.verses = [];
          await getVerses(selectedChapter.value?.id, true, 1);
        }
      }
    }
  );

  const getChapterName = (id: number | string) => {
    if (typeof id === "string") id = parseInt(id);
    if (chaptersList.value) {
      const found = chaptersList.value.find((c) => c.id === id);
      if (found) {
        return {
          ar: found.nameArabic,
          en: found.nameSimple,
          bismillah: found.bismillahPre,
        };
      }
    }
  };

  const versesKeyMap = computed(() => {
    if (selectedChapter.value) {
      return selectedChapter.value.verses?.map((v) => v.verse_key);
    }
  });

  return {
    chapters,
    searchValue,
    selectedChapter,
    isLoading,
    currentSort,
    currentSortDir,
    chapterInfo,
    chaptersList,
    versesKeyMap,
    getChapterName,
    getchapterInfo,
    getVerses,
    getVerseByKey,
    sort,
    getChapters,
  };
});
