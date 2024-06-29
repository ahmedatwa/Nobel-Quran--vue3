<script setup lang="ts">
import { ref, computed } from "vue";
import { useSurahStore } from "@/stores";
import { TitleButtonsComponent } from "@/components"
import type { HeaderData } from "@/types"


const surahStore = useSurahStore()
const isIntersecting = ref(false)
const headerData = ref<HeaderData | null>(null);
const intersectingVerseNumber = ref<number>()
const verses = computed(() => surahStore.selectedSurah?.verses.sort((a, b) => a.verse_number - b.verse_number))
const chapterAudioId = computed(() => {
    if (surahStore.selectedSurah) {
        return surahStore.selectedSurah?.id
    }
    return 0
})
const emit = defineEmits<{
    "update:playAudio": [value: { audioID: number, verseKey?: string }]
    "update:headerData": [value: HeaderData]
    "update:intersectingVerseNumber": [value: number]
}>()

const props = defineProps<{
    isAudioPlaying: { audioID: number, isPlaying?: boolean, format?: string } | null;
    verseTiming: {
        chapterId: number;
        verseKey: String;
        inRange: boolean;
        wordLocation: number;
    }
    cssVars?: { size: string, family: string }
}>()

// Highlight Active Words
const isWordHighlighted = (position: number, verseKey: string) => {
    if (props.verseTiming)
        return props.verseTiming.wordLocation === position && verseKey === props.verseTiming.verseKey
}

const mapVersesByPage = computed(() => {
    if (verses.value) {
        return verses.value.reduce((acc: any, obj) => {
            (acc[obj.page_number] = acc[obj.page_number] || []).push(obj);
            return acc;
        }, {});
    }
})


const onIntersect = async (intersecting: boolean, entries: any) => {
    isIntersecting.value = intersecting
    if (intersecting) {
        // emit header data
        headerData.value = {
            left: surahStore.selectedSurah?.name_simple + "," + surahStore.selectedSurah?.name_arabic,
            right: {
                pageNumber: surahStore.selectedSurah?.pagination ? surahStore.selectedSurah.pagination.current_page : 1,
                hizbNumber: entries[0].target.dataset.hizbNumber,
                juzNumber: entries[0].target.dataset.juzNumber,
            }
        }

        emit('update:headerData', headerData.value)

        if (entries[0].intersectionRatio === 1) {
            intersectingVerseNumber.value = Number(entries[0].target.dataset.verseNumber)
            // emit verse id for scroll in verses list 
            // help to fetch new verses 
            emit('update:intersectingVerseNumber', intersectingVerseNumber.value)

        }
    }
}
</script>

<template>
    <v-container>
        <v-row justify="center" :align="'center'" no-gutters>

            <v-col cols="12">
                <title-buttons-component :is-audio-player="isAudioPlaying" :chapter-id="chapterAudioId"
                    @update:play-audio="$emit('update:playAudio', $event)" isInfoDialog>
                </title-buttons-component>
            </v-col>
            <v-divider></v-divider>
            <v-card class="card" width="600" flat>
                <template #title>
                    <v-sheet class="quran-content-title">{{ $tr.rtl ? surahStore.selectedSurah?.name_arabic :
                        surahStore.selectedSurah?.name_simple }}</v-sheet>
                </template>
                <template #subtitle>
                    <v-sheet class="quran-content-title my-3"> {{ surahStore.selectedSurah?.bismillah_pre ?
                        $tr.line('quranReader.textBismillah') : '' }}
                    </v-sheet>
                </template>
                <v-card-text>
                    <v-container>
                        <v-row no-gutters>
                            <v-col v-for="(verses, k) in mapVersesByPage" :key="k" class="quran-content" cols="12">
                                <v-sheet v-for="verse in verses" :key="verse.id" :id="verse.verse_number"
                                    class="word-wrapper" :data-hizb-number="verse.hizb_number"
                                    :data-juz-number="verse.juz_number" :data-verse-number="verse.verse_number"
                                    v-intersect.quite="{
                                        handler: onIntersect,
                                        options: {
                                            threshold: [0, 0.5, 1.0]
                                        }
                                    }">
                                    <span v-for="word in verse.words" :key="word.id" class="item"
                                        :id="`verse-word${verse.verse_key}`" :data-hizb-number="verse.hizb_number"
                                        :data-juz-number="verse.juz_number">
                                        <p :class="isWordHighlighted(word.position, word.verse_key) ? 'text-blue' : ''">
                                            {{ word.text_uthmani }}
                                        </p>
                                    </span>
                                </v-sheet>
                                <v-col cols="12" class="my-4 text-caption d-flex flex-column border-b-thin ">
                                    {{ k }}
                                </v-col>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-row>
    </v-container>

</template>
<style scoped>
:deep(.v-list-item--density-default.v-list-item--one-line) {
    min-height: 10px !important
}

:deep(.v-list-item--density-default:not(.v-list-item--nav).v-list-item--one-line) {
    padding-inline: 0px
}

.quran-content p {
    font-size: v-bind("props.cssVars?.size");
}

.quran-content p {
    font-family: v-bind("props.cssVars?.family");
}

.card {
    text-align: center;
}

.word-wrapper {
    line-height: 40px;
    direction: rtl;
}
</style>