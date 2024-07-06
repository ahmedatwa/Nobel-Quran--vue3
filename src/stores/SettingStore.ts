import { defineStore } from "pinia";
import { ref } from "vue";
import { CssVars } from "@/types";

export const useSettingStore = defineStore("setting-store", () => {
  const versesPages = ref([10, 20, 30, 40, 50]);
  const VersesPerPage = ref(10);
  const audioPlayerSetting = ref({
    inset: true,
    autoPlay: true,
    dismissOnEnd: true
  })

  const cssVars = ref<CssVars>({
    quranFrontSize: 3,
    quranFontFamily: "Amiri",
    translationsFontSize: 3,
    translationsFontFamily: "1",
  });

  const fontFamilyGroup = ref([
    "Amiri",
    "Aref",
    "UthmanicHafs",
    "Surahnames",
  ]);

  return {
    versesPages,
    VersesPerPage,
    audioPlayerSetting,
    cssVars,
    fontFamilyGroup,
  };
});
