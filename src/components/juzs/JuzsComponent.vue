<script setup lang="ts">
import { ref } from 'vue';
// components
import { JuzReadingViewComponent, JuzTranslationsViewComponent } from '@/components/juzs';
// stores
import { useJuzStore, useTranslationsStore, useAudioPlayerStore, useSettingStore } from "@/stores";
// types
import type { JuzHeaderData, JuzVersesIntersecting } from '@/types/juz';

const translationsStore = useTranslationsStore()
const juzStore = useJuzStore()
const { audioPlayerSetting } = useSettingStore()
const audioPlayerStore = useAudioPlayerStore()
const selectedJuzTab = ref("translationsTab")

const props = defineProps<{
    audioPlayer: { audioID: number, isPlaying?: boolean, format?: string } | null;
    selected: boolean
    cssVars?: Record<"fontSize" | "fontFamily", string>
}>()

const emit = defineEmits<{
    "update:headerData": [value: JuzHeaderData | null]
    "update:playAudio": [value: { audioID: number, verseKey?: string }]
    "update:manualIntersecting": [value: JuzVersesIntersecting]
    "update:activeJuzNumber": [value: number]
}>()

</script>
<template>
    <v-card v-show="selected" class="ma-2" :elevation="1"
        :id="`quran-reader-content-juz${juzStore.selectedJuz?.juz_number}`" :key="juzStore.selectedJuz?.id">
        <v-tabs v-model="selectedJuzTab" align-tabs="center" color="primary" grow>
            <v-tab value="translationsTab" prepend-icon="mdi-book-open">{{ $tr.line("quranReader.textTranslation")
                }}</v-tab>
            <v-tab value="readingTab" prepend-icon="mdi-translate-variant">{{ $tr.line("quranReader.textReading")
                }}</v-tab>
        </v-tabs>
        <v-tabs-window v-model="selectedJuzTab">
            <v-tabs-window-item value="translationsTab" class="mx-5">
                <juz-translations-view-component :is-audio-playing="audioPlayer" :selected-juz-tab="selectedJuzTab"
                    :audio-experience="audioPlayerSetting" :css-vars="cssVars"
                    :grouped-translations-authors="translationsStore.groupedTranslationsAuthors"
                    :verse-timing="audioPlayerStore.verseTiming" @update:header-data="emit('update:headerData', $event)"
                    @update:manual-intersecting="emit('update:manualIntersecting', $event)"
                    @update:play-audio="emit('update:playAudio', $event)"
                    @update:active-juz-number="$emit('update:activeJuzNumber', $event)">
                </juz-translations-view-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="readingTab">
                <juz-reading-view-component :audio-player="audioPlayer" :css-vars="cssVars"
                    :selected-juz-tab="selectedJuzTab" :verse-timing="audioPlayerStore.verseTiming"
                    @update:header-data="emit('update:headerData', $event)"
                    @update:manual-intersecting="emit('update:manualIntersecting', $event)"
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
    font-family: v-bind("props.cssVars?.fontFamily");
    font-size: v-bind("props.cssVars?.fontSize");
}
</style>