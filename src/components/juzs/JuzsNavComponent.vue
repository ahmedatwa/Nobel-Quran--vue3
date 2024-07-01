<script setup lang="ts">
import { onBeforeMount, ref, watchEffect } from "vue"
// utils
import { getStorage, setStorage } from "@/utils/storage"
// stores
import { useJuzStore } from "@/stores";
// types
import type { Juz } from "@/types/juz"

// Stores
const juzStore = useJuzStore()
const selectedId = ref(1)
const selectedVerseID = ref(1)

const emit = defineEmits<{
    "update:selectedVerseKeyView": [value: string]
}>()

const props = defineProps<{
    intersectingJuzVerseNumber?: number
    activejuz_number?: number
}>()

onBeforeMount(async () => {
    const storage = getStorage("juz")

    if (storage) {
        juzStore.selectedJuz = storage.data
        selectedId.value = storage.data.id
        if (!juzStore.selectedJuz?.verses) {
            juzStore.selectedJuz = juzStore.juzList[1]
            await juzStore.getVerses(1, true)
        }
    } else {
        if (!juzStore.selectedJuz?.verses?.length) {
            juzStore.selectedJuz = juzStore.juzList[1]
            await juzStore.getVerses(1, true)
        }
        juzStore.selectedJuz = juzStore.juzList[0]
        selectedId.value = 1
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

const getSelected = async (juz: Juz) => {
    juzStore.selectedJuz = juz
    selectedId.value = juz.id
    setStorage("juz", { data: juz })
}

/**
 * on Mouse enter fetch the verse if it doesn't fall with the range
 * given by verses length 
 * or fetch the chapter which help to minimize api calls
 */
const mouseEnter = async (juz_number: number) => {
    const found = juzStore.juzList.find((j) => j.juz_number === juz_number)
    if (found) {
        if (!found.verses?.length) {
            await juzStore.getVerses(juz_number, false)
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
    if (props.intersectingJuzVerseNumber) {
        console.log(props.intersectingJuzVerseNumber);
        
        selectedVerseID.value = props.intersectingJuzVerseNumber
        if (juzStore.selectedJuz) {
            // return if end of verses count
            if (juzStore.selectedJuz.verses_count === juzStore.selectedJuz.verses?.length) {
                return
            }

            if (juzStore.selectedJuz.verses) {
                if (props.intersectingJuzVerseNumber === juzStore.selectedJuz.verses.length - 3 || 
                    props.intersectingJuzVerseNumber === juzStore.selectedJuz.verses.length) {
                    if (juzStore.selectedJuz?.pagination?.next_page) {
                        await juzStore.getVerses(selectedId.value, true, juzStore.selectedJuz?.pagination?.next_page)
                    }
                }
            }

        }
    }
})

/**
 * if Juz has beeen changed with buttons
 * scroll to the Juz Number 
 */
watchEffect(() => {
    if (props.activejuz_number) {
        selectedId.value = props.activejuz_number
        const el = document.querySelector(`#juz${props.activejuz_number}`)
        if (el) el.scrollIntoView(true)
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
                    :active="selectedId === juz.juz_number" :title="`Juz ${juz.juz_number}`" :id="`juz${juz.juz_number}`"
                    @mouseenter="mouseEnter(juz.juz_number)">
                </v-list-item>
            </v-list>
        </v-sheet>
    </v-card>
</template>