<script setup lang="ts">
import { ref, onBeforeMount, provide, watch } from "vue";
// components
import { HeaderComponent, FooterComponent, NavigationComponent } from "@/components/common";
// types
import type { Chapter } from "@/types/chapter";
import type { Juz } from "@/types/juz";
import type { Page } from "@/types/page"
import type { ChapterHeaderData } from "@/types/chapter";
import type { JuzHeaderData } from "@/types/juz";
import type { PageHeaderData } from "@/types/page";
// utils
import { getStorage, setStorage } from "@/utils/storage";
import { useTheme } from "vuetify";
// Store 
import { useMetaStore, useSettingStore } from "@/stores"

// Stores
const _theme = useTheme();
const metadataStore = useMetaStore()
const settingStore = useSettingStore()
const selectedLanguage = ref("en");
const settingsDrawer = ref(false);
const headerData = ref<{ key: string, value: ChapterHeaderData | JuzHeaderData | PageHeaderData } | null>(null);
const selected = ref(false);
const tab = ref("chapters");
//const isLoading = ref(false);

const navigationModelValue = ref(true);
provide("navigationModelValue", navigationModelValue);

onBeforeMount(() => {
  // selected Tab
  const selectedtab = getStorage("tab");
  if (selectedtab) {
    tab.value = selectedtab;
  } else {
    setStorage("tab", tab.value)
  }

  const language = getStorage("language");
  if (language) {
    selectedLanguage.value = language;
  } else {
    setStorage("language", selectedLanguage.value)
  }

  // theme
  if (getStorage("theme")) {
    _theme.global.name.value = getStorage("theme") || "dark";
  }
});


watch(tab, (newVal) => {
  if (newVal) setStorage("tab", tab.value)
})

watch(selectedLanguage, (newLang) => {
  if (newLang) setStorage("language", newLang)
})

</script>

<template>
  <teleport to="head title">{{ metadataStore.pageTitle }}</teleport>
  <teleport to="head">
    <meta v-for="(metaItem, i) in metadataStore.metaData" :key="i" :name="metaItem.name" :property="metaItem.property"
      :content="metaItem.content">
  </teleport>
  <v-app>

    <v-overlay :model-value="settingStore.isAppLoading" class="align-center justify-center">
      <v-progress-circular color="primary" size="64" indeterminate>
        <template v-slot:default> {{ settingStore.appIntervalValue }} % </template>
      </v-progress-circular>
    </v-overlay>
    <v-locale-provider :rtl="$tr.rtl.value">
      <header-component :header-data="headerData" @update:settings-drawer="settingsDrawer = $event"
        @update:selected-language="selectedLanguage = $event">
      </header-component>
      <v-main>
        <router-view @update:selected="selected = $event"></router-view>
        <footer-component></footer-component>
      </v-main>
    </v-locale-provider>
  </v-app>
</template>
<style></style>
