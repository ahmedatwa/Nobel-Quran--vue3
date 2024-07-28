import { defineStore } from "pinia";
import { ref, computed, onBeforeMount, watch } from "vue";
// types
import { Translation, TranslationReduceMap } from "@/types/translations";

export const useTranslationsStore = defineStore("translations-store", () => {
  const isLoading = ref(false);
  const translationsList = ref<Translation[]>([]);
  const selectedTranslationIds = ref<number[]>([131]);
  const selectedTranslations = ref<Translation[]>([]);

  const getAllTranslations = (): Promise<Translation[]> => {
    return new Promise((resolve, reject) => {
      try {
        import("@/json/translations.json").then((response) => {
          resolve(response.translations);
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const getTranslations = async () => {
    isLoading.value = true;
    await getAllTranslations()
      .then((response) => {
        response.forEach((res) => translationsList.value?.push({...res}));
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

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

  onBeforeMount(async () => {
    await getTranslations();
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

  watch(translationsList.value, (val) => {
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
    getTranslations,
  };
});
