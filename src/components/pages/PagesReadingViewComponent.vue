<script setup lang="ts">
import { ref, computed, inject, nextTick } from "vue";
// stores
import { usePageStore } from "@/stores";
// components
import { TitleButtonsComponent } from "@/components/quran"
// types
import type { PageHeaderData } from "@/types/page"
import { VerseTimingsProps } from "@/types/audio";

// utils
import { getChapterNameByChapterId } from "@/utils/chapter"
import { scrollToElement } from "@/utils/useScrollToElement"


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
        return pageStore.selectedPage.verses?.reduce((i: any, o) => {
            (i[o.chapter_id] = i[o.chapter_id] || []).push(o);
            return i;
        }, {});
    }
})

const chapterAudioId = computed(() => {
    if (pageStore.selectedPage) {
        return pageStore.selectedPage
    }
    return 0
})
const emit = defineEmits<{
    "update:playAudio": [value: { audioID: number, verseKey?: string }]
    "update:headerData": [value: PageHeaderData]
    "update:intersectingPageVerseNumber": [value: number]
    "update:activePageNumber": [value: number]
}>()

const props = defineProps<{
    isAudioPlaying: { audioID: number, isPlaying?: boolean, format?: string } | null;
    groupedTranslationsAuthors?: string;
    verseTiming: VerseTimingsProps;
    audioExperience: { autoScroll: boolean, tooltip: boolean }
    cssVars?: { size: string, family: string }
}>()

// Highlight Active Words
const isWordHighlighted = (location: string, verseKey: string) => {
    if (props.verseTiming)
        return props.verseTiming.wordLocation === location && verseKey === props.verseTiming.verseKey
}

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

const getFirstVerseRow = computed(() => {
    if (pageStore.selectedPage) {
        if (pageStore.selectedPage.verses)
            return pageStore.selectedPage.verses[0].verse_number
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
        const el = document.querySelector(`#row${getFirstVerseRow.value}`)
        scrollToElement(`#row${getFirstVerseRow.value}`)
    }
}
</script>

<template>
    <v-container>
        <v-row justify="center" :align="'center'" no-gutters>
            <v-card class="quran-reader-container" width="auto" flat>
                <v-card-text>
                    <v-container>
                        <v-row v-for="(verses, chapterId) in groupVersesByChapter" :key="chapterId"
                            :data-chapter-id="chapterId" class="verse-row" no-gutters justify="center" :align="'start'">
                            <v-col cols="12">
                                <title-buttons-component :grouped-translations-authors="groupedTranslationsAuthors"
                                    :chapter-id="1" :is-audio-player="isAudioPlaying"
                                    @update:translations-drawer="translationsDrawer = $event"
                                    @update:play-audio="$emit('update:playAudio', $event)">
                                    <template #title>
                                        <h2>{{ getChapterNameByChapterId(chapterId)?.nameArabic }}</h2>
                                        <h3>{{ getChapterNameByChapterId(chapterId)?.bismillahPre ?
                                            $tr.line("quranReader.textBismillah") : '' }}</h3>
                                    </template>
                                </title-buttons-component>
                            </v-col>
                            <v-col class="verse-col d-flex flex-wrap justify-center align-self-end" :id="`chapter-${chapterId}`"
                                cols="11">
                                <div class="d-inline-flex" v-for="verse in verses" :key="verse.id"
                                    :id="`line-${verse.verse_number}`"
                                    :data-hizb-number="verse.hizb_number" :data-chapter-id="verse.chapter_id"
                                    :data-juz-number="verse.juz_number" :data-verse-number="verse.verse_number"
                                    v-intersect.quite="{
                                        handler: onIntersect,
                                        options: {
                                            threshold: [0, 0.5, 1.0],
                                        },
                                    }">
                                    <h3 v-for="word in verse.words" :key="word.id" :data-word-position="word.position"
                                        class="" :data-hizb-number="verse.hizb_number"
                                        :data-juz-number="verse.juz_number" :data-chapter-id="verse.chapter_id">
                                        <div :class="isWordHighlighted(word.position, word.verse_key)
                                            ? 'text-blue'
                                            : ''
                                            " class="word">
                                            <div v-if="word.char_type_name === 'end'" style="font-family: p3-v1;">({{
                                                word.text_uthmani
                                            }})
                                            </div>
                                            <div v-else>{{ word.text_uthmani }}</div>
                                        </div>
                                    </h3>
                                </div>
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

.quran-reader-container .verse-col {
    font-size: v-bind("props.cssVars?.size");
    font-family: v-bind("props.cssVars?.family");
}
</style>