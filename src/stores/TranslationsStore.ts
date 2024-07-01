import { defineStore } from "pinia";
import { ref, computed, onBeforeMount, watch } from "vue";
import { instance } from "@/axios";
// types
import { Translation, TranslationReduceMap } from "@/types";

export const useTranslationsStore = defineStore("translations-store", () => {
  const isLoading = ref(false);
  const translationsList = ref<Translation[] | null>(null);
  const selectedTranslationIds = ref<number[]>([131]);
  const selectedTranslations = ref<Translation[]>([]);

  const getTranslations = async () => {
    // Get List of Translators
    isLoading.value = true;
    await instance
      .get("/resources/translations?language=en")
      .then((response) => {
        translationsList.value = response.data.translations;
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        isLoading.value = false;
      });
  }

  // const getSingleTranslation = async (
  //   translationId: number,
  //   chapterID: number
  // ) => {
  //   return await instance.get(
  //     `/quran/translations/${translationId}?chapter_number=${chapterID}&fields=resource_name,id,language_id,resource_name,verse_id,verse_key,verse_number`
  //   );
  // };

  // Group translators by language
  const translations = computed(() => {
    if (translationsList.value) {
      return translationsList.value.reduce(
        (acc: TranslationReduceMap, obj: Translation) => {
          (acc[obj.language_name] = acc[obj.language_name] || []).push(obj);
          return acc;
        },
        {}
      );
    }
  });

  onBeforeMount(() => {
    getTranslations();
  });

  const selectedTranslationsAuthors = computed(() => {
    if (selectedTranslations.value) {
      return selectedTranslations.value.map((t) => t.author_name);
    } else {
      return [];
    }
  });

  const selectedTranslationsIdsString = computed(() => {
    return selectedTranslationIds.value.join(",");
  });

  const groupedTranslationsAuthors = computed(() => {
    if (selectedTranslationsAuthors.value.length > 1) {
      return (
        selectedTranslationsAuthors.value[0] +
        " and " +
        (selectedTranslationsAuthors.value.length - 1) +
        " others"
      );
    } else {
      return selectedTranslationsAuthors.value[0];
    }
  });

  watch(selectedTranslationIds, () => {
    if (selectedTranslations) {
      selectedTranslations.value = [];
      selectedTranslationIds.value.forEach((id) => {
        const found = translationsList.value?.find((tr) => tr.id === id);
        if (found) {
          selectedTranslations.value.push(found);
        }
      });
    }
  });

  watch(translationsList, (val) => {
    if (val) {
      const found = val.find((tr) => tr.id === 131);
      if (found) {
        selectedTranslations.value.push(found);
      }
    }
  });

  return {
    translations,
    isLoading,
    translationsList,
    selectedTranslations,
    selectedTranslationsAuthors,
    selectedTranslationIds,
    selectedTranslationsIdsString,
    groupedTranslationsAuthors,
   // getSingleTranslation,
    getTranslations,
  };
});
