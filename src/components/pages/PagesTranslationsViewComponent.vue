<script setup lang="ts">
import { ref, inject, watchEffect, computed, nextTick } from "vue"
// stores
import { usePageStore } from "@/stores";
// components
import { TitleButtonsComponent, ButtonsActionListComponent } from "@/components/quran"
// types
import type { PageHeaderData, GroupVersesByChapterID } from "@/types/page";
import { VerseTimingsProps } from "@/types/audio";
// utils
import { scrollToElement } from "@/utils/useScrollToElement"
import { getChapterNameByChapterId } from "@/utils/chapter"

const pageStore = usePageStore()

const isIntersecting = ref(false)
const translationsDrawer = inject("translationDrawer")
const headerData = ref<PageHeaderData | null>(null);
const intersectingPageVerseNumber = ref<number>()

/**
 * group verses by chapter id
 * so i can get chapter name
 */
const groupVersesByChapter = computed(() => {
    if (pageStore.selectedPage) {
        return pageStore.selectedPage.verses?.reduce((i: GroupVersesByChapterID, o) => {
            (i[o.chapter_id] = i[o.chapter_id] || []).push(o);
            return i;
        }, {});
    }
})

const props = defineProps<{
    isAudioPlaying: { audioID: number, isPlaying?: boolean, format?: string } | null;
    groupedTranslationsAuthors?: string;
    verseTiming: VerseTimingsProps;
    audioExperience: { autoScroll: boolean, tooltip: boolean }
    cssVars?: { size: string, family: string }
}>()

const emit = defineEmits<{
    "update:playAudio": [value: { audioID: number, verseKey?: string }]
    "update:headerData": [value: PageHeaderData]
    "update:intersectingPageVerseNumber": [value: number]
    "update:activePageNumber": [value: number]
}>()


// Manual Mode Scroll
const onIntersect = async (intersecting: boolean, entries: any) => {
    isIntersecting.value = intersecting
    if (intersecting) {
        // emit header data
        headerData.value = {
            left: "",
            right: {
                pageNumber: entries[0].target.dataset.pageNumber,
                hizbNumber: entries[0].target.dataset.hizbNumber,
                juzNumber: entries[0].target.dataset.juzNumber,
            }
        }

        emit('update:headerData', headerData.value)

        if (entries[0].intersectionRatio === 0.5) {
            intersectingPageVerseNumber.value = Number(entries[0].target.dataset.verseNumber)
            // emit verse id for scroll in verses list 
            // help to fetch new verses 
            emit('update:intersectingPageVerseNumber', intersectingPageVerseNumber.value)

        }
    }
}

const setBookmarked = (verseNumber: number) => {
    pageStore.selectedPage?.verses?.forEach((v) => {
        if (v.verse_number === verseNumber) v.bookmarked = true
        return
    })
}

// Highlight Active Words
const isWordHighlighted = (location: string, verseKey: string) => {
    if (props.verseTiming)
        return props.verseTiming.wordLocation === location && verseKey === props.verseTiming.verseKey
}

const getFirstVerseRow = computed(() => {
    if (pageStore.selectedPage) {
        if (pageStore.selectedPage.verses)
            return pageStore.selectedPage.verses[0].verse_number
    }
})

// watchers
// auto mode with verse timing and feed header data
watchEffect(async () => {
    if (props.verseTiming.verseKey) {
        if (props.audioExperience.autoScroll) {
            const el = document.getElementById(`verse-word${props.verseTiming.verseKey}`)
            if (el) {
                headerData.value = {
                    left: "",
                    right: {
                        pageNumber: el.getAttribute("data-page-number") || '',
                        hizbNumber: el.getAttribute("data-hizb-number") || '',
                        juzNumber: el.getAttribute("data-juz-number") || '',
                    }
                }
                // emit header Data
                emit('update:headerData', headerData.value)
                // Scroll into View
                // Verse Column
                scrollToElement(`verse-word${props.verseTiming.verseKey}`)
            }
        }
    }
})


// Pagination
const getPrevPage = async () => {
    if (pageStore.selectedPage) {
        const currentJuz = pageStore.selectedPage.pageNumber
        if (currentJuz) {
            const prev = pageStore.pages?.find((j) => j.pageNumber === currentJuz - 1)
            if (prev) {
                if (!prev.verses?.length) {
                    await pageStore.getVerses(prev.pageNumber, true)
                }
                if (prev.verses?.length) {
                    pageStore.selectedPage = prev
                }
            }
        }
        emit("update:activePageNumber", pageStore.selectedPage.pageNumber)
        // scroll to first verese row 
        if (getFirstVerseRow.value) {
            console.log(getFirstVerseRow.value);

            nextTick(() => {
                scrollToElement(`#row${getFirstVerseRow.value}`)
            })
        }
    }
}

const getNextPage = async () => {
    if (pageStore.selectedPage) {
        const currentJuz = pageStore.selectedPage.pageNumber
        if (currentJuz) {
            const next = pageStore.pages?.find((j) => j.pageNumber === currentJuz + 1)
            if (next) {
                if (!next.verses?.length) {
                    await pageStore.getVerses(next.pageNumber, true)
                }
                if (next.verses?.length) {
                    pageStore.selectedPage = next
                }
            }
        }
        emit("update:activePageNumber", pageStore.selectedPage.pageNumber)
        // scroll to first verese row 
        if (getFirstVerseRow.value) {
            console.log(getFirstVerseRow.value);
            nextTick(() => {
                scrollToElement(`#row${getFirstVerseRow.value}`)
            })
        }
    }
}

const getStartOfPage = () => {
    if (getFirstVerseRow.value) {
        //const el = document.querySelector(`#row${getFirstVerseRow.value}`)
        scrollToElement(`#row${getFirstVerseRow.value}`)
    }
}


</script>

<template>
    <v-container fluid>
        <v-row :align="'center'" justify="center" dense v-for="(verses, chapterId) in groupVersesByChapter"
            :key="chapterId">
            <v-col cols="12">
                <title-buttons-component :grouped-translations-authors="groupedTranslationsAuthors" :chapter-id="1"
                    :is-audio-player="isAudioPlaying" @update:translations-drawer="translationsDrawer = $event"
                    @update:play-audio="$emit('update:playAudio', $event)">
                    <template #title>
                        <h2>{{ getChapterNameByChapterId(chapterId)?.nameArabic }}</h2>
                        <h3>{{ getChapterNameByChapterId(chapterId)?.bismillahPre ? $tr.line("quranReader.textBismillah") : '' }}</h3>
                    </template>
                </title-buttons-component>
            </v-col>
            <v-col cols="12" class="mb-2" v-for="verse in verses" :key="verse.verse_key"
                :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
                :data-chapter-id="verse.chapter_id" :data-verse-number="verse.verse_number"
                :data-verse-key="verse.verse_key" :data-page-number="verse.page_number" :id="`row${verse.verse_number}`"
                :data-intersecting="isIntersecting" v-intersect.quite="{
                    handler: onIntersect,
                    options: {
                        threshold: [0, 0.5, 1.0],
                    },
                }">
                <v-row :id="`page-verse-row${verse.verse_number}`">
                    <v-col cols="1" class="action-list" :order="$tr.rtl.value ? 2 : 1">
                        <buttons-action-list-component @update:play-audio="$emit('update:playAudio', $event)"
                            size="small" :is-audio-player="isAudioPlaying" :verse="verse"
                            @update:bookmarked="setBookmarked">
                        </buttons-action-list-component>
                    </v-col>
                    <v-col cols="11" class="text-right pt-3" :order="$tr.rtl.value ? 1 : 2">
                        <v-list class="quran-translation-view" dense>
                            <v-list-item v-for="word in verse.words" :key="word.id" :id="`verse-word${verse.verse_key}`"
                                :data-hizb-number="verse.hizb_number" :data-verse-number="verse.verse_number"
                                :data-chapter-id="verse.chapter_id" :data-juz-number="verse.juz_number"
                                :data-page-number="verse.page_number" class="item">
                                <v-list-item-title class="word" :id="`target${word.id}`"
                                    :class="isWordHighlighted(word.location, word.verse_key) ? 'text-blue' : ''">
                                    <h3 v-if="word.char_type_name === 'end'">
                                        ({{ word.text_uthmani }})
                                    </h3>
                                    <h3 v-else> {{ word.text_uthmani }}
                                        <v-tooltip v-if="audioExperience.tooltip" activator="parent"
                                            :target="`#target${word.id}`" :model-value="isWordHighlighted(word.location, word.verse_key)
                                                " location="top center" origin="bottom center"
                                            :text="word.translation.text">
                                        </v-tooltip>
                                        <v-tooltip v-else activator="parent" :target="`#target${word.id}`"
                                            location="top center" origin="bottom center" :text="word.translation.text">
                                        </v-tooltip>
                                    </h3>
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
                </v-row>
                <v-divider class="mb-3"></v-divider>
            </v-col>
        </v-row>
        <v-row justify="center" :align="'center'">
            <!-- Prev -->
            <v-col cols="12" class="text-center" v-if="pageStore.selectedPage && pageStore.selectedPage.verses.length">
                <v-btn v-if="pageStore.selectedPage?.pageNumber > 1" prepend-icon="mdi-arrow-left-bottom" class="me-2"
                    variant="outlined" @click="getPrevPage">{{
                        $tr.line('quranReader.prevPage') }}</v-btn>
                <!-- up -->
                <v-btn prepend-icon="mdi-arrow-up-right" variant="outlined" class="me-2" @click="getStartOfPage">{{
                    $tr.line('quranReader.startPage') }}</v-btn>
                <!-- Next -->
                <v-btn v-if="pageStore.selectedPage?.pageNumber <= 604" prepend-icon="mdi-arrow-right-bottom"
                    class="me-2" variant="outlined" @click="getNextPage">{{
                        $tr.line('quranReader.nextPage') }}</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>
<style scoped>
:deep(.v-card-item__append) {
    align-items: start !important;
}

:deep(.v-list-item--density-default:not(.v-list-item--nav).v-list-item--one-line) {
    padding-inline: 3px;
}

.quran-translation-view h3 {
    font-size: v-bind("props.cssVars?.size");
    font-family: v-bind("props.cssVars?.family");
}
</style>