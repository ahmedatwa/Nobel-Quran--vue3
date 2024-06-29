<script setup lang="ts">
import { ref, onBeforeMount, provide, watch } from 'vue';
import { QuranHomeComponent, QuranComponent } from "./components"
import { HeaderComponent, FooterComponent } from "@/components"
import { useSurahStore, useJuzStore, usePageStore } from "@/stores";
import { Chapter, HeaderData, Juz, Page } from '@/types';
import { getStorage, clearStorage } from "@/utils/storage";
import { useTheme } from 'vuetify'

// Stores
const surahStore = useSurahStore()
const juzStore = useJuzStore()
const pageStore = usePageStore()
const _theme = useTheme()
const selectedLanguage = ref("")
const settingsDrawer = ref(false)
const headerData = ref<HeaderData | null>(null)
const selected = ref<Chapter | Juz | Page | null>(null)
const tab = ref("surah")
const isLoading = ref(false)

const modelNav = ref(true)
provide("modelNav", modelNav)

onBeforeMount(() => {
  const chapter = getStorage("chapter")
  const juz = getStorage("juz")
  const page = getStorage("page")
    if (chapter) {
      selected.value = chapter.data as Chapter
      surahStore.selectedSurah = chapter.data as Chapter
    } 
    if(page) {
      selected.value = page.data as Page
      pageStore.selectedPage = page.data as Page
    }
    if(juz) {
      selected.value = juz.data as Juz
      juzStore.selectedJuz = juz.data as Juz
    }
   

  // selected Tab 
  const selectedtab = getStorage("tab")
  if (selectedtab) {
    tab.value = selectedtab
  }

  // theme
  if (getStorage('theme')) {
    _theme.global.name.value = getStorage('theme') || 'dark'
  }

})


watch(isLoading, (loading) => {
  if (loading) {
    setTimeout(() => {
      isLoading.value = false
    }, 500);
  }
})

const destroy = ()=> {
  clearStorage(true, sessionStorage)
}
</script>

<template>
  <v-app>
    <v-overlay :model-value="isLoading" class="align-center justify-center">
      <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
    </v-overlay>
    <v-locale-provider :rtl="$tr.rtl.value">
      <header-component :header-data="headerData" @update:settings-drawer="settingsDrawer = $event"
        @update:selected-language="selectedLanguage = $event" @update-home="destroy">
      </header-component>
      <v-main style="overflow-x: hidden;">
        <quran-component :selected="tab" v-if="selected" @update:header-data="headerData = $event"></quran-component>
        <quran-home-component v-model:model-value="tab" @update-selected="selected = $event"
          @update:is-loading="isLoading = $event" v-else></quran-home-component>
          <footer-component></footer-component>
      </v-main>
     
    </v-locale-provider>
  </v-app>
</template>
<style></style>
