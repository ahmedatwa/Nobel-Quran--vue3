<script setup lang="ts">
import { ref, watchEffect, onMounted, computed } from "vue"
// stores
import { usePageStore } from "@/stores";
// types
import type { Pages } from "@/types";
import { scrollToElement } from "@/utils/useScrollToElement"

const pageStore = usePageStore()
const selectedPageNumber = ref(1)
const selectedVerseID = ref()

const getVersePagination = computed(() => {
    if (pageStore.selectedPage) {
        return pageStore.selectedPage.pagination
    }
})
const emit = defineEmits<{
    "update:selectedVerseKeyView": [value: string]
}>()

const props = defineProps<{
    intersectingPageVerseNumber?: number
    activePageNumber?: number
}>()

const getSelected = async (page: Pages) => {
    pageStore.selectedPage = page
    selectedPageNumber.value = page.pageNumber
}

/**
 * on Mouse enter fetch the verse if it doesn't fall with the range
 * given by verses length 
 * or fetch the chapter which help to minimize api calls
 */
const mouseEnter = async (page: Pages) => {
    if (!page.verses.length) {
        await pageStore.getVerses(page.pageNumber, false)
    }
}

/**
 * watch the verse number when 
 * user scroll the translations View manually 
 * receive the verse number to define the column 
 * scroll into the verse number in verse list 
 * fetch the verse by key so we don't count on pagniation received from quran api 
 * duplicate verses will be handeled by the chapter store
*/
watchEffect(async () => {
    if (props.intersectingPageVerseNumber) {
        selectedVerseID.value = props.intersectingPageVerseNumber
        if (pageStore.selectedPage) {
            // return if end of verses count
            if (pageStore.selectedPage.pagination?.total_records === pageStore.selectedPage.verses?.length) {
                return
            }

            if (pageStore.selectedPage.verses) {
                if (selectedVerseID.value === pageStore.selectedPage.verses.length - 3 ||
                    selectedVerseID.value === pageStore.selectedPage.verses.length) {
                        await pageStore.getVerses(selectedPageNumber.value, true, getVersePagination.value?.next_page)
                }
            }

        }
    }
})

onMounted(async () => {
    if (!pageStore.selectedPage) {
        if (pageStore.pages) {
            pageStore.selectedPage = pageStore.pages[0]
            selectedPageNumber.value = pageStore.selectedPage?.pageNumber
            selectedVerseID.value = 1
            if (!pageStore.selectedPage?.verses?.length) {
                await pageStore.getVerses(1, true)
            }
            scrollToElement(`#page${props.activePageNumber}`)
        }
    } else {
        selectedPageNumber.value = pageStore.selectedPage.pageNumber
    }
})

/**
 * if Juz has beeen changed with next/prev Juz buttons
 * scroll to the Page Number 
 */
watchEffect(() => {
    if (props.activePageNumber) {
        selectedPageNumber.value = props.activePageNumber
        scrollToElement(`#page${props.activePageNumber}`)
    }
})
</script>
<template>
    <v-card>
        <v-card-title>
            <v-text-field prepend-inner-icon="mdi-magnify" class="mt-3 mx-2" v-model="pageStore.searchValue"
                hide-details variant="outlined" density="compact" :label="$tr.line('PageNav.searchPages')"></v-text-field>
        </v-card-title>
        <v-sheet height="600" style="overflow: scroll; ">
            <v-list class="text-center">
                <v-list-item v-for="page in pageStore.pages" :key="page.pageNumber" @click="getSelected(page)"
                    :active="selectedPageNumber === page.pageNumber" @mouseenter="mouseEnter(page)"
                    :id="`page${page.pageNumber}`">
                    {{ $tr.line('PageNav.textPage') }} {{ page.pageNumber }}</v-list-item>
            </v-list>
        </v-sheet>
    </v-card>
</template>