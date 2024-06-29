import { defineStore } from "pinia";
import { ref } from "vue";
import { CssVars } from "@/types";

export const useSettingStore = defineStore("setting-store", () => {
  const versesPages = ref([10, 20, 30, 40, 50]);
  const VersesPerPage = ref(10);
  const autoPlay = ref(true);
  const inset = ref(true);

  const cssVars = ref<CssVars>({
    quranFrontSize: 3,
    quranFontFamily: "UthmanicHafs",
    translationsFontSize: 3,
    translationsFontFamily: "1",
  });

  const fontFamilyGroup = ref([
    "Amiri",
    "Aref",
    "IndoPak",
    "UthmanicHafs",
    "Surahnames",
  ]);

  return {
    versesPages,
    VersesPerPage,
    autoPlay,
    cssVars,
    fontFamilyGroup,
    inset,
  };
});
