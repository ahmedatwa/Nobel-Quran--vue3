import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useTranslationsStore } from "@/stores";
import { instance } from "@/axios";
import { useMemoize } from "@vueuse/core";
import { _range } from "@/utils/number";

export const usePageStore = defineStore("page-store", () => {
  const isLoading = ref(false);
  const perPage = ref(10);
  const translationsStore = useTranslationsStore();
  const pages = computed(() => {
    return _range(604, 1);
  });
  const selectedPage = ref(1);
  const searchValue = ref("");

  const getVerses = useMemoize(
    async (id: number, loading: boolean, page?: number, limit?: number) => {
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
              chapter.verses.push({ ...verse, bookmarked: false });
            });
          }

          // pagination
          if (selectedSurah.value) {
            const pagination = response.data.pagination;
            const totalRecordsFetched =
              pagination.total_records - selectedSurah.value?.verses.length;
            selectedSurah.value.pagination = {
              ...pagination,
              totalRecordsFetched,
            };
          }
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          isLoading.value.verses = false;
        });
    }
  );

  return {
    pages,
    selectedPage,
    searchValue,
    getVerses,
  };
});
