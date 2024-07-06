import { defineStore } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
// stores
import { useTranslationsStore } from "@/stores";
// axios
import { instance } from "@/axios";
// utils
import { _range } from "@/utils/number";
import { getAllPages } from "@/utils/pages";

// types
import type { Page } from "@/types/page";
import type { Verse } from "@/types/verse";
// utils
import {
  verseWordFields,
  verseFields,
  verseTranslationFields,
} from "@/utils/verse";

export const usePageStore = defineStore("page-store", () => {
  const isLoading = ref(false);
  const perPage = ref(10);
  const translationsStore = useTranslationsStore();
  const selectedPage = ref<Page | null>(null);
  const searchValue = ref("");
  const pagesList = ref<Page[]>([]);

  const pages = computed(() => {
    if (pagesList.value) {
      return pagesList.value.filter((page) => {
        return page.pageNumber.toLocaleString().includes(searchValue.value.toLocaleLowerCase());
      });
    }
  });
  // url fields
  const urlFields = computed(() => {
    return `&words=true&translation_fields=${verseTranslationFields.join(
      ","
    )}&fields=${verseFields.join(",")}&word_fields=${verseWordFields.join(
      ","
    )}`;
  });
  const getVerses = async (
    id: number,
    loading: boolean,
    page: number = 1,
    limit: number = perPage.value
  ) => {
    isLoading.value = loading;
    await instance
      .get(
        `/verses/by_page/${id}?translations=${translationsStore.selectedTranslationsIdsString}&page=${page}&per_page=${limit}&${urlFields.value}`
      )
      .then((response) => {
        const page = pagesList.value?.find((p) => p.pageNumber === id);
        if (page) {
          response.data.verses.forEach((verse: Verse) => {
            const verseFound = page.verses?.find(
              (v) => v.verse_key === verse.verse_key
            );

            if (!verseFound) {
              page.verses?.push({ ...verse, bookmarked: false });
            }
          });
          page.pagination = response.data.pagination;
          if(selectedPage.value?.pagination){
            selectedPage.value.pagination = response.data.pagination;

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

  onMounted(() => {
    const pages = getAllPages();
    if (pages) pagesList.value = pages;
  });

  watch(
    () => translationsStore.selectedTranslationsIdsString,
    async (resources) => {
      if (resources) {
        if (selectedPage.value) {
          selectedPage.value.verses = [];
          await getVerses(selectedPage.value?.pageNumber, true);
        }
      }
    }
  );

  return {
    pages,
    pagesList,
    perPage,
    isLoading,
    selectedPage,
    searchValue,
    getVerses,
  };
});
