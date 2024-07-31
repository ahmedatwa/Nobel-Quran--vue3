<script setup lang="ts">
import { ref, computed, watch, reactive, watchEffect } from "vue";
import { useDisplay } from "vuetify";
// stores
import { useJuzStore, useChapterStore } from "@/stores";
// components
import { TitleButtonsComponent } from "@/components/quran"
// types
import type { JuzHeaderData, JuzVersesIntersecting } from "@/types/juz"
import type { MapVersesByPage } from "@/types/verse";
import type { VerseTimingsProps, PlayAudioEmit, IsAudioPlayingProps } from "@/types/audio";

// utils
import { scrollToElement, SMOOTH_SCROLL_TO_CENTER } from "@/utils/useScrollToElement"
import { getChapterNameByJuzId, getFirstVerseOfJuzByPage } from "@/utils/juz"

const juzStore = useJuzStore()
const { smAndDown } = useDisplay()
const { getChapterNameByFirstVerse } = useChapterStore()
const isIntersecting = ref(false)
const headerData = ref<JuzHeaderData | null>(null);
const intersectingJuzVerseNumber = ref<number>()
const verses = computed(() => {
    if (juzStore.selectedJuz) {
        return juzStore.selectedJuz.verses?.sort((a, b) => a.verse_number - b.verse_number)
    }
})

const defaultStyles = reactive({
    fontSize: "var(--quran-font-size-3)",
    fontFamily: "var(--quran-font-family-noto-kufi)"
})

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit]
    "update:headerData": [value: JuzHeaderData | null]
    "update:manualIntersecting": [value: JuzVersesIntersecting]
}>()

const props = defineProps<{
    isAudioPlaying: IsAudioPlayingProps
    verseTiming?: VerseTimingsProps
    audioExperience: { autoScroll: boolean; tooltip: boolean };
    cssVars?: Record<"fontSize" | "fontFamily", string>
    selectedJuzTab: string
}>()

// Highlight Active Words
const isWordHighlighted = (location: string, verseKey: string) => {
    if (props.verseTiming)
        return props.verseTiming.wordLocation === location && verseKey === props.verseTiming.verseKey
}

const mapVersesByPage = computed((): MapVersesByPage | undefined => {
    if (verses.value) {
        return verses.value.reduce((acc: any, obj) => {
            (acc[obj.page_number] = acc[obj.page_number] || []).push(obj);
            return acc;
        }, {});
    }
})

const onIntersect = async (intersecting: boolean, entries: any) => {
    isIntersecting.value = intersecting
    // const chapterId = entries[0].target.dataset.chapterId
    if (intersecting && entries[0].intersectionRatio >= 0.8) {
        const target = entries[0].target as HTMLDivElement
        if (target) {
            intersectingJuzVerseNumber.value = Number(target.dataset.verseNumber)
            let newHeaderData: JuzHeaderData | null = null
            // emit header data
            newHeaderData = {
                left: getChapterNameByJuzId(juzStore.selectedJuz?.id, Number(target.dataset.chapterId)),
                right: {
                    pageNumber: target.dataset.pageNumber || "",
                    hizbNumber: target.dataset.hizbNumber || "",
                    juzNumber: target.dataset.juzNumber || "",
                }
            }
            if (newHeaderData !== headerData.value) {
                headerData.value = newHeaderData
                emit('update:headerData', headerData.value)
            }
            // emit verse id for scroll in verses list 
            // help to fetch new verses 
            emit('update:manualIntersecting', {
                currentVerseNumber: intersectingJuzVerseNumber.value,
                lastVerseNumber: juzStore.getLastVerseOfJuz
            })
        }

    }
}

// auto mode with verse timing and feed header data
watchEffect(async () => {
    if (props.audioExperience.autoScroll) {
        const currentVerseNumber = props.verseTiming?.verseNumber
        const lastVerseNumber = juzStore.getLastVerseOfJuz

        if (props.isAudioPlaying?.isPlaying && currentVerseNumber) {
            // fetch more Verses
            if (currentVerseNumber === lastVerseNumber || currentVerseNumber >= lastVerseNumber - 5) {
                if (juzStore.selectedJuz?.pagination) {
                    await juzStore.getVerses(juzStore.selectedJuz.juz_number, true, juzStore.selectedJuz.pagination?.next_page)
                }
            }
            // Scroll into View
            const verseElement = `#line-${currentVerseNumber}`
            if (verseElement) {
                if (currentVerseNumber !== intersectingJuzVerseNumber.value) {
                    scroll(verseElement)
                }
            }
        }
    }
});

// emitting header data on mounted so 
// access to dismiss the navigation menu is available
// will be done only once as it will be triggred from scroll source
watch(() => juzStore.getFirstVerseOfJuz, (newVal) => {
    if (newVal) {
        headerData.value = {
            left: getChapterNameByJuzId(juzStore.selectedJuz?.id, newVal.chapter_id),
            right: {
                pageNumber: newVal.page_number,
                hizbNumber: newVal.hizb_number,
                juzNumber: newVal.juz_number,
            },
        };
        // emit header Data
        emit("update:headerData", headerData.value);
    }

}, { once: true })

// commit scroll to verse
const scroll = (el: string) => {
    if (smAndDown.value) {
        scrollToElement(el, 300, SMOOTH_SCROLL_TO_CENTER, 120)
    } else {
        scrollToElement(el)

    }
}
</script>

<template>
    <v-container class="smooth-scroll-behaviour">
        <v-row justify="center" :align="'center'">
            <v-card class="quran-reader-container" width="auto" flat>
                <v-card-text>
                    <v-container>
                        <v-row v-for="(verses, page, index) in mapVersesByPage" :key="page" :data-page-id="page"
                            class="verse-row" justify="center" :align="'end'">
                            <v-col cols="12">
                                <title-buttons-component :is-audio-player="isAudioPlaying" :chapter-id="index"
                                    @update:play-audio="$emit('update:playAudio', $event)"
                                    :verse-key="getFirstVerseOfJuzByPage(verses)"
                                    :audio-src="`juz-reading-${juzStore.selectedJuz?.id}`" isInfoDialog>
                                    <template #title>
                                        <h2>{{ $tr.rtl
                                            ? getChapterNameByFirstVerse(verses[0])?.nameArabic
                                            : getChapterNameByFirstVerse(verses[0])?.nameSimple
                                            }}
                                        </h2>
                                    </template>
                                    <template #subtitle>
                                        <h3 class="quran-content-title my-3"> {{
                                            getChapterNameByFirstVerse(verses[0])?.bismillahPre ?
                                                $tr.line('quranReader.textBismillah') : '' }}
                                        </h3>
                                    </template>
                                </title-buttons-component>
                            </v-col>
                            <v-col class="verse-col" :id="`page-${page}`" cols="10">
                                <div class="reading-view-word-wrapper" v-for="verse in verses" :key="verse.id"
                                    :id="`page-${page}-line-${verse.verse_number}`"
                                    :data-page-number="verse.page_number" :data-hizb-number="verse.hizb_number"
                                    :data-chapter-id="verse.chapter_id" :data-juz-number="verse.juz_number"
                                    :data-first-word="verse.words[0].location" :data-verse-number="verse.verse_number"
                                    v-intersect="{
                                        handler: onIntersect,
                                        options: {
                                            threshold: [0, 0.5, 1.0],
                                        },
                                    }">
                                    <h3 class="d-flex flex-wrap d-inline-flex" v-for="word in verse.words"
                                        :key="word.id" :data-word-position="word.position"
                                        :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
                                        :data-chapter-id="verse.chapter_id">
                                        <div :class="isWordHighlighted(word.location, word.verse_key)
                                            ? 'text-blue'
                                            : ''
                                            " class="word">
                                            <div v-if="word.char_type_name === 'end'" style="font-family: p3-v1;">({{
                                                word.text_uthmani
                                                }})
                                            </div>
                                            <div :style="[defaultStyles, cssVars]" v-else>{{ word.text_uthmani }}</div>
                                        </div>
                                    </h3>
                                </div>
                            </v-col>
                            <v-col cols="12" class="my-4">
                                <v-divider><span class="text-caption">{{ page }}</span></v-divider>
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
</style>