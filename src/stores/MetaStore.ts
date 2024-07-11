import { defineStore } from "pinia";
import { ref, readonly, computed } from "vue";

export const useMetaStore = defineStore("metadata-store", () => {
  const _mainTitle = ref("");
  const _title = computed(() => {
    return import.meta.env.VITE_APP_TITLE + " - " + _mainTitle;
  });

  const _metaData = ref<
    { name?: string; property?: string; content: string }[]
  >([]);
  const pageTitle = readonly(_title);
  const metaData = readonly(_metaData);

  const setPageTitle = (v: string) => (_mainTitle.value = v);
  const setMetaData = (
    v: { name?: string; property?: string; content: string }[]
  ) => (_metaData.value = v);

  return {
    setPageTitle,
    setMetaData,
    pageTitle,
    metaData,
  };
});
