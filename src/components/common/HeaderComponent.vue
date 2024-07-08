<script setup lang="ts">
import { ref, inject, watchEffect } from "vue";
// components
import { SettingDrawerComponent } from "@/components/common";
import { useTheme } from "vuetify";
// utils
import { setStorage } from "@/utils/storage";
// types
import type { ChapterHeaderData } from "@/types/chapter";
import type { JuzHeaderData } from "@/types/juz";
import type { PageHeaderData } from "@/types/page";
import { langKey } from "@/types/symbols";

const _theme = useTheme();
const $lang = inject(langKey);
const navigationModelValue = inject("navigationModelValue");
const settingsDrawer = ref(false);
const languages = ref([
  { key: "en", value: "English", rtl: false },
  { key: "ar", value: "Arabic", rtl: true },
]);

const headerDataValue = ref<ChapterHeaderData | JuzHeaderData | PageHeaderData>()

const props = defineProps<{
  headerData: { key: string, value: ChapterHeaderData | PageHeaderData | JuzHeaderData } | null;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  "update:selectedLanguage": [value: string];
  updateHome: [value: boolean];
}>();

const toggleTheme = () => {
  _theme.global.name.value = _theme.global.current.value.dark
    ? "light"
    : "dark";
  setStorage("theme", _theme.global.name.value);
};

watchEffect(() => {
  if (props.headerData) {
    switch (props.headerData.key) {
      case "chapter":
        const chapterData = props.headerData.value as ChapterHeaderData
        headerDataValue.value = {
          left: $lang?.locale.value === "ar" ? chapterData.left[1] : chapterData.left[0],
          right: chapterData.right
        }
        break;
      case "juz":
        const juzData = props.headerData.value as JuzHeaderData
        headerDataValue.value = {
          left: $lang?.locale.value === "ar" ? juzData.left?.nameArabic : juzData.left?.nameSimple,
          right: juzData.right
        }
        break;
      case "page":
        const pageData = props.headerData.value as PageHeaderData
        headerDataValue.value = {
          left: $lang?.locale.value === "ar" ? pageData.left?.nameArabic : pageData.left?.nameSimple,
          right: pageData.right
        }
        break;

      default:
        break;
    }


    // if (props.headerData.key === "chapter") {
    //   const data = props.headerData.value as ChapterHeaderData
    //   return {
    //     left: $lang?.locale.value === "ar" ? data.left[1] : data.left[0],
    //     right: data.right
    //   }
    // } else if (props.headerData.key === "juz") {
    //   const juzHeaderData = props.headerData.value as JuzHeaderData
    //   return {
    //     left: $lang?.locale.value === "ar" ? juzHeaderData?.left?.nameArabic : juzHeaderData?.left?.nameSimple,
    //     right: juzHeaderData.right
    //   }
    // } else if (props.headerData.key === "page") {
    //   const pageHeaderData = props.headerData.value as PageHeaderData
    //   return {
    //     left: $lang?.locale.value === "ar" ? pageHeaderData?.left?.nameArabic : pageHeaderData?.left?.nameSimple,
    //     right: pageHeaderData.right
    //   }
    // } else {
    //   return ""
    // }
  }
});
</script>
<template>
  <v-app-bar :elevation="2" density="comfortable" :extension-height="40">
    <template #prepend>
      <v-avatar image="/quran8.png"></v-avatar>
      <v-app-bar-title class="ms-2" @click="$emit('updateHome', true)">
        <template #text>
          <p class="quran-header-title">{{ $tr.line('common.headingTitle') }}</p>
        </template>
      </v-app-bar-title>
    </template>
    <template #append>
      <v-btn icon="mdi-theme-light-dark" :color="_theme.global.name.value === 'dark' ? 'primary' : ''"
        @click="toggleTheme"></v-btn>
      <v-btn @click.stop="settingsDrawer = !settingsDrawer" icon="mdi-cog"></v-btn>
      <v-btn variant="text" append-icon="mdi-web">
        <v-menu activator="parent">
          <v-list>
            <v-list-item v-for="i in languages" :key="i.key" :value="i.key" :active="$tr.locale.value === i.key">
              <v-list-item-title @click="$tr.setLocale(i.key, i.rtl)">
                {{ i.value }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        {{ $tr.locale.value }}
      </v-btn>
    </template>
    <template #extension v-if="headerDataValue">
      <v-btn @click="navigationModelValue = !navigationModelValue"
        :append-icon="navigationModelValue ? 'mdi-menu-down' : 'mdi-menu-up'">
        {{ headerDataValue.left }}
      </v-btn>
      <v-sheet class="ms-auto me-4 text-body-2">
        {{ $tr.line("common.headerSurahData", [
          headerDataValue.right?.hizbNumber,
          headerDataValue.right?.juzNumber,
          headerDataValue.right?.pageNumber,
        ])
        }}
      </v-sheet>
    </template>
  </v-app-bar>
  <setting-drawer-component :settings-drawer="settingsDrawer" @update:settings-drawer="settingsDrawer = $event">
  </setting-drawer-component>
</template>
<style scoped>
.quran-header-title {
  cursor: pointer
}
</style>