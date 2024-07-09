import { defineStore } from "pinia";
import { ref } from "vue";
import { CssVars } from "@/types";

export const useSettingStore = defineStore("setting-store", () => {
  const versesPages = ref([10, 20, 30, 40, 50]);
  const VersesPerPage = ref(10);
  const audioPlayerSetting = ref({
    inset: false,
    autoPlay: true,
    dismissOnEnd: true,
    autoScroll: true,
    tooltip: false,
  })

  const cssVars = ref<CssVars>({
    quranFrontSize: 3,
    quranFontFamily: "Noto-Naskh",
    translationsFontSize: 3,
    translationsFontFamily: "1",
  });

  const fontFamilyGroup = ref([
    "Amiri",
    "Aref",
    "Noto-Naskh",
    "Noto-Kufi",
  ]);

  return {
    versesPages,
    VersesPerPage,
    audioPlayerSetting,
    cssVars,
    fontFamilyGroup,
  };
});
