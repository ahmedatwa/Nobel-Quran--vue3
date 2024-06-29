<script setup lang="ts">
import { onBeforeMount, ref, watchEffect } from "vue"
import { getStorage, setStorage } from "@/utils/storage"
import { useJuzStore } from "@/stores";
import type { Juz } from "@/types"

// Stores
const juzStore = useJuzStore()
const selectedId = ref(1)
const selectedVerseID = ref(1)

const emit = defineEmits<{
    "update:selectedVerseKeyView": [value: string]
}>()

const props = defineProps<{
    intersectingVerseNumber?: number
}>()

onBeforeMount(async () => {
    const storage = getStorage("juz", sessionStorage)

    if (storage) {
        juzStore.selectedJuz = storage.data
        selectedId.value = storage.data.id
    } else {
        if (!juzStore.selectedJuz) {
            juzStore.selectedJuz = juzStore.juzList[1]
            await juzStore.getVerses(1, true)

        }
    }
})

watchEffect(() => {
    if (selectedId.value) {
        const el = document.getElementById(`juz${selectedId.value}`)
        if (el) {
            setTimeout(() => {
                el.scrollIntoView(true) 
            }, 800);
        }
    }
})

const getSelected = async (juz: Juz) => {
    juzStore.selectedJuz = juz
    selectedId.value = juz.id
    if (!juzStore.selectedJuz.verses?.length) {
        await juzStore.getVerses(juz.id, true)
    } else {
        return
    }
    setStorage("juz", { data: juz }, sessionStorage)
}

/**
 * on Mouse enter fetch the verse if it doesn't fall with the range
 * given by verses length 
 * or fetch the chapter which help to minimize api calls
 */
const mouseEnter = async (juzNumber: number) => {
    await juzStore.getVerses(juzNumber, false)
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
    if (props.intersectingVerseNumber) {
        selectedVerseID.value = props.intersectingVerseNumber
        if (juzStore.selectedJuz?.pagination?.next_page) {
            // await juzStore.getVerses(selectedId.value, true, juzStore.selectedJuz?.pagination?.next_page)
        }
    }
})

</script>
<template>
    <v-card>
        <v-card-title>
            <v-text-field prepend-inner-icon="mdi-magnify" class="mt-3 mx-2" v-model="juzStore.searchValue" hide-details
                variant="outlined" density="compact"></v-text-field>
        </v-card-title>
        <v-sheet height="600" style="overflow: scroll; ">
            <v-list class="text-center">
                <v-list-item v-for="juz in juzStore.juzs" :key="juz.id" @click="getSelected(juz)"
                    :active="selectedId === juz.juz_number" :title="`Juz ${juz.juz_number}`"
                    :id="`juz${juz.juz_number}`" @mouseenter="mouseEnter(juz.juz_number)">
                </v-list-item>
            </v-list>
        </v-sheet>
    </v-card>
</template>