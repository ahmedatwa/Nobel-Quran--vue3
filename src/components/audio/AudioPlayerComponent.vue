<script setup lang="ts">
import { ref, onUnmounted, inject, watchEffect } from "vue";
import { computed, onBeforeMount } from "vue";
// components
import { AudioPlayerControlsComponent } from "@/components/audio"
// stores
import { useAudioPlayerStore, useSettingStore, useMetaStore } from "@/stores";
// symbols
import { langKey } from "@/types/symbols";
// utils
import { getStorage, setStorage } from "@/utils/storage";
import { getLangFullLocale } from "@/utils/locale"
import { makeWordLocation, getVerseNumberFromKey, getChapterIdfromKey } from "@/utils/verse"
import { secondsFormatter, milliSecondsToSeconds, secondsToMilliSeconds } from "@/utils/datetime"
// types
import type { VerseTimings, VerseTimingSegments } from "@/types/audio"

const audioPlayerStore = useAudioPlayerStore()
const metaStore = useMetaStore()
const { audioPlayerSetting } = useSettingStore()
const $tr = inject(langKey)

defineProps<{
    audioPlayer: { audioID: number, verseKey?: string, format?: string, isPlaying?: boolean, pause?: boolean } | null,
    modelValue: boolean
}>()

const emit = defineEmits<{
    "update:isAudio": [value: { audioID: number, verseKey?: string, format?: string, isPlaying?: boolean } | null]
    "update:modelValue": [value: boolean]
}>()

// Audio
const audioPlayerRef = ref<HTMLAudioElement>();
const playbackRate = ref("Normal")
const listenerActive = ref(false);
const progressTimer = ref<number>(0);
const elapsedTime = ref("00:00");
const audioDuration = ref("");
const duration = ref(0)
const audioBuffer = ref(0)
const mediaVolume = ref(1);
const isPlaying = ref(false);
const isMuted = ref(false);
const loopAudio = ref("none")
const currentTimestamp = ref(0)


// get verse timing
const getVerseTiming = computed((): VerseTimings[] | undefined => {
    if (audioPlayerStore.audioFiles) {
        return audioPlayerStore.audioFiles.verse_timings.map((vt) => {
            return {
                inRange: false,
                wordLocation: "",
                wordPosition: 0,
                verseNumber: 0,
                ...vt
            }
        })
    }
})


/**
 * Buffering when 1s away from download progress
 * and put the audio in `almostEnded` state when 1s away from ending
 */
const AUDIO_DURATION_TOLERANCE = 1; // 1s ,

/**
 * check if currentTime is within range timestampFrom and timestampTo
 *
 * example:
 * - timestampFrom = 10, timestampTo = 20, currentTime = 10 should return true
 * - timestampFrom = 10, timestampTo = 20, currentTime = 11 should return true
 * - timestampFrom = 10, timestampTo = 20, currentTime = 20 should return false
 *
 * @param {number} currentTime
 * @param {number} timestampFrom
 * @param {number} timestampTo
 * @returns {boolean} isWithinRange
 */
const isCurrentTimeInRange = (currentTimeValue: number, timestampFrom: number, timestampTo: number) =>
    currentTimeValue >= timestampFrom && currentTimeValue < timestampTo;


const playbackListener = () => {
    if (audioPlayerRef.value) {

        if (audioPlayerStore.audioFiles) {
            listenerActive.value = true;
            currentTimestamp.value = Math.ceil(audioPlayerRef.value.currentTime - AUDIO_DURATION_TOLERANCE)
            duration.value = milliSecondsToSeconds(audioPlayerStore.audioFiles.duration)
            elapsedTime.value = secondsFormatter((duration.value - currentTimestamp.value), getLangFullLocale($tr?.locale.value))
            progressTimer.value = secondsToMilliSeconds(currentTimestamp.value)

        }
    }
}


watchEffect(() => {
    if (getVerseTiming) {
        // set current time to millseconds
        const currentTime = Math.ceil(secondsToMilliSeconds(currentTimestamp.value))
        // Find current verse Key 
        const currentVerseTimingData = getVerseTiming.value?.find((vt) => currentTime >= vt.timestamp_from && currentTime <= vt.timestamp_to)
        if (currentVerseTimingData) {
            const isVerseInRange = isCurrentTimeInRange(currentTime, currentVerseTimingData.timestamp_from, currentVerseTimingData?.timestamp_to)

            if (isVerseInRange) {
                currentVerseTimingData.segments.map((vt: VerseTimingSegments) => {

                    const isSegmentInRange = isCurrentTimeInRange(currentTime, vt[1], vt[2])
                    if (isSegmentInRange) {
                        audioPlayerStore.verseTiming = {
                            chapterId: getChapterIdfromKey(currentVerseTimingData.verse_key),
                            verseKey: currentVerseTimingData.verse_key,
                            inRange: isSegmentInRange,
                            verseNumber: getVerseNumberFromKey(currentVerseTimingData.verse_key),
                            wordLocation: makeWordLocation(currentVerseTimingData.verse_key, vt[0]),
                            wordPosition: vt[0],
                            audioSrc: audioPlayerStore.audioPayLoadSrc
                        }
                    }
                })
            }
        }
    }
})


//run when audio is paused by user
const playbackPlaying = () => {
    isPlaying.value = true;
    listenerActive.value = true;
    if (audioPlayerStore.audioFiles) {
        emit('update:isAudio', {
            audioID: audioPlayerStore.audioFiles.chapter_id,
            verseKey: audioPlayerStore.selectedVerseKey,
            format: audioPlayerStore.audioFiles.format || '',
            isPlaying: isPlaying.value,
        })
    }
}
const playbackPaused = () => {
    isPlaying.value = false;
    listenerActive.value = false;
    if (audioPlayerStore.audioFiles) {
        emit('update:isAudio', {
            audioID: audioPlayerStore.audioFiles.chapter_id,
            verseKey: audioPlayerStore.selectedVerseKey,
            format: audioPlayerStore.audioFiles.format || '',
            isPlaying: isPlaying.value,
        })
    }
}

//run when audio play reaches the end of file
const playbackEnded = async () => {
    switch (loopAudio.value) {
        case "once":
            if (audioPlayerRef.value) {
                audioPlayerRef.value.currentTime = 0
                isPlaying.value = true
                audioPlayerRef.value?.play()
            }
            break;
        case "repeat":
            await audioPlayerStore.playNext()
            break
        case "none":
            isPlaying.value = false;
            listenerActive.value = false;
            if (audioPlayerStore.audioFiles) {
                emit('update:isAudio', {
                    audioID: audioPlayerStore.audioFiles.chapter_id,
                    verseKey: audioPlayerStore.selectedVerseKey,
                    format: audioPlayerStore.audioFiles.format || '',
                    isPlaying: isPlaying.value,
                })
            }
            cleanupListeners();
            break;
    }
    // 
}

//Remove listeners after audio play stops
const cleanupListeners = () => {
    if (audioPlayerRef.value) {
        listenerActive.value = false;
        isPlaying.value = false
        audioPlayerRef.value.removeEventListener("timeupdate", playbackListener);
        audioPlayerRef.value.removeEventListener("ended", playbackEnded);
        audioPlayerRef.value.removeEventListener("pause", playbackPaused);
        // dismiss on playbavc ends
        if (audioPlayerSetting.dismissOnEnd) {
            emit("update:modelValue", false)
        }
    }
}

onBeforeMount(() => {
    const state = getStorage('audio-player')
    if (state) {
        // Muted
        if (state.isMuted) {
            muteAudio()
        }
        // Playback Rate
        if (state.playbackRate) {
            playbackRate.value = state.playbackRate
            setAudioPlayBackRate(state.playbackRate)
        }
        // Media Volume
        if (state.mediaVolume) {
            mediaVolume.value = state.mediaVolume
        }
        // AutoScroll | tooltip
        if (state.experience) {
            //audioPlayerSetting.
            // settingS.audioExperience = state.experience
        }
    }
})

onUnmounted(() => {
    cleanupListeners()
})

const buffer = () => {
    if (audioPlayerRef.value) {
        if (audioPlayerRef.value.buffered && audioPlayerRef.value.buffered.length) {
            const lastIndex = audioPlayerRef.value.buffered.length - 1;
            const timestamp = audioPlayerRef.value.buffered.end(lastIndex);
            audioBuffer.value = timestamp
        }

    }
}
const canPlayThrough = () => {
    if (audioPlayerStore.audioFiles)
        audioDuration.value = secondsFormatter(Math.round(audioPlayerStore.audioFiles.duration));
    if (audioPlayerRef.value) {
        audioPlayerRef.value.volume = mediaVolume.value
    }
    audioPlayerRef.value?.addEventListener("buffer", buffer,)
    audioPlayerRef.value?.addEventListener("seeked", () => {
        if (audioPlayerRef.value) {
            for (let i = 0; i < audioPlayerRef.value?.buffered.length; i++) {
                // const startX = audioPlayerRef.value?.buffered.start(i);
                // const endX = audioPlayerRef.value?.buffered.end(i);
                //   audioBuffer.value = (audioPlayerRef.value?.buffered.end(i) / audioPlayerRef.value?.buffered.start(i)) * 100
                // const width = endX - startX;

            }
        }
    });

    if (audioPlayerStore.audioFiles) {
        emit('update:isAudio', {
            audioID: audioPlayerStore.audioFiles.chapter_id,
            verseKey: audioPlayerStore.selectedVerseKey,
            isPlaying: isPlaying.value,
            format: audioPlayerStore.audioFiles?.format || '',
        })
    }

}

const setAudioPlayBackRate = (rate: string) => {
    playbackRate.value = rate
    if (audioPlayerRef.value)
        audioPlayerRef.value.playbackRate = rate === "Normal" ? 1 : Number(rate);
    setStorage("audio-player", {
        isMuted: isMuted.value,
        playbackRate: playbackRate.value,
        mediaVolume: mediaVolume.value,
    })
}

const playbackSeek = () => {
    if (audioPlayerRef.value) {
        audioPlayerRef.value.currentTime = milliSecondsToSeconds(progressTimer.value);
        progressTimer.value = secondsToMilliSeconds(audioPlayerRef.value.currentTime)
    }
};

const loadMetaData = () => {
    if (audioPlayerStore.chapterName) {
        metaStore.setPageTitle(audioPlayerStore.chapterName)
        metaStore.setMetaData([
            { property: "og:audio:title", content: audioPlayerStore.chapterName },
            { name: "twitter:title", content: audioPlayerStore.chapterName },
            { property: "og:title", content: audioPlayerStore.chapterName },
        ])
    }

    if (audioPlayerStore.audioFiles) {
        metaStore.setMetaData([
            { property: "music:song:track", content: String(audioPlayerStore.audioFiles?.id) },
            { property: "og:url", content: audioPlayerStore.audioFiles?.audio_url as string },
            { property: "og:type", content: audioPlayerStore.audioFiles?.format as string },
            { property: "og:audio", content: audioPlayerStore.audioFiles?.audio_url },
            { property: "music:duration", content: audioPlayerStore.audioFiles?.duration.toString() },
            { property: "og:audio:type", content: audioPlayerStore.audioFiles?.format as string },
        ])
    }

    metaStore.setMetaData([
        { name: "twitter:image", content: `${import.meta.env.VITE_BASE_URL}/reciters/${audioPlayerStore.selectedReciter.reciter_id}.jpg` },
        { property: "music:musician", content: audioPlayerStore.selectedReciter.name },
        { property: "og:audio:artist", content: audioPlayerStore.selectedReciter.name },
        { property: "og:image", content: `${import.meta.env.VITE_BASE_URL}/reciters/${audioPlayerStore.selectedReciter.reciter_id}.jpg` },
    ])

    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: audioPlayerStore.chapterName,
            artist: audioPlayerStore.selectedReciter.name,
            album: "Quran",
            artwork: [
                {
                    src: `${import.meta.env.VITE_BASE_URL}/reciters/${audioPlayerStore.selectedReciter.reciter_id}.jpg`,
                    sizes: "96x96",
                    type: "image/jpg",
                },
            ],
        });

        navigator.mediaSession.setActionHandler("play", () => {
            playAudio()
            emit('update:modelValue', isPlaying.value)
        });
        navigator.mediaSession.setActionHandler("pause", () => {
            playAudio()
        })

        navigator.mediaSession.setActionHandler("seekto", ({ seekTime }) => {
            if (seekTime) {
                progressTimer.value = secondsToMilliSeconds(seekTime)
                playbackSeek()
            }
        })

        navigator.mediaSession.setActionHandler("nexttrack", () => {
            audioPlayerStore.playNext()
        })
        navigator.mediaSession.setActionHandler("previoustrack", () => {
            audioPlayerStore.playPrevious()
        })

    }
}

const loadedData = () => {
    audioPlayerStore.isLoading = true
    if (audioPlayerRef.value) {
        if (audioPlayerRef.value.readyState > 2) {
            // Verse Play 
            if (audioPlayerStore.selectedVerseKey) {
                const verseTiming = audioPlayerStore.audioFiles?.verse_timings.find((vt) =>
                    vt.verse_key === audioPlayerStore.selectedVerseKey)

                if (verseTiming) {
                    if (audioPlayerRef.value) {
                        audioPlayerRef.value.currentTime = milliSecondsToSeconds(verseTiming.timestamp_from);
                        progressTimer.value = secondsToMilliSeconds(verseTiming.timestamp_from / verseTiming.timestamp_to);
                    }
                }
            }
            // Auto Play Setting 
            if (audioPlayerSetting.autoPlay) {
                isPlaying.value = true
                audioPlayerStore.isLoading = false
                audioPlayerRef.value?.play();
            }

            audioPlayerStore.isLoading = false

            if (audioPlayerStore.audioFiles) {
                emit('update:isAudio', {
                    isPlaying: isPlaying.value,
                    verseKey: audioPlayerStore.selectedVerseKey,
                    audioID: audioPlayerStore.audioFiles.chapter_id,
                    format: audioPlayerStore.audioFiles.format || '',

                })
            }

            //     if (audioPlayerRef.value.buffered && audioPlayerRef.value.buffered.length) {
            //     const lastIndex = audioPlayerRef.value.buffered.length - 1;
            //     const timestamp = audioPlayerRef.value.buffered.end(lastIndex);
            //     console.log(timestamp);

            //     audioBuffer.value = timestamp
            // }

        } else {
            throw "Failed to fetch Audio"
        }


        // for (let i = 0; i < audioPlayerRef.value?.buffered.length; i++) {
        //     const startX = audioPlayerRef.value?.buffered.start(i);
        //     const endX = audioPlayerRef.value?.buffered.end(i);
        //     audioBuffer.value = (audioPlayerRef.value?.buffered.end(i) / audioPlayerRef.value?.buffered.start(i)) * 100
        //     const width = endX - startX;
        //     console.log(width);
        // }

    }
}



const playAudio = () => {
    if (audioPlayerRef.value) {
        if (audioPlayerRef.value.paused) {
            audioPlayerRef.value.play();
            isPlaying.value = true
        } else {
            audioPlayerRef.value.pause();
            isPlaying.value = false
        }

        if (audioPlayerStore.audioFiles) {
            emit('update:isAudio', {
                isPlaying: isPlaying.value,
                verseKey: audioPlayerStore.selectedVerseKey,
                audioID: audioPlayerStore.audioFiles.chapter_id,
                format: audioPlayerStore.audioFiles.format || '',
            })
        }
    }
}


// Keyboard Events
const keyboardVolumUp = () => {
    mediaVolume.value = mediaVolume.value < 1 ? mediaVolume.value + 0.1 : 1
    if (mediaVolume.value > 1) {
        mediaVolume.value = 1
        return
    } else {
        // changeMediaVolume()
    }
}

const keyboardVolumDown = () => {
    mediaVolume.value = mediaVolume.value > 0 ? mediaVolume.value - 0.1 : 0
    if (mediaVolume.value < 0) {
        mediaVolume.value = 0
        return
    } else {
        // changeMediaVolume()
    }
}

const closePlayer = () => {
    if (audioPlayerRef.value) {
        audioPlayerRef.value.pause();
    }
    // audioPlayerStore.audioFiles = null
    audioPlayerStore.chapterId = 0
    audioPlayerStore.selectedVerseKey = ""
    cleanupListeners()
    emit('update:modelValue', false)
    emit('update:isAudio', null)
    // disable autoscroll as page will be stuck after player is unmounted
    //audioPlayerStore.audioExperience.autoScroll = false
}

const muteAudio = () => {
    isMuted.value = !isMuted.value
    if (audioPlayerRef.value) audioPlayerRef.value.muted = isMuted.value
    setStorage("audio-player", {
        isMuted: isMuted.value,
        playbackRate: playbackRate.value,
        mediaVolume: mediaVolume.value,
    })
}

const changeMediaVolume = (volume: number) => {
    if (audioPlayerRef.value) {
        mediaVolume.value = volume
        audioPlayerRef.value.volume = mediaVolume.value
        setStorage("audio-player", {
            isMuted: isMuted.value,
            playbackRate: playbackRate.value,
            mediaVolume: mediaVolume.value,
        })
    }
}


</script>


<template>
    <v-bottom-sheet :model-value="modelValue" @update:model-value="closePlayer" :inset="!audioPlayerSetting.fullwidth"
        :scrim="false" persistent no-click-animation scroll-strategy="none" @keyup.up="keyboardVolumUp"
        @keyup.down="keyboardVolumDown">
        <v-card>
            <v-progress-linear v-model="progressTimer" clickable :height="7" @click="playbackSeek" hide-details
                buffer-color="orange" :buffer-value="audioBuffer"
                :max="audioPlayerStore.audioFiles?.duration"></v-progress-linear>
            <div class="d-flex my-4" :class="$vuetify.display.smAndDown ? 'flex-wrap' : 'justify-space-between'">
                <div class="ms-3 flex-grow-0 flex-shrink-0 order-1 my-auto">
                    <div class="text-body-1">
                        <div class="text-center" :class="$vuetify.display.smAndDown ? 'd-none' : 'd-inline-block'">
                            <v-avatar size="x-small">
                                <v-img :src="`reciters/${audioPlayerStore.selectedReciter.reciter_id}.jpg`">
                                    <template #error>
                                        <v-img :src="audioPlayerStore.avatarPlaceholder"></v-img>
                                    </template>
                                </v-img>
                            </v-avatar>
                            {{ audioPlayerStore.selectedReciter.name }}
                        </div>
                        <div class="text-caption" :class="$vuetify.display.mdAndUp ? 'ms-7' : ''"> {{
                            audioPlayerStore.chapterName }}</div>
                    </div>
                </div>
                <div class="order-2 flex-grow-1 flex-shrink-0 my-auto">
                    <audio-player-controls-component :playback-rate="playbackRate" :loop-audio="loopAudio"
                        :is-muted="isMuted" :is-playing="isPlaying" @update:loop-audio="loopAudio = $event"
                        @update:is-audio="emit('update:isAudio', $event)" v-model:media-volume="mediaVolume"
                        @update:change-media-volume="changeMediaVolume" @update:mute-audio="muteAudio"
                        @update:close-player="closePlayer" @update:play-audio="playAudio"
                        @update:playback-rate="setAudioPlayBackRate">
                    </audio-player-controls-component>
                    <div v-if="audioPlayerStore.audioFiles">
                        <audio :autoplay="audioPlayerSetting.autoPlay" controls ref="audioPlayerRef" class="d-none"
                            :src="audioPlayerStore.audioFiles.audio_url"
                            :type="`audio/${audioPlayerStore.audioFiles.format}`" @pause="playbackPaused"
                            @playing="playbackPlaying" @ended="playbackEnded" @canplaythrough="canPlayThrough"
                            @timeupdate="playbackListener" @seek="playbackSeek" @loadeddata="loadedData"
                            @loadedmetadata="loadMetaData">
                        </audio>
                    </div>
                </div>
                <div class="me-3 my-auto flex-grow-0 flex-shrink-0 order-3 text-caption">
                    <v-slide-x-reverse-transition>
                        <v-sheet v-if="elapsedTime" class="pa-2 text-right text-caption">{{ elapsedTime
                            }}</v-sheet>
                    </v-slide-x-reverse-transition>
                </div>
            </div>
        </v-card>
    </v-bottom-sheet>
</template>
