<script setup lang="ts">
import { ref } from 'vue';
// components
import { JuzReadingViewComponent, JuzTranslationsViewComponent } from '@/components/juzs';
// stores
import { useJuzStore, useTranslationsStore, useAudioPlayerStore } from "@/stores";
// types
import type { HeaderData } from '@/types';

const translationsStore = useTranslationsStore()
const juzStore = useJuzStore()
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
    "update:intersectingJuzVerseNumber": [value: number]
    "update:activejuz_number": [value: number]
}>()

</script>
<template>
    <v-card v-show="selected" class="ma-2" :elevation="1"
        :id="`quran-reader-content-juz${juzStore.selectedJuz?.juz_number}`"
        :key="juzStore.selectedJuz?.id">
        <v-tabs v-model="tab" align-tabs="center" color="primary" grow>
            <v-tab value="translationTab" prepend-icon="mdi-book-open">{{ $tr.line("quranReader.textTranslation")
                }}</v-tab>
            <v-tab value="readingTab" prepend-icon="mdi-translate-variant">{{ $tr.line("quranReader.textReading")
                }}</v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="translationTab" class="mx-5">
                <juz-translations-view-component :is-audio-playing="audioPlayer"
                    :audio-experience="audioPlayerStore.audioExperience" :css-vars="settingCssVars"
                    :grouped-translations-authors="translationsStore.groupedTranslationsAuthors"
                    :verse-timing="audioPlayerStore.verseTiming" @update:header-data="emit('update:headerData', $event)"
                    @update:intersecting-juz-verse-number="emit('update:intersectingJuzVerseNumber', $event)"
                    @update:play-audio="emit('update:playAudio', $event)"
                    @update:active-juz-number="$emit('update:activejuz_number', $event)">
                </juz-translations-view-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="readingTab">
                <juz-reading-view-component :audio-player="audioPlayer" :css-vars="settingCssVars"
                    :verse-timing="audioPlayerStore.verseTiming" @update:header-data="emit('update:headerData', $event)"
                    @update:intersecting-juz-verse-number="emit('update:intersectingJuzVerseNumber', $event)"
                    @update:play-audio="emit('update:playAudio', $event)">
                </juz-reading-view-component>
            </v-tabs-window-item>
        </v-tabs-window>
        <v-card-actions>
            <v-row v-if="juzStore.isLoading">
                <v-col cols="12">
                    <v-progress-linear indeterminate color="primary"></v-progress-linear>
                </v-col>
            </v-row>
        </v-card-actions>
    </v-card>
</template>
<style scoped>
:deep(.v-card-item__append) {
    align-items: start !important;
}

:deep(:nth-last-child(1 of .reading-container)) {
    border-top: 0.02em inset rgba(0, 0, 0, 0.5) !important;
}

.quran-content {
    font-family: v-bind("props.settingCssVars?.family");
    font-size: v-bind("props.settingCssVars?.size");
}
</style>