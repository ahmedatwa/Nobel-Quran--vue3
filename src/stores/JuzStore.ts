import { defineStore } from "pinia";
import { ref, computed, onMounted, watch } from "vue";
import { useTranslationsStore } from "@/stores";
import { instance } from "@/axios";
import type { Juz, Verse } from "@/types";

export const useJuzStore = defineStore("juz-store", () => {
  const translationsStore = useTranslationsStore();
  const isLoading = ref(false);
  const juzList = ref<Juz[]>([]);
  const selectedJuz = ref<Juz | null>(null);
  const currentSortDir = ref("asc");
  const currentSort = ref("id");
  const searchValue = ref("");
  const perPage = ref(10);

  const juzs = computed(() => {
    if (juzList.value) {
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
    }
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
        `/verses/by_juz/${juzNumber}?translations=${translationsStore.selectedTranslationsIdsString}&words=true&translation_fields=resource_name,language_id&page=${page}&per_page=${limit}&fields=text_uthmani,chapter_id,hizb_number,text_imlaei_simple&word_fields=verse_key,verse_id,page_number,location,text_uthmani,code_v1,qpc_uthmani_hafs,text_uthmani_simple`
      )
      .then((response) => {
        const juz = juzList.value.find((s) => s.id === juzNumber);
        if (juz) {
          response.data.verses.forEach((verse: Verse) => {
            const isVerseFound = juz.verses.find(
              (v) => v.verse_key === verse.verse_key
            );
            if (!isVerseFound) {
              juz.verses.push({ ...verse, bookmarked: false });
              juz.pagination = response.data.pagination;
            }
          });
          selectedJuz.value = juz
        }
      })
      .catch((e) => {
        console.log(e);
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
        response.data.juzs.forEach((c: Juz) => {
          juzList.value?.push({
            ...c,
            verses: [],
            chapterInfo: null,
            audioFile: null,
          });
        });
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  onMounted(() => {
    if (!juzList.value?.length) getJuzs();
  });

  const juzVerseMap = computed(() => {
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
          await getVerses(selectedJuz.value?.id, true, 1);
        }
      }
    }
  );

  return {
    isLoading,
    juzs,
    searchValue,
    selectedJuz,
    juzList,
    juzVerseMap,
    currentSort,
    currentSortDir,
    getJuzs,
    sort,
    getVerses,
  };
});
