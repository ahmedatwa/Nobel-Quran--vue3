<script setup lang="ts">
import { computed, ref } from 'vue';
// components
import { ChapterInfoComponent } from '@/components/quran';
// types
import type { ChapterInfo } from '@/types';
import { PlayAudioEmit } from "@/types/audio"

const infoDialog = ref(false)
const activeAudioData = ref<PlayAudioEmit | null>(null)

const props = defineProps<{
    groupedTranslationsAuthors?: string,
    isAudioPlayer: { audioID: number, isPlaying?: boolean, format?: string } | null;
    chapterId: number | string
    audioSrc: string;
    chapterInfo?: ChapterInfo
    isInfoDialog?: boolean
    verseKey?: string
}>()

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit]
    "update:translationsDrawer": [value: boolean]
    "update:chapterInfoDialog": [value: boolean]
}>()

const playAudio = (payload: PlayAudioEmit) => {
    activeAudioData.value = payload
    emit('update:playAudio', payload)
}

const isPlaying = computed(() => {
    if (props.isAudioPlayer?.isPlaying) {
        if (activeAudioData.value?.audioID === props.isAudioPlayer.audioID) {
            return true
        }
    }
    return false
})
</script>

<template>
    <v-container>
        <v-row class="d-flex" justify="space-between">
            <v-col cols="12" class="text-center my-4 quran-reader-container" v-if="$slots.title">
                <slot name="title"> </slot>
                <slot name="subtitle"> </slot>
            </v-col>
            <v-col :class="$tr.rtl.value ? 'ms-auto text-right' : 'text-left me-auto'">
                <v-btn v-if="isInfoDialog" @click.stop="infoDialog = !infoDialog"
                    prepend-icon="mdi-information-outline">
                    {{ $tr.line("quranReader.textSurahInfo") }}
                </v-btn>
                <v-sheet v-if="groupedTranslationsAuthors">
                    {{ $tr.line("quranReader.textTranslatedBy") }}
                    <div class="d-inline">
                        <span class="me-1">
                            {{ groupedTranslationsAuthors }}</span>
                    </div> <v-btn icon="mdi-filter-menu" color="primary"
                        v-tooltip="$tr.line('quranReader.buttonFilter')"
                        @click="$emit('update:translationsDrawer', true)" variant="plain">
                    </v-btn>
                </v-sheet>
            </v-col>
            <v-col>
                <v-slide-x-reverse-transition>
                    <v-sheet :class="$tr.rtl.value ? 'text-left' : 'text-right'">
                        <v-btn variant="outlined" @click="playAudio({ audioID: Number(chapterId), audioSrc, verseKey })"
                            color="primary">
                            <v-icon :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"></v-icon>{{
                                $tr.line("quranReader.buttonPlay") }}
                        </v-btn>
                    </v-sheet>
                </v-slide-x-reverse-transition>
            </v-col>
        </v-row>
        <v-divider :thickness="2" color="primary" class="my-3"></v-divider>
    </v-container>
    <chapter-info-component :info-dialog="infoDialog"
        @update:info-dialog="infoDialog = $event"></chapter-info-component>

</template>