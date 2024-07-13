import { defineStore } from "pinia";
import { ref, computed, onBeforeMount, watch } from "vue";
// stores
import { useTranslationsStore, useChapterStore } from "@/stores";
// axios
import { instance } from "@/axios";
// types
import type { Juz, juzVersesByPageMap } from "@/types/juz";
import type { Verse } from "@/types/verse";
// utils
import {
  verseWordFields,
  verseFields,
  verseTranslationFields,
} from "@/utils/verse";
import { _range } from "@/utils/number";

export const useJuzStore = defineStore("juz-store", () => {
  const translationsStore = useTranslationsStore();
  const { chaptersList } = useChapterStore();

  const isLoading = ref(false);
  const juzList = ref<Juz[]>([]);
  const selectedJuz = ref<Juz | null>(null);
  const currentSortDir = ref("asc");
  const currentSort = ref("id");
  const searchValue = ref("");
  const perPage = ref(10);
  // url fields
  const urlFields = computed(() => {
    return `&words=true&translation_fields=${verseTranslationFields.join(
      ","
    )}&fields=${verseFields.join(",")}&word_fields=${verseWordFields.join(
      ","
    )}`;
  });

  /**
   * map Juz by chapter id
   * for translations tab
   * @return []
   */
  const JuzMapByChaptersTest = computed(() => {
    if (selectedJuz.value) {
      const verse_mapping = Object.entries(selectedJuz.value.verse_mapping);
      return verse_mapping.map((value) => {
        const splitVersesRange = value[1].split("-");
        return {
          chapterId: value[0],
          versesRange: {
            from: splitVersesRange[0],
            to: splitVersesRange[1],
          },
          verses: _range(
            Number(splitVersesRange[1]),
            Number(splitVersesRange[0])
          ).map((verseNumber) => {
            const found = selectedJuz.value?.verses?.find(
              (v) => v.verse_number === verseNumber
            );
            if (found) {
              return found;
            } else {
              return null;
            }
          }),
        };
      });
    }
  });
  const juzs = computed(() => {
    return juzList.value
      .filter((v) => {
        return v.juz_number.toLocaleString().includes(searchValue.value);
      })
      .sort((a: any, b: any) => {
        let modifier = 1;
        if (currentSortDir.value === "desc") modifier = -1;
        if (a[currentSort.value] < b[currentSort.value]) return -1 * modifier;
        if (a[currentSort.value] > b[currentSort.value]) return 1 * modifier;
        return 0;
      });
  });

  const getVerses = async (
    juzNumber: number,
    loading: boolean,
    page?: number,
    limit?: number
  ) => {
    isLoading.value = loading;
    page = page ? page : 1;
    limit = limit ? limit : perPage.value;

    await instance
      .get(
        `/verses/by_juz/${juzNumber}?translations=${translationsStore.selectedTranslationsIdsString}&page=${page}&per_page=${limit}&${urlFields.value}`
      )
      .then((response) => {
        const juz = juzList.value.find((s) => s.juz_number === juzNumber);
        if (juz) {
          response.data.verses.forEach((verse: Verse) => {
            const verseFound = juz.verses?.find(
              (v) => v.verse_key === verse.verse_key
            );

            if (!verseFound) {
              juz.verses?.push({ ...verse, bookmarked: false });
            }
          });
          juz.pagination = response.data.pagination;
          if (selectedJuz.value?.pagination) {
            selectedJuz.value.pagination = response.data.pagination;
          }
        }
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const getJuzs = async () => {
    isLoading.value = true;
    await instance
      .get("/juzs")
      .then((response) => {
        const result: any[] = [
          ...new Map(
            response.data.juzs.map((item: Juz) => [item.juz_number, item])
          ).values(),
        ];

        if (result) {
          result.forEach((c: Juz) => {
            juzList.value?.push({
              ...c,
              verses: [],
            });
          });
        }
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  onBeforeMount(async () => {
    if (!juzList.value.length) {
      await getJuzs();
    }
  });

  const juzVersesByChapterMap = computed((): juzVersesByPageMap | undefined => {
    if (selectedJuz.value) {
      if (selectedJuz.value.verses)
        return selectedJuz.value?.verses.reduce(
          (result: any, currentValue: Verse) => {
            (result[currentValue.chapter_id] =
              result[currentValue.chapter_id] || []).push(currentValue);
            return result;
          },
          {}
        );
    }
  });

  const sort = (s: string) => {
    if (s === currentSort.value) {
      currentSortDir.value = currentSortDir.value === "asc" ? "desc" : "asc";
    }
    currentSort.value = s;
  };

  watch(
    () => translationsStore.selectedTranslationsIdsString,
    async (resources) => {
      if (resources) {
        if (selectedJuz.value) {
          selectedJuz.value.verses = [];
          await getVerses(selectedJuz.value?.id, true, 1);
        }
      }
    }
  );

  const getChapterNameByVerseKey = (chapterId: number) => {
    if (chaptersList) {
      const found = chaptersList.find((c) => c.id === Number(chapterId));
      if (found) {
        return {
          ar: found.nameArabic,
          en: found.nameSimple,
          bismillah: found.bismillahPre,
        };
      }
    }
  };

  const getFirstVerseOfJuz = computed(() => {
    if (selectedJuz.value?.verses) {
      return selectedJuz.value?.verses[0];
    }
  });

  const getLastVerseOfJuz = computed(() => {
    if (selectedJuz.value) {
      const verse = selectedJuz.value.verses?.slice(-1)[0];      
      if (verse) {
        return verse.id;
      }
    }
    return 0;
  });

  return {
    isLoading,
    juzs,
    JuzMapByChaptersTest,
    searchValue,
    selectedJuz,
    juzList,
    juzVersesByChapterMap,
    currentSort,
    currentSortDir,
    getFirstVerseOfJuz,
    getLastVerseOfJuz,
    getChapterNameByVerseKey,
    getJuzs,
    sort,
    getVerses,
  };
});
