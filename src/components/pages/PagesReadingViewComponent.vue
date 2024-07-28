<script setup lang="ts">
import { ref, computed, inject, watchEffect } from "vue";
import { nextTick, reactive, watch } from "vue";
import { useDisplay } from "vuetify";
// stores
import { useChapterStore, usePageStore } from "@/stores";
// components
import { TitleButtonsComponent } from "@/components/quran"
// types
import type { PageHeaderData } from "@/types/page"
import { VerseTimingsProps, PlayAudioEmit } from "@/types/audio";

// utils
import { scrollToElement, isInViewport, SMOOTH_SCROLL_TO_CENTER } from "@/utils/useScrollToElement"
import { DEFAULT_NUMBER_OF_PAGES } from "@/utils/pages"


const pageStore = usePageStore()
const { mobile } = useDisplay()
const { getChapterNameByChapterId } = useChapterStore()
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

const defaultStyles = reactive({
    fontSize: "var(--quran-font-size-3)",
    fontFamily: "var(--quran-font-family-noto-kufi)"
})

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit]
    "update:headerData": [value: PageHeaderData]
    "update:intersectingPageVerseNumber": [value: number]
    "update:activePageNumber": [value: number]
}>()

const props = defineProps<{
    isAudioPlaying: { audioID: number, isPlaying?: boolean, format?: string } | null;
    groupedTranslationsAuthors?: string;
    audioExperience: { autoScroll: boolean; tooltip: boolean };
    verseTiming?: VerseTimingsProps;
    cssVars?: Record<"fontSize" | "fontFamily", string>
}>()

// Highlight Active Words
const isWordHighlighted = (location: string, verseKey: string) => {
    if (props.verseTiming)
        return props.verseTiming.wordLocation === location && verseKey === props.verseTiming.verseKey
}

const getLastVerseNumberOfPage = computed(() => {
    if (pageStore.selectedPage) {
        const verse = pageStore.selectedPage.verses.slice(-1)[0];
        if (verse) {
            return verse.verse_number;
        }
    }
    return 0;
})

const onIntersect = async (intersecting: boolean, entries: any) => {
    isIntersecting.value = intersecting
    let newHeaderData: PageHeaderData | null = null
    if (intersecting && entries[0].intersectionRatio === 1) {
        const target = entries[0].target as HTMLDivElement

        if (target) {
            const chapterId = Number(target.dataset.chapterId)
            // emit header data
            newHeaderData = {
                left: getChapterNameByChapterId(chapterId),
                right: {
                    pageNumber: pageStore.selectedPage?.pageNumber || "",
                    hizbNumber: target.dataset.hizbNumber || "",
                    juzNumber: target.dataset.juzNumber || "",
                },
            };

            if (newHeaderData !== headerData.value) {
                headerData.value = newHeaderData
                // emit header Data
                emit("update:headerData", headerData.value)
            }
            if (entries[0].intersectionRatio === 0.5) {
                intersectingPageVerseNumber.value = Number(target.dataset.verseNumber)
                // emit verse id for scroll in verses list 
                // help to fetch new verses 
                emit('update:intersectingPageVerseNumber', intersectingPageVerseNumber.value)

            }
        }
    }
}

// auto mode with verse timing and feed header data
watchEffect(async () => {
    if (props.audioExperience.autoScroll) {
        const currentVerseNumber = props.verseTiming?.verseNumber
        const lastVerseNumber = getLastVerseNumberOfPage.value

        if (props.isAudioPlaying?.isPlaying && currentVerseNumber) {
            // fetch more Verses
            if (currentVerseNumber === lastVerseNumber || currentVerseNumber >= lastVerseNumber - 5) {
                if (pageStore.selectedPage?.pagination?.next_page) {
                    await pageStore.getVerses(pageStore.selectedPage.pageNumber, true, pageStore.selectedPage.pagination.next_page)
                }
            }
            // Scroll into View
            const verseElement = `#line-${currentVerseNumber}`
            if (verseElement) {
                if (currentVerseNumber !== intersectingPageVerseNumber.value) {

                    if (mobile.value) {
                        scroll(verseElement)
                    } else {
                        scroll(verseElement)
                    }
                }
            }
        }
    }
});

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
                scroll(`#line-${getFirstVerseRow.value}`)
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
                scroll(`#line-${getFirstVerseRow.value}`)
            })
        }
    }
}

const getStartOfPage = () => {
    if (getFirstVerseRow.value) {
        scroll(`#line-${getFirstVerseRow.value}`)
    }
}

/**
 * inital header data
 */
watch(() => pageStore.getInitialHeaderData, (newHeaderData) => {
    if (newHeaderData) {
        headerData.value = newHeaderData
        emit('update:headerData', headerData.value)
    }
}, { once: true })

// commit scroll to verse
const scroll = (el: string) => {
    const element = document.querySelector(el) as HTMLElement
    if (isInViewport(element)) {
        return;
    } else {
        if (mobile.value) {
            scrollToElement(el, 20, SMOOTH_SCROLL_TO_CENTER, 120)
        } else {
            scrollToElement(el)
        }
    }
}
</script>

<template>
    <v-container class="smooth-scroll-behaviour">
        <v-row justify="center" :align="'center'" no-gutters>
            <v-card class="quran-reader-container" width="auto" flat>
                <v-card-text>
                    <v-container>
                        <v-row v-for="(verses, chapterId) in groupVersesByChapter" :key="chapterId"
                            :data-chapter-id="chapterId" class="verse-row" no-gutters justify="center" :align="'start'">
                            <v-col cols="12">
                                <title-buttons-component :grouped-translations-authors="groupedTranslationsAuthors"
                                    :chapter-id="chapterId" :is-audio-player="isAudioPlaying"
                                    :audio-src="`page-reading-${pageStore.selectedPage?.pageNumber}`"
                                    @update:translations-drawer="translationsDrawer = $event"
                                    @update:play-audio="$emit('update:playAudio', $event)">
                                    <template #title>
                                        <h2>{{ getChapterNameByChapterId(chapterId)?.nameArabic }}</h2>
                                        <h3>{{ getChapterNameByChapterId(chapterId)?.bismillahPre ?
                                            $tr.line("quranReader.textBismillah") : '' }}</h3>
                                    </template>
                                </title-buttons-component>
                            </v-col>
                            <v-col class="verse-col" :id="`row-${chapterId}`" cols="10">
                                <div class="reading-view-word-wrapper" v-for="verse in verses" :key="verse.id"
                                    :id="`line-${verse.verse_number}`" :data-hizb-number="verse.hizb_number"
                                    :data-chapter-id="verse.chapter_id" :data-juz-number="verse.juz_number"
                                    :data-verse-number="verse.verse_number" v-intersect.quite="{
                                        handler: onIntersect,
                                        options: {
                                            threshold: [0, 0.5, 1.0],
                                        },
                                    }">
                                    <h3 class="d-flex flex-wrap d-inline-flex" v-for="word in verse.words"
                                        :key="word.id" :data-word-position="word.position"
                                        :data-hizb-number="verse.hizb_number" :style="[defaultStyles, cssVars]"
                                        :data-juz-number="verse.juz_number" :data-chapter-id="verse.chapter_id">
                                        <div :class="isWordHighlighted(word.position, word.verse_key)
                                            ? 'text-blue'
                                            : ''
                                            " class="word">
                                            <div v-if="word.char_type_name === 'end'">
                                                ({{ word.text_uthmani }})
                                            </div>
                                            <div :style="[defaultStyles, cssVars]" v-else>{{ word.text_uthmani }}</div>
                                        </div>
                                    </h3>
                                </div>
                            </v-col>
                        </v-row>
                        <v-row justify="center" :align="'center'">
                            <!-- Prev -->
                            <v-col cols="12" class="text-center"
                                v-if="pageStore.selectedPage && pageStore.selectedPage.verses.length">
                                <v-btn v-if="pageStore.selectedPage?.pageNumber > 1"
                                    prepend-icon="mdi-arrow-left-bottom" class="me-2" variant="outlined"
                                    @click="getPrevPage">{{
                                        $tr.line('quranReader.prevPage') }}</v-btn>
                                <!-- up -->
                                <v-btn prepend-icon="mdi-arrow-up-right" variant="outlined" class="me-2"
                                    @click="getStartOfPage">{{
                                        $tr.line('quranReader.startPage') }}</v-btn>
                                <!-- Next -->
                                <v-btn v-if="pageStore.selectedPage?.pageNumber <= DEFAULT_NUMBER_OF_PAGES"
                                    prepend-icon="mdi-arrow-right-bottom" class="me-2" variant="outlined"
                                    @click="getNextPage">{{
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
    font-size: v-bind("props.cssVars?.fontSize");
    font-family: v-bind("props.cssVars?.fontFamily");
}
</style>