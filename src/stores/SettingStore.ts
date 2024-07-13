import { defineStore } from "pinia";
import { onMounted, ref, watchEffect } from "vue";
import { CssVars } from "@/types";
import { getStorage, setStorage } from "@/utils/storage";

export const useSettingStore = defineStore("setting-store", () => {
  const versesPages = ref([10, 20, 30, 40, 50]);
  const VersesPerPage = ref(10);
  const audioPlayerSetting = ref({
    fullwidth: false,
    autoPlay: true,
    dismissOnEnd: true,
    autoScroll: true,
    tooltip: false,
  });

  const cssVars = ref<CssVars>({
    quranFrontSize: 3,
    quranFontFamily: "Noto-Kufi",
    translationsFontSize: 3,
    translationsFontFamily: "1",
  });

  const fontFamilyGroup = ref(["Amiri", "Noto-Kufi"]);

  watchEffect(() => {
    if (audioPlayerSetting.value) {
      setStorage("user-setting", audioPlayerSetting.value);
    }
  });

  watchEffect(() => {
    if (cssVars.value) {
      setStorage("style-setting", cssVars.value);
    }
  });

  onMounted(() => {
    const userSettings = getStorage("user-setting");
    if (userSettings) {
      audioPlayerSetting.value = userSettings;
    } else {
      setStorage("user-setting", audioPlayerSetting.value);
    }
    const styleSettings = getStorage("style-setting");
    if (styleSettings) {
      cssVars.value = styleSettings;
    } else {
      setStorage("style-setting", cssVars.value);
    }
  });

  return {
    versesPages,
    VersesPerPage,
    audioPlayerSetting,
    cssVars,
    fontFamilyGroup,
  };
});
