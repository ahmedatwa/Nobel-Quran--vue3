<script setup lang="ts">
import { ref, watchEffect, inject, computed, provide, onBeforeMount } from "vue";
import { TranslationListComponent, AudioPlayerComponent, PagesComponent } from "@/components";
import { NavigationComponent, JuzsComponent, ChaptersComponent } from "@/components";
import { useTranslationsStore, useSettingStore, useAudioPlayerStore } from "@/stores";
import type { HeaderData } from '@/types';
import { getStorage } from "@/utils/storage";

// Stores
const translationsStore = useTranslationsStore()
const settingStore = useSettingStore()
const audioPlayerStore = useAudioPlayerStore()

const translationDrawer = ref(false)
provide("translationDrawer", translationDrawer)
const navigationDrawer = inject<boolean>("modelNav")

// Refs
const selectedTab = ref("")
const selectedPage = ref(1)
const intersectingVerseNumber = ref<number>()
const audioPlayerModelValue = ref(false)
const selectedVerseKeyView = ref("")
const audioPlayer = ref<{ audioID: number, verseKey?: string, isPlaying?: boolean, format?: string } | null>(null)

const props = defineProps<{
  selected: string
}>()

defineEmits<{
  "update:headerData": [value: HeaderData]
}>()

const playAudio = (event: { audioID: number, verseKey?: string }) => {
  audioPlayerStore.getAudio({ ...event })
  audioPlayer.value = { ...event }
  audioPlayerModelValue.value = true
}

watchEffect(() => {
  if (props.selected) {
    selectedTab.value = props.selected
  }
})

// Front Styles
const settingCssVars = computed(() => {
  if (settingStore.cssVars) {
    return {
      size: settingStore.cssVars?.quranFrontSize ? "var(--quran-font-size-" + settingStore.cssVars.quranFrontSize + ")" : "var(--quran-font-size-3)",
      family: settingStore.cssVars?.quranFontFamily ? "var(--quran-reader-font-family-" + settingStore.cssVars.quranFontFamily + ")" : "var(--quran-reader-font-family-indoPak)"
    }
  }
})

// update Selected Translations
const updateTranslations = ($event: number[]) => {
  translationsStore.selectedTranslationIds = $event
}

onBeforeMount(() => {
  const tab = getStorage("tab")
  if (tab) selectedTab.value = tab
})

</script>
<template>
  <navigation-component v-model:model-nav="navigationDrawer" :selected="selected"
    @update:selected-tab="selectedTab = $event" :intersecting-verse-number=intersectingVerseNumber
    @update:selected-page="selectedPage = $event"
    @update:selected-verse-key-view="selectedVerseKeyView = $event"></navigation-component>

  <juzs-component :selected="selectedTab === 'juz'" :selected-tab="selectedTab" :audio-player="audioPlayer"
    :setting-css-vars="settingCssVars" @update:translation-drawer="translationDrawer = $event"
    @update:intersecting-verse-number="intersectingVerseNumber = $event" :selected-verse-key-View="selectedVerseKeyView"
    @update:play-audio="playAudio" @update:header-data="$emit('update:headerData', $event)"></juzs-component>

  <chapters-component :selected="selectedTab === 'surah'" :audio-player="audioPlayer" :selected-tab="selectedTab"
    :selected-verse-key-View="selectedVerseKeyView" :setting-css-vars="settingCssVars"
    @update:intersecting-verse-number="intersectingVerseNumber = $event"
    @update:header-data="$emit('update:headerData', $event)" @update:play-audio="playAudio">
  </chapters-component>

  <pages-component :selected="selectedTab === 'page'" :selected-page="selectedPage" :audio-player="audioPlayer"
    :setting-css-vars="settingCssVars" @update:verse-id="intersectingVerseNumber = $event"
    @update:translation-drawer="translationDrawer = $event" @update:header-data="$emit('update:headerData', $event)"
    @update:play-audio="playAudio"></pages-component>

  <translation-list-component @update:selected-translations="updateTranslations"></translation-list-component>

  <audio-player-component :audio-player="audioPlayer" :auto-play="settingStore.autoPlay"
    @update:is-audio="audioPlayer = $event" @update:model-value="audioPlayerModelValue = $event"
    :model-value="audioPlayerModelValue"></audio-player-component>
</template>
