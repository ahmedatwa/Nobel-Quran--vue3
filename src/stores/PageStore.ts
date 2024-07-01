import { defineStore } from "pinia";
import { computed, onMounted, ref } from "vue";
import { useTranslationsStore } from "@/stores";
import { instance } from "@/axios";
import { _range } from "@/utils/number";
import type { Pages, Verse } from "@/types";

export const usePageStore = defineStore("page-store", () => {
  const isLoading = ref(false);
  const perPage = ref(10);
  const translationsStore = useTranslationsStore();
  const pageList = ref<Pages[]>();

  const pages = computed(() => {
    return _range(604, 1);
  });

  const selectedPage = ref<Pages | null>(null);
  const searchValue = ref("");

  const getVerses = async (
    id: number,
    loading: boolean,
    page?: number,
    limit?: number
  ) => {
    isLoading.value = loading;

    page = page ? page : 1;
    limit = limit ? limit : perPage.value;

    await instance
      .get(
        `/verses/by_page/${id}?translations=${translationsStore.selectedTranslationsIdsString}&words=true&translation_fields=id,language_id,resource_id,resource_name,text,verse_key,verse_number&page=${page}&per_page=${limit}&fields=text_uthmani,chapter_id,hizb_number,text_imlaei_simple&word_fields=verse_key,verse_id,verse_number,page_number,location,text_uthmani,code_v1,qpc_uthmani_hafs`
      )
      .then((response) => {
        const page = pageList.value?.find((p) => p.pageNumber === id);
        if (page) {
          response.data.verses.forEach((verse: Verse) => {
            page.verses.push({ ...verse, bookmarked: false });
          });
        }

      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        isLoading.value = false;
      });
  };
  onMounted(() => {
    pageList.value = pages.value.map(function (el) {
      return {
        pageNumber: el,
        verses: [],
      };
    });
  });

  return {
    pages,
    selectedPage,
    searchValue,
    pageList,
    getVerses,
  };
});
