<script setup lang="ts">
import { ref, inject, watchEffect, nextTick, computed } from "vue"
// stores
import { useJuzStore, useChapterStore } from "@/stores";
// components
import { TitleButtonsComponent, ButtonsActionListComponent } from "@/components/quran"
// utils
import { getFirstVerseNumberInJuz } from "@/utils/verse"
// types
import type { HeaderData } from "@/types";

const juzStore = useJuzStore()
const { getChapterName } = useChapterStore()
const isIntersecting = ref(false)
const translationsDrawer = inject("translationDrawer")
const headerData = ref<HeaderData | null>(null);
const intersectingJuzVerseNumber = ref<number>()

const props = defineProps<{
    isAudioPlaying: { audioID: number, isPlaying?: boolean, format?: string } | null;
    groupedTranslationsAuthors?: string;
    verseTiming: {
        chapterId: number;
        verseKey: String;
        inRange: boolean;
        wordLocation: number;
    }
    audioExperience: { autoScroll: boolean, tooltip: boolean }
    cssVars?: { size: string, family: string }
}>()

const emit = defineEmits<{
    "update:playAudio": [value: { audioID: number, verseKey?: string }]
    "update:juzHeaderData": [value: HeaderData]
    "update:intersectingJuzVerseNumber": [value: number]
    "update:activejuz_number": [value: number]
}>()


// Manual Mode Scroll
const onIntersect = async (intersecting: boolean, entries: any) => {
    isIntersecting.value = intersecting
    if (intersecting) {
        // emit header data
        headerData.value = {
            left: entries[0].target.dataset.chapterId,
            right: {
                pageNumber: entries[0].target.dataset.pageNumber,
                hizbNumber: entries[0].target.dataset.hizbNumber,
                juzNumber: entries[0].target.dataset.juz_number,
            }
        }

        emit('update:juzHeaderData', headerData.value)

        if (entries[0].intersectionRatio === 1) {
            intersectingJuzVerseNumber.value = Number(entries[0].target.dataset.verseNumber)
            // emit verse id for scroll in verses list 
            // help to fetch new verses 
            emit('update:intersectingJuzVerseNumber', intersectingJuzVerseNumber.value)

        }
    }
}

const setBookmarked = (verseNumber: number) => {
    juzStore.selectedJuz?.verses?.forEach((v) => {
        if (v.verse_number === verseNumber) v.bookmarked = true
        return
    })
}

// Highlight Active Words
const isWordHighlighted = (position: number, verseKey: string) => {
    if (props.verseTiming)
        return props.verseTiming.wordLocation === position && verseKey === props.verseTiming.verseKey
}

// watchers
// auto mode with verse timing and feed header data
watchEffect(async () => {
    if (props.verseTiming.verseKey) {
        if (props.audioExperience.autoScroll) {
            const el = document.getElementById(`verse-word${props.verseTiming.verseKey}`)
            if (el) {
                headerData.value = {
                    left: el.getAttribute("data-chapter-id"),
                    right: {
                        pageNumber: el.getAttribute("data-page-number"),
                        hizbNumber: el.getAttribute("data-hizb-number"),
                        juzNumber: el.getAttribute("data-juz-number"),
                    }
                }
                // emit header Data
                emit('update:juzHeaderData', headerData.value)
                // Scroll into View
                // Verse Column
                el?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
        }
    }
})


// Buttons
const getNextJuz = async () => {
    if (juzStore.selectedJuz) {
        const currentJuz = juzStore.selectedJuz.juz_number
        if (currentJuz) {
            const next = juzStore.juzList.find((j) => j.juz_number === currentJuz + 1)
            if (next) {
                if (!next.verses?.length) {
                    await juzStore.getVerses(next.juz_number, true)
                }
                if (next.verses?.length) {
                    juzStore.selectedJuz = next
                }
            }
        }
        emit("update:activejuz_number", juzStore.selectedJuz.juz_number)
        // scroll to first verese row 
        const rowID = getFirstVerseNumberInJuz(juzStore.selectedJuz.verse_mapping)
        nextTick(() => {
            const el = document.querySelector(`#row${rowID}`)
            if (el) el.scrollIntoView({ behavior: "auto", block: "center" })
        })
    }
}

const getPrevJuz = async () => {
    if (juzStore.selectedJuz) {
        const currentJuz = juzStore.selectedJuz.juz_number
        if (currentJuz) {
            const prev = juzStore.juzList.find((j) => j.juz_number === currentJuz - 1)
            if (prev) {
                if (!prev.verses?.length) {
                    await juzStore.getVerses(prev.juz_number, true)
                }
                if (prev.verses?.length) {
                    juzStore.selectedJuz = prev
                }
            }
        }
        emit("update:activejuz_number", juzStore.selectedJuz.juz_number)
        // scroll to first verese row 
        const rowID = getFirstVerseNumberInJuz(juzStore.selectedJuz.verse_mapping)
        nextTick(() => {
            const el = document.querySelector(`#row${rowID}`)
            if (el) el.scrollIntoView({ behavior: "auto", block: "center" })
        })
    }
}

const getStartOfJuz = () => {
    if (juzStore.selectedJuz) {
        const rowID = getFirstVerseNumberInJuz(juzStore.selectedJuz.verse_mapping)
        if (rowID) {
            const el = document.querySelector(`#row${rowID}`)
            if (el) el.scrollIntoView({ behavior: "auto", block: "center" })
        }
    }
}

const isNextJuzDisabled = computed(() => {
    if (juzStore.selectedJuz?.verses) {
        return juzStore.selectedJuz.verses.length < juzStore.selectedJuz.verses_count
    }
})
</script>

<template>
    <v-container fluid>
        <v-row :align="'center'" justify="center" dense v-for="(verses, key) in juzStore.juzVerseMap" :key="key"
            :id="`verse-row${key}`">
            <v-col cols="12">
                <title-buttons-component :chapter-id="Number(key)"
                    :grouped-translations-authors="groupedTranslationsAuthors" :is-audio-player="isAudioPlaying"
                    @update:translations-drawer="translationsDrawer = $event"
                    @update:play-audio="$emit('update:playAudio', $event)">
                    <template #title>
                        <v-sheet>{{ getChapterName(key)?.ar }}</v-sheet>
                        <v-sheet>{{ getChapterName(key)?.bismillah ? $tr.line("quranReader.textBismillah") : ''
                            }}</v-sheet>
                    </template>
                </title-buttons-component>
            </v-col>
            <v-col cols="12" :id="`verse-col-${key}`">
                <v-row v-for="verse in verses" :key="verse.verse_number" :data-hizb-number="verse.hizb_number"
                    :data-juz-number="verse.juz_number" :data-verse-number="verse.verse_number"
                    :id="`row${verse.verse_number}`" :data-page-number="verse.page_number"
                    :data-verse-key="verse.verse_key" :data-chapter-id="verse.chapter_id"
                    :data-intersecting="isIntersecting" v-intersect.quite="{
                        handler: onIntersect,
                        options: {
                            threshold: [0, 0.5, 1.0]
                        }
                    }">
                    <v-col cols="1" class="action-list" :order="$tr.rtl.value ? 2 : 1">
                        <buttons-action-list-component @update:play-audio="$emit('update:playAudio', $event)"
                            size="small" :is-audio-player="isAudioPlaying" :verse="verse"
                            @update:bookmarked="setBookmarked">
                        </buttons-action-list-component>
                    </v-col>
                    <v-col cols="11" class="text-right pt-3" :order="$tr.rtl.value ? 1 : 2">
                        <v-list class="quran-content" dense>
                            <v-list-item v-for="word in verse.words" :key="word.id" :id="`verse-word${verse.verse_key}`"
                                :data-hizb-number="verse.hizb_number" :data-verse-number="verse.verse_number"
                                :data-juz-number="verse.juz_number" class="item">
                                <v-list-item-title class="quran-content title" :id="`target${word.id}`"
                                    :class="isWordHighlighted(word.position, word.verse_key) ? 'text-blue' : ''">
                                    <div>{{ word.text_uthmani }}
                                        <v-tooltip activator="parent" :target="`#target${word.id}`"
                                            v-if="audioExperience.tooltip"
                                            :model-value="isWordHighlighted(word.position, word.verse_key)"
                                            location="top center" origin="bottom center" :text="word.translation.text">
                                        </v-tooltip>
                                        <v-tooltip activator="parent" :target="`#target${word.id}`" v-else
                                            location="top center" origin="bottom center" :text="word.translation.text">
                                        </v-tooltip>
                                    </div>
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                        <v-list>
                            <v-list-item class="text-left" v-for="translation in verse.translations"
                                :key="translation.id">
                                <div class="translation" v-html="translation.text"></div>
                                <v-sheet class="text-caption mt-2 text-disabled">
                                    -- {{ translation.resource_name }}</v-sheet>
                            </v-list-item>
                        </v-list>
                    </v-col>
                    <v-divider class="mb-3"></v-divider>
                </v-row>
            </v-col>
        </v-row>
        <v-row justify="center" :align="'center'">
            <!-- Prev -->
            <v-col cols="12" class="text-center" v-if="juzStore.selectedJuz">
                <v-btn v-if="juzStore.selectedJuz?.juz_number > 1" prepend-icon="mdi-arrow-left-bottom" class="me-2"
                    variant="outlined" @click="getPrevJuz">{{
                        $tr.line('quranReader.prevJuz') }}</v-btn>
                <!-- up -->
                <v-btn prepend-icon="mdi-arrow-up-right" variant="outlined" class="me-2" @click="getStartOfJuz">{{
                    $tr.line('quranReader.startJuz') }}</v-btn>
                <!-- Next -->
                <v-btn v-if="juzStore.selectedJuz?.juz_number <= 30" prepend-icon="mdi-arrow-right-bottom" class="me-2"
                    variant="outlined" @click="getNextJuz" :disabled="isNextJuzDisabled">{{
                        $tr.line('quranReader.nextJuz') }}</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>
<style scoped>
:deep(.v-card-item__append) {
    align-items: start !important;
}

.quran-content {
    font-family: v-bind("props.cssVars?.family");
}

.quran-content .title {
    font-size: v-bind("props.cssVars?.size");
}

.action-list {
    padding: 2px !important;
}
</style>