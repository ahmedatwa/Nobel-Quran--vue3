<script setup lang="ts">
import { ref, computed } from "vue"
// stores
import { useAudioPlayerStore } from "@/stores";
// components
import { AudioPlayerMenuComponent } from "@/components/audio"
// utils
import { TOTAL_CHAPTERS } from "@/utils/chapter";

const audioPlayerStore = useAudioPlayerStore()
const dialog = ref(false)
const play = ref(false)
const volumeIcon = ref("mdi-volume-high")

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
    mediaVolume: number;
    loopAudio: string
    isPlaying: boolean
    playbackRate: string | number
}>()

const isNextAyahDisabled = computed(() => {
    // since chapters length will never change 114
    if (audioPlayerStore.chapterId)
        return audioPlayerStore.chapterId >= TOTAL_CHAPTERS ? true : false
})

const isPreviousAyahDisabled = computed(() => {
    // since chapters length will never change 114
    if (audioPlayerStore.chapterId)
        return audioPlayerStore.chapterId <= 1 ? true : false
})

const playAudio = () => {
    play.value = !play.value
    emit('update:playAudio', play.value)
}

const changeMediaVolume = (newVol: number) => {
    if (newVol === 0) {
        volumeIcon.value = "mdi-volume-off"
    } else if (newVol <= 0.6 && newVol > 0) {
        volumeIcon.value = "mdi-volume-medium"
    } else if (newVol > 0.6) {
        volumeIcon.value = "mdi-volume-high"
    }
    emit('update:changeMediaVolume', newVol)

}

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
                :audio-url="audioPlayerStore.audioFiles?.audio_url" :audio-format="audioPlayerStore.audioFiles?.format"
                :chapter-name="audioPlayerStore.chapterName" @update:get-recitions="audioPlayerStore.getRecition"
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
            <v-btn :loading="audioPlayerStore.isLoading" :icon="isPlaying ? 'mdi-pause' : 'mdi-play'" @click="playAudio"
                density="compact" class="me-2" variant="text"></v-btn>
            <!-- Next Ayah -->
            <v-btn icon="mdi-fast-forward" density="compact" class="me-2" variant="text"
                v-tooltip:top="$tr.line('audio.nextAyah')" :disabled="isNextAyahDisabled"
                @click="audioPlayerStore.playNext"></v-btn>
            <!-- Close -->
            <v-btn icon="mdi-close" @click="$emit('update:closePlayer', true)" density="compact" variant="text"
                v-tooltip:top="$tr.line('audio.close')" class="me-2"></v-btn>
        </v-sheet>


        <!-- Volume -->
        <v-menu v-if="!$vuetify.display.smAndDown">
            <template v-slot:activator="{ props }">
                <v-btn :icon="volumeIcon" v-bind="props" density="compact" variant="text">
                </v-btn>
            </template>
            <v-card min-width="250">
                <v-list>
                    <v-list-item>
                        <v-slider :model-value="mediaVolume" :step="0.1" :max="1" :min="0" class="mx-4"
                            @update:model-value="changeMediaVolume($event)" hide-details>
                        </v-slider>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-menu>
    </v-sheet>
</template>