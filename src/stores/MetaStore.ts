import { defineStore } from "pinia";
import { ref, readonly } from "vue";

export const useMetaStore = defineStore("metadata-store", () => {
  const _title = ref("Nobel Quran");
  const _metaData = ref<any[]>([]);
  const pageTitle = readonly(_title);
  const metaData = readonly(_metaData);

  const setPageTitle = (v: string) => (_title.value = v);
  const setMetaData = (v: any[]) => (_metaData.value = v);

  return {
    setPageTitle,
    setMetaData,
    pageTitle,
    metaData,
  };
});
