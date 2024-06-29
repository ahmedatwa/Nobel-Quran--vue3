<script setup lang="ts">
import { ref, computed } from "vue"
import { useAudioPlayerStore } from "@/stores";
import { AudioPlayerMenuComponent } from "@/components"

const audioPlayerStore = useAudioPlayerStore()

const mediaVolume = ref(1)
const dialog = ref(false)

const emit = defineEmits<{
    "update:isAudio": [value: { audioID: number, verseKey?: string, format?: string, isPlaying?: boolean } | null]
    "update:closePlayer": [value: boolean]
    "update:playAudio": [value: boolean]
    "update:muteAudio": [value: boolean]
    "update:loopAudio": [value: string]
    "update:changeMediaVolume": [value: number]
    "update:playbackRate": [value: string]
}>()

defineProps<{
    isMuted: boolean
    loopAudio: string
    isPlaying: boolean
    playbackRate: string | number
}>()

const isNextAyahDisabled = computed(() => {
    // since chapters length will never change 114
    if (audioPlayerStore.chapterId)
        return audioPlayerStore.chapterId >= 114 ? true : false
})

const isPreviousAyahDisabled = computed(() => {
    // since chapters length will never change 114
    if (audioPlayerStore.chapterId)
        return audioPlayerStore.chapterId <= 1 ? true : false
})



</script>
<template>
    <v-sheet class="d-flex justify-center">
        <v-sheet>
            <v-btn icon="mdi-dots-horizontal" variant="text" density="compact" class="me-4"
                @click="dialog = !dialog"></v-btn>
            <audio-player-menu-component v-model:model-value="dialog" @update:model-value="dialog = $event"
                :recitions="audioPlayerStore.recitations" :playback-rate="playbackRate"
                :playback-speeds="audioPlayerStore.playbackSpeeds"
                :selected-reciter="audioPlayerStore.selectedReciter.id"
                :audio-url="audioPlayerStore.audioFiles?.audio_url" :audio-experience="audioPlayerStore.audioExperience"
                :audio-format="audioPlayerStore.audioFiles?.format" :chapter-name="audioPlayerStore.chapterName"
                @update:get-recitions="audioPlayerStore.getRecition"
                @update:playback-rate="$emit('update:playbackRate', $event)">
            </audio-player-menu-component>
        </v-sheet>
        <v-sheet class="">
            <v-btn density="compact" variant="text" v-if="loopAudio === 'none'"
                @click="$emit('update:loopAudio', 'repeat')" icon="mdi-repeat-off"></v-btn>
            <v-btn density="compact" variant="text" v-else-if="loopAudio === 'repeat'"
                @click="$emit('update:loopAudio', 'once')" icon="mdi-repeat"
                :color="loopAudio === 'repeat' ? 'primary' : ''"></v-btn>
            <v-btn density="compact" variant="text" v-else-if="loopAudio === 'once'"
                @click="$emit('update:loopAudio', 'none')" icon="mdi-repeat-once"
                :color="loopAudio === 'once' ? 'primary' : ''"></v-btn>

            <v-btn icon="mdi-rewind" density="compact" class="me-2" variant="text"
                v-tooltip:top="$tr.line('audio.prevAyah')" :disabled="isPreviousAyahDisabled"
                @click="audioPlayerStore.playPrevious"></v-btn>
            <!-- Play -->
            <v-btn :loading="audioPlayerStore.isLoading" :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
                @click.prevent="$emit('update:playAudio', true)" density="compact" class="me-2" variant="text"></v-btn>
            <!-- Next Ayah -->
            <v-btn icon="mdi-fast-forward" density="compact" class="me-2" variant="text"
                v-tooltip:top="$tr.line('audio.nextAyah')" :disabled="isNextAyahDisabled"
                @click="audioPlayerStore.playNext"></v-btn>
            <!-- Close -->
            <v-btn icon="mdi-close" @click="$emit('update:closePlayer', true)" density="compact" variant="text"
                v-tooltip:top="$tr.line('audio.close')"></v-btn>
        </v-sheet>
        <v-sheet :width="150" class="ms-2 ">
            <v-slider v-model="mediaVolume" max-width="150" :step="0.1" :max="1" :min="0"
                @update:modelValue="$emit('update:changeMediaVolume', $event)" hide-details>
                <template #prepend>
                    <v-icon :icon="isMuted ? 'mdi-volume-off' : 'mdi-volume-high'"
                        @click="$emit('update:muteAudio', true)"></v-icon>
                </template></v-slider>
        </v-sheet>
    </v-sheet>
</template>