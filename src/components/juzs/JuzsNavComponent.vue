<script setup lang="ts">
import { onBeforeMount, ref, watchEffect, computed } from "vue"
// stores
import { useJuzStore } from "@/stores";
// types
import type { Juz, JuzVersesIntersecting } from "@/types/juz"
import { scrollToElement } from "@/utils/useScrollToElement"

// Stores
const juzStore = useJuzStore()
const selectedId = ref(1)
const selectedVerseID = ref(1)

const selectedJuzVersesCount = computed(() => {
    if (juzStore.selectedJuz) {
        return juzStore.selectedJuz.verses_count
    }
})
const getVersePagination = computed(() => {
    const isFound = juzStore.juzList.find((j) => j.juz_number === selectedId.value)
    if (isFound) {
        return isFound.pagination
    }
})
const emit = defineEmits<{
    "update:selectedVerseKeyView": [value: string]
}>()

const props = defineProps<{
    manualIntersecting?: JuzVersesIntersecting
    activeJuzNumber?: number
}>()

onBeforeMount(async () => {
    if (!juzStore.selectedJuz) {
        juzStore.selectedJuz = juzStore.juzList[0]
        selectedId.value = juzStore.selectedJuz.id
        selectedVerseID.value = 1
        if (!juzStore.selectedJuz?.verses?.length) {
            await juzStore.getVerses(1, true)
        }
        scrollToElement(`#juz${props.activeJuzNumber}`)
    } else {
        selectedId.value = juzStore.selectedJuz.juz_number
    }
})

watchEffect(() => {
    if (selectedId.value) {
        const el = document.getElementById(`juz${selectedId.value}`)
        if (el) {
            setTimeout(() => {
                el.scrollIntoView(true)
            }, 600);
        }
    }
})

const getSelected = (juz: Juz) => {
    juzStore.selectedJuz = juz
    selectedId.value = juz.id
}

/**
 * on Mouse enter fetch the 10 verses from Juz
 */
const mouseEnter = async (juzNumber: number) => {
    const found = juzStore.juzList.find((j) => j.juz_number === juzNumber)
    if (found) {
        if (!found.verses?.length) {
            await juzStore.getVerses(juzNumber, false, 1)
        }
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
    if (props.manualIntersecting) {
        const intersectingData = props.manualIntersecting
        selectedVerseID.value = intersectingData.currentVerseNumber

        // return if end of verses count
        if (selectedJuzVersesCount.value === intersectingData.lastVerseNumber) {
            juzStore.isLoading = false
            return
        }

        // Load More Verses
        if (
            intersectingData.currentVerseNumber ===
            intersectingData.lastVerseNumber ||
            intersectingData.currentVerseNumber ===
            intersectingData.lastVerseNumber - 5
        ) {
            if (getVersePagination.value) {
                await juzStore.getVerses(selectedId.value, true, getVersePagination.value.next_page)
            }
        }
    }

})

/**
 * if Juz has beeen changed with next/prev Juz buttons
 * scroll to the Juz Number 
 */
watchEffect(() => {
    if (props.activeJuzNumber) {
        selectedId.value = props.activeJuzNumber
        scrollToElement(`#juz${props.activeJuzNumber}`)
    }
})


</script>
<template>
    <v-card>
        <v-card-title>
            <v-text-field prepend-inner-icon="mdi-magnify" class="mt-3 mx-2" v-model="juzStore.searchValue" hide-details
                variant="outlined" density="compact" :label="$tr.line('PageNav.searchJuz')"></v-text-field>
        </v-card-title>
        <v-sheet height="600" style="overflow: scroll; ">
            <v-list class="text-center">
                <v-list-item v-for="juz in juzStore.juzs" :key="juz.id" @click="getSelected(juz)"
                    :active="selectedId === juz.juz_number" :id="`juz${juz.juz_number}`"
                    @mouseenter="mouseEnter(juz.juz_number)">
                    {{ $tr.line('PageNav.textJuz') }} {{ juz.juz_number }}
                </v-list-item>
            </v-list>
        </v-sheet>
    </v-card>
</template>