<script setup lang="ts">
import { ref, inject, watchEffect, nextTick, computed, watch, reactive } from "vue"
// stores
import { useJuzStore, useChapterStore } from "@/stores";
// components
import { TitleButtonsComponent, ButtonsActionListComponent } from "@/components/quran"
// utils
import { getFirstVerseNumberInJuz } from "@/utils/verse"
import { getChapterNameByChapterId } from "@/utils/chapter"
import { getChapterNameByJuzId } from "@/utils/juz"
// types
import type { JuzHeaderData, JuzVersesIntersecting } from "@/types/juz";
import type { VerseTimingsProps } from "@/types/audio";
import { _range } from "@/utils/number";

const juzStore = useJuzStore()
const { getChapterName } = useChapterStore()
const isIntersecting = ref(false)
const translationsDrawer = inject("translationDrawer")
const headerData = ref<JuzHeaderData | null>(null);
const intersectingJuzVerseNumber = ref<number>()
const intersectingChapterId = ref<number>()
const currentChapterId = ref<number>()

const defaultStyles = reactive({
  fontSize: "var(--quran-font-size-3)",
  fontFamily: "var(--quran-font-family-amiri)"
})

const props = defineProps<{
    isAudioPlaying: { audioID: number, isPlaying?: boolean, format?: string } | null;
    groupedTranslationsAuthors?: string;
    verseTiming: VerseTimingsProps
    audioExperience: { autoScroll: boolean, tooltip: boolean }
    cssVars?: Record<"fontSize" | "fontFamily", string>
    selectedJuzTab: string
}>()

const emit = defineEmits<{
    "update:playAudio": [value: { audioID: number, verseKey?: string }]
    "update:headerData": [value: JuzHeaderData | null]
    "update:manualIntersecting": [value: JuzVersesIntersecting]
    "update:activeJuzNumber": [value: number]
}>()

const getCurrentJuzNumber = computed((): number => {
    if (juzStore.selectedJuz) {
        return juzStore.selectedJuz.juz_number
    }
    return 0
})

// Manual Mode Scroll
const onIntersect = (intersecting: boolean, entries: any) => {
    isIntersecting.value = intersecting
    let newHeaderData: JuzHeaderData | null = null
    if (intersecting && props.selectedJuzTab === "translationsTab" && entries[0].intersectionRatio === 1) {
        // Verse Id is used here as key won't be efficient for scroll
        intersectingJuzVerseNumber.value = Number(entries[0].target.dataset.verseId)
        const chapterId: number = entries[0].target.dataset.chapterId
        intersectingChapterId.value = chapterId

        if (intersectingChapterId.value) {
            // emit header data
            newHeaderData = {
                left: getChapterNameByChapterId(chapterId) || null,
                right: {
                    pageNumber: entries[0].target.dataset.pageNumber,
                    hizbNumber: entries[0].target.dataset.hizbNumber,
                    juzNumber: getCurrentJuzNumber.value,
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

const setBookmarked = (verseNumber: number) => {
    juzStore.selectedJuz?.verses?.forEach((v) => {
        if (v.verse_number === verseNumber) v.bookmarked = true
        return
    })
}

// Highlight Active Words
const isWordHighlighted = (location: string, verseKey: string) => {
    if (props.verseTiming && props.selectedJuzTab === "translationsTab")
        return props.verseTiming.wordLocation === location && verseKey === props.verseTiming.verseKey
}

// watchers
// auto mode with verse timing and feed header data
watchEffect(() => {
    if (props.verseTiming.verseKey) {
        if (props.audioExperience.autoScroll) {
            const el = document.getElementById(`verse-word${props.verseTiming.verseKey}`)
            if (el) {
                let newHeaderData: JuzHeaderData | null = null
                const chapterId = el.getAttribute("data-chapter-id") || null
                newHeaderData = {
                    left: getChapterNameByJuzId(getCurrentJuzNumber.value, chapterId ? Number(chapterId) : 0),
                    right: {
                        pageNumber: el.getAttribute("data-page-number") || '',
                        hizbNumber: el.getAttribute("data-hizb-number") || '',
                        juzNumber: getCurrentJuzNumber.value,
                    }
                }

                // emit header Data
                if (newHeaderData !== headerData.value) {
                    headerData.value = newHeaderData
                    emit('update:headerData', headerData.value)
                }

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
        emit("update:activeJuzNumber", juzStore.selectedJuz.juz_number)
        // scroll to first verese row 
        const rowID = getFirstVerseNumberInJuz(juzStore.selectedJuz.verse_mapping)
        nextTick(() => {
            const el = document.querySelector(`#row${rowID}`)
            if (el) el.scrollIntoView({ behavior: "auto", block: "center" })
        })
    }
}

// Pagination
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
        emit("update:activeJuzNumber", juzStore.selectedJuz.juz_number)
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

// emitting header data on mounted so 
// access to dismiss the navigation menu is available
// will be done only once as it will be triggred from scroll source
watch(() => juzStore.getFirstVerseOfJuz, (newVal) => {
    if (newVal) {
        headerData.value = {
            left: getChapterNameByChapterId(newVal.chapter_id) || null,
            right: {
                pageNumber: newVal.page_number,
                hizbNumber: newVal.hizb_number,
                juzNumber: newVal.juz_number,
            },
        };
        // emit header Data
        currentChapterId.value = newVal.chapter_id
        emit("update:headerData", headerData.value);
    }

}, { once: true })

</script>

<template>
    <v-container fluid class="smooth-scroll-behaviour">
        <v-row :align="'center'" justify="center" dense v-for="(verses, key) in juzStore.juzVersesByChapterMap"
            :key="key" :id="`verse-row${key}`">
            <v-col cols="12">
                <title-buttons-component :chapter-id="Number(key)"
                    :grouped-translations-authors="groupedTranslationsAuthors" :is-audio-player="isAudioPlaying"
                    @update:translations-drawer="translationsDrawer = $event"
                    @update:play-audio="$emit('update:playAudio', $event)">
                    <template #title>
                        <h2>{{ getChapterName(key)?.ar }}</h2>
                        <h3>{{ getChapterName(key)?.bismillah ? $tr.line("quranReader.textBismillah") : '' }}</h3>
                    </template>
                </title-buttons-component>
            </v-col>
            <v-col cols="12" :id="`verse-col-${key}`">
                <v-row v-for="(verse, __index) in verses" :key="verse.verse_number"
                    :data-hizb-number="verse.hizb_number" :data-verse-number="verse.verse_number"
                    :id="`row${verse.verse_number}`" :data-verse-id="verse.id" :data-page-number="verse.page_number"
                    :data-verse-key="verse.verse_key" :data-chapter-id="verse.chapter_id"
                    :data-intersecting="isIntersecting" v-intersect="{
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
                        <v-list class="quran-translation-view" dense>
                            <v-list-item v-for="word in verse.words" :key="word.id" :id="`verse-word${verse.verse_key}`"
                                :data-hizb-number="verse.hizb_number" :data-verse-number="verse.verse_number"
                                class="item">
                                <v-list-item-title class="word" :id="`word-tooltip${word.id}`"
                                    :data-verse-key="verse.verse_key"
                                    :class="isWordHighlighted(word.location, word.verse_key) ? 'text-blue' : ''">
                                    <h3 :style="[defaultStyles, cssVars]">{{ word.text_uthmani }}
                                        <v-tooltip activator="parent" :target="`#target${word.id}`"
                                            v-if="audioExperience.tooltip"
                                            :model-value="isWordHighlighted(word.location, word.verse_key)"
                                            location="top center" origin="bottom center" :text="word.translation.text">
                                        </v-tooltip>
                                        <v-tooltip activator="parent" :target="`#target${word.id}`" v-else
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
                    <v-divider class="mb-3"></v-divider>
                </v-row>
            </v-col>
        </v-row>
        <v-row justify="center" :align="'center'">
            <!-- Prev -->
            <v-col cols="12" class="text-center" v-if="juzStore.selectedJuz && juzStore.selectedJuz.verses?.length">
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

:deep(.v-list-item--density-default:not(.v-list-item--nav).v-list-item--one-line) {
    padding-inline: 3px;
}
</style>