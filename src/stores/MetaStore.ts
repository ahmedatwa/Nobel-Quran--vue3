import { defineStore } from "pinia";
import { ref, readonly, computed } from "vue";

type MetaData = {
  name?: string;
  property?: string;
  content: string;
};

export const useMetaStore = defineStore("metadata-store", () => {
  const _mainTitle = ref("");
  const _title = computed(() => {
    if (_mainTitle.value) {
      return import.meta.env.VITE_APP_TITLE + " - " + _mainTitle.value;
    }
    return import.meta.env.VITE_APP_TITLE;
  });

  const _metaData = ref<MetaData[]>([]);

  const pageTitle = readonly(_title);
  const metaData = readonly(_metaData);

  const setPageTitle = (v: string) => (_mainTitle.value = v);
  const setMetaData = (v: MetaData[]) => (_metaData.value = v);

  return {
    setPageTitle,
    setMetaData,
    pageTitle,
    metaData,
  };
});
