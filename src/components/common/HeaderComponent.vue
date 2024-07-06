<script setup lang="ts">
import { ref, inject, computed } from "vue";
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
// stores
import { useChapterStore } from "@/stores";

const _theme = useTheme();
const { getChapterName } = useChapterStore()
const $lang = inject(langKey);
const navigationModelValue = inject("navigationModelValue");
const settingsDrawer = ref(false);
const languages = ref([
  { key: "en", value: "English", rtl: false },
  { key: "ar", value: "Arabic", rtl: true },
]);

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

const headerData = computed(() => {
  if (props.headerData?.key === "chapter") {
    const data = props.headerData.value as ChapterHeaderData
    return {
      left: $lang?.locale.value === "ar" ? data.left[1] : data.left[0],
      right: data.right
    }
  } else if (props.headerData?.key === "juz") {
    const data = props.headerData.value as JuzHeaderData
    const chapterId = Number(data.left)
    if (chapterId) {
      const chapterName = getChapterName(chapterId)
      return {
        left: $lang?.locale.value === "ar" ? chapterName?.ar : chapterName?.en,
        right: data.right
      }
    }
  } else if (props.headerData) {

  } else {
    return ""
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
    <template #extension v-if="headerData">
      <v-btn @click="navigationModelValue = !navigationModelValue"
        :append-icon="navigationModelValue ? 'mdi-menu-down' : 'mdi-menu-up'">
        {{ headerData.left }}
      </v-btn>
      <v-sheet class="ms-auto me-4 text-body-2">
        {{ $tr.line("common.headerSurahData", [
          headerData.right?.hizbNumber,
          headerData.right?.juzNumber,
          headerData.right?.pageNumber,
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