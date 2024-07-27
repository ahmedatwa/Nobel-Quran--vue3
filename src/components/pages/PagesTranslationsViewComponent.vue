<script setup lang="ts">
import { ref, inject, watchEffect } from "vue"
import { computed, nextTick, watch, reactive } from "vue"
// stores
import { useChapterStore, usePageStore } from "@/stores";
// components
import { TitleButtonsComponent, ButtonsActionListComponent } from "@/components/quran"
// types
import type { PageHeaderData, GroupVersesByChapterID } from "@/types/page";
import { VerseTimingsProps, PlayAudioEmit } from "@/types/audio";
// utils
import { scrollToElement, isInViewport } from "@/utils/useScrollToElement";

const pageStore = usePageStore()
const { getChapterNameByChapterId } = useChapterStore()
const isIntersecting = ref(false)
const translationsDrawer = inject("translationDrawer")
const headerData = ref<PageHeaderData | null>(null);
const defaultStyles = reactive({
    fontSize: "var(--quran-font-size-3)",
    fontFamily: "var(--quran-font-family-noto-kufi)"
})
/**
 * group verses by chapter id
 * so i can get chapter name
 */
const selectedVerses = computed(() => {
    if (pageStore.selectedPage) {
        return pageStore.selectedPage.verses
    }
})

const groupVersesByChapter = computed(() => {
    if (selectedVerses.value) {
        return selectedVerses.value?.reduce((i: GroupVersesByChapterID, o) => {
            (i[o.chapter_id] = i[o.chapter_id] || []).push(o);
            return i;
        }, {});
    }
})

const props = defineProps<{
    isAudioPlaying: { audioID: number, isPlaying?: boolean, format?: string } | null;
    groupedTranslationsAuthors?: string;
    verseTiming?: VerseTimingsProps;
    audioExperience: { autoScroll: boolean, tooltip: boolean }
    cssVars?: Record<"fontSize" | "fontFamily", string>
}>()

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit]
    "update:headerData": [value: PageHeaderData]
    "update:intersectingPageVerseNumber": [value: number]
    "update:activePageNumber": [value: number]
}>()


// Manual Mode Scroll
const onIntersect = async (intersecting: boolean, entries: any) => {
    isIntersecting.value = intersecting
    let newHeaderData: PageHeaderData | null = null
    if (intersecting && entries[0].intersectionRatio >= 0.8) {
        const target = entries[0].target
        const chapterId: number = target.dataset.chapterId
        // emit header data
        // Avoid watchers by comparing 2 objects
        newHeaderData = {
            left: getChapterNameByChapterId(chapterId),
            right: {
                pageNumber: target.dataset.pageNumber,
                hizbNumber: target.dataset.hizbNumber,
                juzNumber: target.dataset.juzNumber,
            },
        };

        if (newHeaderData !== headerData.value) {
            headerData.value = newHeaderData
            // emit header Data
            emit("update:headerData", headerData.value)
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
    if (props.verseTiming) {
        if (props.audioExperience.autoScroll) {
            const el = document.querySelector(`#verse-word${props.verseTiming.verseKey}`) as HTMLDivElement
            if (!isInViewport(el)) {
                // headerData.value = {
                //     //left: ,
                //     right: {
                //         pageNumber: el.getAttribute("data-page-number") || '',
                //         hizbNumber: el.getAttribute("data-hizb-number") || '',
                //         juzNumber: el.getAttribute("data-juz-number") || '',
                //     }
                // }
                // emit header Data
                // emit('update:headerData', headerData.value)
                // Scroll into View
                if (props.isAudioPlaying?.isPlaying) {
                    scrollToElement(`#verse-row${props.verseTiming.verseKey}`)
                }
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
            nextTick(() => {
                scrollToElement(`#page-verse-row${getFirstVerseRow.value}`)
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
            nextTick(() => {
                scrollToElement(`#page-verse-row${getFirstVerseRow.value}`)
            })
        }
    }
}

const getStartOfPage = () => {
    if (getFirstVerseRow.value) {
        scrollToElement(`#page-verse-row${getFirstVerseRow.value}`)
    }
}

/**
 * inital header data
 */
watch(() => pageStore.getInitialHeaderData, (initHeaderData) => {
    if (initHeaderData) {
        headerData.value = initHeaderData
        emit('update:headerData', headerData.value)
    }
}, { once: true })
</script>

<template>
    <v-container fluid class="smooth-scroll-behaviour">
        <v-row :align="'center'" justify="center" dense v-for="(verses, chapterId) in groupVersesByChapter"
            :key="chapterId">
            <v-col cols="12">
                <title-buttons-component :grouped-translations-authors="groupedTranslationsAuthors"
                    :chapter-id="chapterId" :is-audio-player="isAudioPlaying"
                    @update:translations-drawer="translationsDrawer = $event"
                    @update:play-audio="$emit('update:playAudio', $event)"
                    :audio-src="`page-translations-${pageStore.selectedPage?.pageNumber}`">
                    <template #title>
                        <h2>{{ getChapterNameByChapterId(chapterId)?.nameArabic }}</h2>
                        <h3>{{ getChapterNameByChapterId(chapterId)?.bismillahPre ?
                            $tr.line("quranReader.textBismillah") : '' }}</h3>
                    </template>
                </title-buttons-component>
            </v-col>
            <v-col cols="12" class="mb-2" v-for="verse in verses" :key="verse.verse_key"
                :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
                :data-chapter-id="verse.chapter_id" :data-verse-number="verse.verse_number"
                :data-verse-key="verse.verse_key" :data-page-number="verse.page_number"
                :id="`verse-row${verse.verse_number}`" :data-intersecting="isIntersecting" v-intersect.quite="{
                    handler: onIntersect,
                    options: {
                        threshold: [0, 0.5, 1.0],
                    },
                }">
                <v-row :id="`page-verse-row${verse.verse_number}`">
                    <v-col cols="1" class="action-list" :order="$tr.rtl.value ? 2 : 1">
                        <buttons-action-list-component @update:play-audio="$emit('update:playAudio', $event)"
                            size="small" :is-audio-player="isAudioPlaying" :verse="verse"
                            @update:bookmarked="setBookmarked"
                            :audio-src="`page-translations-${pageStore.selectedPage?.pageNumber}`">
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
                                    <h3 :style="[defaultStyles, cssVars]" v-else> {{ word.text_uthmani }}
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
</style>