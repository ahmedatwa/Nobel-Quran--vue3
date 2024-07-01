<script setup lang="ts">
import { ref, inject, computed } from "vue";
// components
import { SettingDrawerComponent } from "@/components/common";
import { useTheme } from "vuetify";
// utils
import { setStorage } from "@/utils/storage";
// types
import type { HeaderData } from "@/types";
import { langKey } from "@/types/symbols";
// stores
import { useChapterStore } from "@/stores";

const _theme = useTheme();
const { getChapterName } = useChapterStore()
const $lang = inject(langKey);
const navigationDrawer = inject("modelNav");
const settingsDrawer = ref(false);
const languages = ref([
  { key: "en", value: "English", rtl: false },
  { key: "ar", value: "Arabic", rtl: true },
]);

const props = defineProps<{
  chapterHeaderData: HeaderData | null;
  pageHeaderData: HeaderData | null;
  juzHeaderData: HeaderData | null;
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
  if (props.chapterHeaderData) {
    const chapterId = props.chapterHeaderData.left
    if (chapterId) {
      const chapterName = getChapterName(chapterId)
      return {
        left: $lang?.locale.value === "ar" ? chapterName?.ar : chapterName?.en,
        right: props.chapterHeaderData.right
      }
    }
  } else if (props.juzHeaderData) {

  } else if (props.pageHeaderData) {

  } else {
    return ""
  }
});
</script>
<template>
  <v-app-bar :elevation="2" density="comfortable" :extension-height="40">
    <template #prepend>
      <v-avatar image="../../../quran8.png"></v-avatar>
      <v-app-bar-title class="ms-2 mouse-pointer quran-header-title" @click="$emit('updateHome', true)"
        :text="$tr.line('common.headingTitle')">
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
      <v-btn @click="navigationDrawer = !navigationDrawer"
        :append-icon="navigationDrawer ? 'mdi-menu-down' : 'mdi-menu-up'">
        {{ headerData.left }}
      </v-btn>
      <v-sheet class="ms-auto me-4 text-body-2">
        {{
          $tr.line("common.headerSurahData", [
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
  font-family: "Kanit", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  src: url("https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Playwrite+NZ:wght@100..400&display=swap");
}
</style>
