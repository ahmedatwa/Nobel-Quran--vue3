<script setup lang="ts">
import { ref } from "vue"
// stores
import { useAudioPlayerStore } from "@/stores";
// types
import type { Chapter } from "@/types/chapter"
import type { Juz } from "@/types/juz"
import type { Page } from "@/types/page"
// utils
import { randomNumber } from "@/utils/number"
import { AudioPlayerComponent } from "@/components/audio";
import { HomeChaptersComponent, HomeJuzsComponent } from "@/components/home";
import { HomePagesComponent, HomeRelevationComponent } from "@/components/home";

// Stores
const { getAudio } = useAudioPlayerStore()

defineProps<{
    modelValue: string
}>()

const emit = defineEmits<{
    "update:modelValue": [value: string]
    "update:playRandomAudio": [value: number]
    "updateSelected": [value: Chapter | Juz | Page]
}>()


// Audio Player
const isAudioPlayer = ref(false)
const audioPlayerData = ref<{ audioID: number } | null>(null)
const isAudioButtonLoading = ref(false)
const playRandomAudio = async () => {
    isAudioButtonLoading.value = true
    const audioID = randomNumber(1, 114)
    await getAudio({ audioID })
    audioPlayerData.value = {
        audioID
    }
    isAudioPlayer.value = true
    isAudioButtonLoading.value = false

}
</script>
<template>
    <v-container>
        <v-row>
            <v-col cols="12" class="my-4">
                <v-card class="pa-4 text-center mx-auto" elevation="12" max-width="600" rounded="lg" width="100%">
                    <v-icon class="mb-5" color="primary" icon="mdi-book-open-page-variant-outline" size="112"></v-icon>
                    <h2 class='text-h5 mb-6'>{{ $tr.line("home.intoTitle") }}</h2>
                    <div>{{ $tr.line("home.introSubtitle") }}</div>
                    <v-card-actions class="mt-4">
                        <v-btn variant="tonal" prepend-icon="mdi-play-circle-outline" @click="playRandomAudio" block
                            :loading="isAudioButtonLoading">{{ $tr.line('home.buttonPlayAudio') }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col cols="12">
                <v-card :rounded="true">
                    <v-tabs :model-value="modelValue" align-tabs="center" color="primary"
                        @update:model-value="$emit('update:modelValue', $event as string)" grow>
                        <v-tab value="chapters" prepend-icon="mdi-book-alphabet">{{
                            $tr.line('home.textChapters')
                        }}</v-tab>
                        <v-tab value="juzs" prepend-icon="mdi-bookshelf">{{ $tr.line('home.textJuzs') }}</v-tab>
                        <v-tab value="pages" prepend-icon="mdi-page-layout-sidebar-left">{{ $tr.line('home.textPages')
                            }}</v-tab>
                        <v-tab value="relevation" prepend-icon="mdi-order-numeric-descending">
                            {{ $tr.line('home.textRelevation') }}</v-tab>
                    </v-tabs>
                    <v-tabs-window :model-value="modelValue">
                        <v-tabs-window-item value="chapters">
                            <home-chapters-component
                                @update:selected-chapter="$emit('updateSelected', $event)"></home-chapters-component>
                        </v-tabs-window-item>
                        <!-- Juz -->
                        <v-tabs-window-item value="juzs">
                            <home-juzs-component
                                @update:selected-juz="$emit('updateSelected', $event)"></home-juzs-component>
                        </v-tabs-window-item>
                        <!-- Page -->
                        <v-tabs-window-item value="pages">
                            <home-pages-component
                                @update:selected-page="$emit('updateSelected', $event)"></home-pages-component>
                        </v-tabs-window-item>
                        <!-- relevation order -->
                        <v-tabs-window-item value="relevation">
                            <home-relevation-component @update:selected-chapter="$emit('updateSelected', $event)">
                            </home-relevation-component>
                        </v-tabs-window-item>
                    </v-tabs-window>
                </v-card>
            </v-col>
        </v-row>
        <audio-player-component :model-value="isAudioPlayer" :audio-player="audioPlayerData"
            @update:model-value="isAudioPlayer = $event"></audio-player-component>

    </v-container>
</template>
<style scoped>
:deep(.v-skeleton-loader__image) {
    height: 86px !important;
}
</style>