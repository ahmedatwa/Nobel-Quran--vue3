<script setup lang="ts">
import { computed, ref } from "vue"
import { TafsirDialogComponent } from '@/components';
import type { Verse } from "@/types"

const isCopied = ref(false)
const activeAudioData = ref<{ audioID: number, verseKey?: string } | null>(null)

const props = defineProps<{
    verse: Verse
    isAudioPlayer: { audioID: number, isPlaying?: boolean, format?: string } | null;
    size?: string
}>()

const emit = defineEmits<{
    "update:playAudio": [value: { audioID: number, verseKey: string }]
    "update:bookmarked": [value: number]
}>()

const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    isCopied.value = true
}

const playAudio = (audioID: number, verseKey: string) => {
    activeAudioData.value = {
        audioID, verseKey
    }
    emit("update:playAudio", { audioID, verseKey })
}

const iaPlaying = computed(() => {
    if (props.isAudioPlayer?.isPlaying) {
        if (props.isAudioPlayer?.audioID === activeAudioData.value?.audioID || props.verse.verse_key === activeAudioData.value?.verseKey)
            return true
    }
    return false
})

 
</script>

<template>
    <v-list class="text-center" :id="`verse-${verse.id}`" lines="one" :key="verse.verse_number">
        <v-list-item>
            <v-sheet class="text-caption" :key="verse.verse_key" :size="size">{{ verse.verse_key }}</v-sheet>
        </v-list-item>
        <v-list-item>
            <v-btn :icon="iaPlaying ? 'mdi-pause' : 'mdi-play'" :size="size" variant="text" :key="verse.verse_key"
                @click="playAudio(verse.chapter_id, verse.verse_key)" v-tooltip="'Play'"
                :color="iaPlaying ? 'primary' : ''">
            </v-btn>
        </v-list-item>
        <v-list-item>


            <v-btn icon="mdi-book-open-variant-outline" variant="text" :size="size" :key="verse.verse_key"
                v-tooltip="'Tafsir'" :ref="`tafsir${verse.id}`"></v-btn>

            <!-- <tafsir-dialog-component :activator="activator" :verse="verse" :key="verse.id">
            </tafsir-dialog-component> -->

        </v-list-item>
        <v-list-item>
            <v-btn :icon="verse.bookmarked ? 'mdi-bookmark-check' : 'mdi-bookmark-minus-outline'" :size="size"
                variant="text" :key="verse.verse_number" @click="$emit('update:bookmarked', verse.verse_number)"
                v-tooltip="'Bookmark'" :color="verse.bookmarked ? 'primary' : ''"></v-btn>
        </v-list-item>
        <v-list-item>
            <v-btn :icon="isCopied ? 'mdi-checkbox-multiple-marked' : 'mdi-content-copy'" variant="text" :size="size"
                :key="verse.verse_key" @click="copyText(verse.text_uthmani)" v-tooltip="'Copy'"
                :color="isCopied ? 'primary' : ''"></v-btn>
        </v-list-item>
    </v-list>

    <v-dialog :activator="`tafsir${verse.id}`" max-width="340">
        <template v-slot:default="{ isActive }">
            <v-card prepend-icon="mdi-bullseye-arrow"
                text="Pass any valid querySelector to the activator prop to bind the dialog to the target element."
                title="Target Activator">
                <template v-slot:actions>
                    <v-btn class="ml-auto" text="Close" @click="isActive.value = false"></v-btn>
                </template>
            </v-card>
        </template>
    </v-dialog>

</template>