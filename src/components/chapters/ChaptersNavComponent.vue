<script setup lang="ts">
import { ref, computed, nextTick, onBeforeMount, watchEffect } from "vue";
import { useSurahStore } from "@/stores";
import type { Chapter } from "@/types";
import { getStorage, setStorage } from "@/utils/storage";
import { _range, localizeNumber } from "@/utils/number"

// Stores
const surahStore = useSurahStore()
const selectedVerseID = ref(1)
const selectedChapterId = ref()
const searchValue = ref("")

const emit = defineEmits<{
    "update:selectedVerseKeyView": [value: string]
}>()

const props = defineProps<{
    intersectingVerseNumber?: number
}>()

onBeforeMount(async () => {
    if (surahStore.selectedSurah) {
        selectedChapterId.value = surahStore.selectedSurah.id
        selectedVerseID.value = 1
    }

    const storage = getStorage("chapter", sessionStorage)
    if (storage) {
        surahStore.selectedSurah = storage.data
        selectedChapterId.value = storage.data.id
        selectedVerseID.value = storage.verse
    }
})

watchEffect(() => {
    if (selectedChapterId.value) {
        scroll(`chapter-${selectedChapterId.value}`, 800)
    }
})

/**
 * creates range from verse count
 */
const versesCount = computed(() => {
    if (surahStore.selectedSurah) {
        return _range(surahStore.selectedSurah.verses_count, 1)
    }
})

const getSelectedSurah = async (chapter: Chapter) => {
    surahStore.selectedSurah = chapter
    selectedChapterId.value = chapter.id
    selectedVerseID.value = 1
    setStorage("chapter", { data: chapter, verse: selectedVerseID.value }, sessionStorage)

    if (surahStore.selectedSurah.verses?.length < 10) {
        await surahStore.getVerses(chapter.id, true)
    } else {
        return
    }

}

const getSelectedVerse = async (id: number) => {
    selectedVerseID.value = id
    emit('update:selectedVerseKeyView', `${selectedChapterId.value}:${id}`)
    setStorage("chapter", { data: surahStore.selectedSurah, verse: selectedVerseID.value }, sessionStorage)
}

/**
 * watch the verse number when 
 * user scroll the translations View manually 
 * receive the verse number to define the column 
 * scroll into the verse number in verse list 
 * fetch the verse by key so we don't count on pagniation received from quran api 
 * duplicate verses will be handeled by the chapter store
*/
watchEffect(() => {
    if (props.intersectingVerseNumber) {
        selectedVerseID.value = props.intersectingVerseNumber
        nextTick(async () => {
            scroll(`verse-${props.intersectingVerseNumber}`)
            if (surahStore.selectedSurah?.verses_count === surahStore.selectedSurah?.verses.length) {
                return
            } else {
                await getVerseByKey(`${selectedChapterId.value}:${selectedVerseID.value + 2}`)
            }

        })
    }
})


/**
 * on Mouse enter fetch the verse if it doesn't fall with the range
 * given by verses length 
 * or fetch the chapter which help to minimize api calls
 */
const mouseEnter = async (k: string, v: number) => {
    if (k === 'chapter') {
        await surahStore.getVerses(v, false)
    } else {
        const verseKey = `${selectedChapterId.value}:${v}`
        const verseInRange = surahStore.isVerseKeyWithinRanges(verseKey, surahStore.versesKeyMap)
        if (!verseInRange) {
            await getVerseByKey(verseKey)
        }
    }
}

const getVerseByKey = async (verseKey: string) => {
    if (surahStore.selectedSurah) {
        const verse = surahStore.selectedSurah.verses.find((cv) => cv.verse_key === verseKey)
        if (verse === undefined) {
            await surahStore.getVerseByKey(selectedChapterId.value, verseKey)
        }
    }
}

const scroll = (elID: string, timeout?: number) => {
    const el = document.getElementById(elID)
    if (el) {
        nextTick(() => {
            setTimeout(() => {
                el.scrollIntoView(true)
            }, timeout ?? 200);
        })
    }
}
</script>
<template>
    <v-row no-gutters dense>
        <v-col cols="7">
            <v-card density="compact" flat>
                <v-card-title>
                    <v-text-field v-model="surahStore.searchValue" hide-details variant="filled" density="compact"
                        :label="$tr.line('surahNav.textChapters')"></v-text-field>
                </v-card-title>
                <v-divider></v-divider>
                <v-sheet height="650" class="overflow-y-auto">
                    <v-skeleton-loader type="list-item" v-for="n in 114" :key="n"
                        v-if="surahStore.isLoading.chapters"></v-skeleton-loader>
                    <v-list lines="two" class="mb-5">
                        <v-list-item v-for="chapter in surahStore.surahs" :key="chapter.id" :value="chapter.name_simple"
                            :active="selectedChapterId === chapter.id" @click="getSelectedSurah(chapter)"
                            :id="`chapter-${chapter.id}`" @mouseenter="mouseEnter('chapter', chapter.id)"
                            :data-chapter-id="chapter.id">
                            <template #title>
                                <span v-if="$tr.rtl.value">{{ localizeNumber(chapter.id, $tr.locale.value) }}- {{
                                    chapter.name_arabic }}</span>
                                <span v-else>{{ chapter.id }}- {{ chapter.name_simple }}</span>
                            </template>
                        </v-list-item>
                    </v-list>
                </v-sheet>
            </v-card>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col cols="5">
            <v-card density="compact" flat>
                <v-card-title>
                    <v-text-field v-model="searchValue" hide-details density="compact"
                        :label="$tr.line('surahNav.textVerses')" variant="filled"></v-text-field>
                </v-card-title>
                <v-divider></v-divider>
                <v-sheet height="650" class="overflow-y-auto">
                    <v-skeleton-loader type="list-item" v-for="n in surahStore.selectedSurah?.verses_count" :key="n"
                        v-if="surahStore.isLoading.verses"></v-skeleton-loader>
                    <v-list class="mb-5">
                        <v-list-item v-for="n in versesCount" :key="n" :value="n" class="text-center"
                            :title="localizeNumber(n, $tr.locale.value)" @click="getSelectedVerse(n)"
                            :active="selectedVerseID === n" :id="`verse-${n}`" :data-verse-number="n"
                            @mouseenter="mouseEnter('verse', n)">
                        </v-list-item>
                    </v-list>
                </v-sheet>
            </v-card>
        </v-col>
    </v-row>
</template>
<style scoped></style>