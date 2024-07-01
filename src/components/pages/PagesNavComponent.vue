<script setup lang="ts">
import { ref } from "vue"
// stores
import { usePageStore } from "@/stores";
// types
import type { Pages } from "@/types";
// utils
import { setStorage } from "@/utils/storage";

const pageStore = usePageStore()
const selected = ref(1)
const searchValue = ref("")

const getSelected = async (page: Pages) => {
    pageStore.selectedPage = page
    selected.value = page.pageNumber
    setStorage("page", { data: page })
    if (!page.verses.length) {
        await pageStore.getVerses(page.pageNumber, true)
    } else {
        return
    }
}

/**
 * on Mouse enter fetch the verse if it doesn't fall with the range
 * given by verses length 
 * or fetch the chapter which help to minimize api calls
 */
const mouseEnter = async (page: Pages) => {
    console.log(page);
    
    if (!page.verses.length) {
        await pageStore.getVerses(page.pageNumber, false)
    }
}


</script>
<template>
    <v-card>
        <v-card-title>
            <v-text-field prepend-inner-icon="mdi-magnify" class="mt-3 mx-2" v-model="searchValue" hide-details
                variant="outlined" density="compact"></v-text-field>
        </v-card-title>
        <v-sheet height="600" style="overflow: scroll; ">
            <v-list class="text-center">
                <v-list-item v-for="page in pageStore.pageList" :key="page.pageNumber" @click="getSelected(page)"
                    :active="selected === page.pageNumber" @mouseenter="mouseEnter(page)">
                    {{ $tr.line('PageNav.textPage') }} {{ page.pageNumber }}</v-list-item>
            </v-list>
        </v-sheet>
    </v-card>
</template>