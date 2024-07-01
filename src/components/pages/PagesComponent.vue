<script setup lang="ts">
import { ref, watchEffect } from 'vue';
// stores
import { useAudioPlayerStore, useChapterStore, useTranslationsStore } from "@/stores";
// components
import { PagesTranslationsViewComponent, PagesReadingViewComponent } from '@/components/pages';
// types
import type { HeaderData } from '@/types';

// Stores
const chapterStore = useChapterStore()
const translationsStore = useTranslationsStore()
const audioPlayerStore = useAudioPlayerStore()
const tab = ref("translationTab")

const props = defineProps<{
    audioPlayer: { audioID: number, isPlaying?: boolean, format?: string } | null;
    selected: boolean
    selectedVerseKeyView?: string
    settingCssVars?: { size: string, family: string }
}>()

const emit = defineEmits<{
    "update:headerData": [value: HeaderData]
    "update:playAudio": [value: { audioID: number, verseKey?: string }]
    "update:intersectingVerseNumber": [value: number]
}>()

watchEffect(() => {
    if (props.selectedVerseKeyView) {
        const el = document.getElementById(`verse-word${props.selectedVerseKeyView}`)
        el?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
})

watchEffect(async () => {
    if(props.selected) {
        if(!chapterStore.selectedSurah) {
            chapterStore.selectedSurah = chapterStore.surahList[0]
            await chapterStore.getVerses(1, true)
        }
    }
})

</script>
<template>
    <v-card v-show="selected" class="ma-3" :elevation="1"
        :id="`quran-reader-content-surah${chapterStore.selectedSurah?.id}`" :key="chapterStore.selectedSurah?.id">
        <v-tabs v-model="tab" align-tabs="center" color="primary" grow>
            <v-tab value="translationTab" prepend-icon="mdi-book-open">
                {{ $tr.line("quranReader.textTranslation") }}</v-tab>
            <v-tab value="readingTab" prepend-icon="mdi-translate-variant">
                {{ $tr.line("quranReader.textReading") }}</v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="translationTab" class="mx-5">
                <pages-translations-view-component :is-audio-playing="audioPlayer"
                    :audio-experience="audioPlayerStore.audioExperience" :css-vars="settingCssVars"
                    :grouped-translations-authors="translationsStore.groupedTranslationsAuthors"
                    :verse-timing="audioPlayerStore.verseTiming" @update:header-data="emit('update:headerData', $event)"
                    @update:intersecting-verse-number="emit('update:intersectingVerseNumber', $event)"
                    @update:play-audio="emit('update:playAudio', $event)">
                </pages-translations-view-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="readingTab">
                <pages-reading-view-component :is-audio-playing="audioPlayer" :css-vars="settingCssVars"
                    :verse-timing="audioPlayerStore.verseTiming" @update:header-data="emit('update:headerData', $event)"
                    @update:intersecting-verse-number="emit('update:intersectingVerseNumber', $event)"
                    @update:play-audio="emit('update:playAudio', $event)">
                </pages-reading-view-component>
            </v-tabs-window-item>
        </v-tabs-window>
        <v-card-actions>
            <v-row v-if="chapterStore.isLoading.verses">
                <v-col cols="12">
                    <v-progress-linear indeterminate color="primary"></v-progress-linear>
                </v-col>
            </v-row>
        </v-card-actions>
    </v-card>
</template>