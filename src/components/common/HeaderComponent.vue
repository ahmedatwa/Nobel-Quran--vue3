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
import { localizeNumber } from "@/utils/number";

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
          right: {
            pageNumber: localizeNumber(chapterData.right.pageNumber, $lang?.locale.value),
            juzNumber: localizeNumber(chapterData.right.juzNumber, $lang?.locale.value),
            hizbNumber: localizeNumber(chapterData.right.hizbNumber, $lang?.locale.value),
          }
        }
        break;
      case "juz":
        const juzData = props.headerData.value as JuzHeaderData
        headerDataValue.value = {
          left: $lang?.locale.value === "ar" ? juzData.left?.nameArabic : juzData.left?.nameSimple,
          right: {
            pageNumber: localizeNumber(juzData.right.pageNumber, $lang?.locale.value),
            juzNumber: localizeNumber(juzData.right.juzNumber, $lang?.locale.value),
            hizbNumber: localizeNumber(juzData.right.hizbNumber, $lang?.locale.value),
          }
        }
        break;
      case "page":
        const pageData = props.headerData.value as PageHeaderData
        headerDataValue.value = {
          left: $lang?.locale.value === "ar" ? pageData.left?.nameArabic : pageData.left?.nameSimple,
          right: {
            pageNumber: localizeNumber(pageData.right.pageNumber, $lang?.locale.value),
            juzNumber: localizeNumber(pageData.right.juzNumber, $lang?.locale.value),
            hizbNumber: localizeNumber(pageData.right.hizbNumber, $lang?.locale.value),
          }
        }
        break;

      default:
        break;
    }
  }
});
</script>
<template>
  <v-app-bar :elevation="2" density="comfortable" :extension-height="40">
    <template #prepend>
      <v-avatar image="/logo.png"></v-avatar>
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