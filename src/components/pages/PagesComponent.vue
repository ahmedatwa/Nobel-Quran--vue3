<script setup lang="ts">
import { ref, watchEffect } from 'vue';
// stores
import { useAudioPlayerStore, usePageStore, useTranslationsStore, useSettingStore } from "@/stores";
// components
import { PagesTranslationsViewComponent, PagesReadingViewComponent } from '@/components/pages';
// types
import type { PageHeaderData } from '@/types/page';

// Stores
const pageStore = usePageStore()
const translationsStore = useTranslationsStore()
const audioPlayerStore = useAudioPlayerStore()
const { audioPlayerSetting } = useSettingStore()

const tab = ref("translationTab")

const props = defineProps<{
    audioPlayer: { audioID: number, isPlaying?: boolean, format?: string } | null;
    selected: boolean
    selectedVerseKeyView?: string
    cssVars?: Record<"fontSize" | "fontFamily", string>
}>()

const emit = defineEmits<{
    "update:headerData": [value: PageHeaderData]
    "update:activePageNumber": [value: number]
    "update:playAudio": [value: { audioID: number, verseKey?: string }]
    "update:intersectingPageVerseNumber": [value: number]
}>()

watchEffect(() => {
    if (props.selectedVerseKeyView) {
        const el = document.getElementById(`verse-word${props.selectedVerseKeyView}`)
        el?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
})



</script>
<template>
    <v-card v-show="selected" class="ma-3" :elevation="1"
        :id="`quran-reader-content-surah${pageStore.selectedPage?.pageNumber}`"
        :key="pageStore.selectedPage?.pageNumber">
        <v-tabs v-model="tab" align-tabs="center" color="primary" grow>
            <v-tab value="translationTab" prepend-icon="mdi-book-open">
                {{ $tr.line("quranReader.textTranslation") }}</v-tab>
            <v-tab value="readingTab" prepend-icon="mdi-translate-variant">
                {{ $tr.line("quranReader.textReading") }}</v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="translationTab" class="mx-5">
                <pages-translations-view-component :is-audio-playing="audioPlayer"
                    :audio-experience="audioPlayerSetting" :css-vars="cssVars"
                    :grouped-translations-authors="translationsStore.groupedTranslationsAuthors"
                    :verse-timing="audioPlayerStore.verseTiming" @update:header-data="emit('update:headerData', $event)"
                    @update:intersecting-page-verse-number="emit('update:intersectingPageVerseNumber', $event)"
                    @update:play-audio="emit('update:playAudio', $event)"
                    @update:active-page-number="$emit('update:activePageNumber', $event)">
                </pages-translations-view-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="readingTab">
                <pages-reading-view-component :is-audio-playing="audioPlayer" :css-vars="cssVars"
                    :audio-experience="audioPlayerSetting" :verse-timing="audioPlayerStore.verseTiming"
                    @update:header-data="emit('update:headerData', $event)"
                    @update:intersecting-page-verse-number="emit('update:intersectingPageVerseNumber', $event)"
                    @update:play-audio="emit('update:playAudio', $event)">
                </pages-reading-view-component>
            </v-tabs-window-item>
        </v-tabs-window>
        <v-card-actions>
            <v-row v-if="pageStore.isLoading">
                <v-col cols="12">
                    <v-progress-linear indeterminate color="primary"></v-progress-linear>
                </v-col>
            </v-row>
        </v-card-actions>
    </v-card>
</template>