<script setup lang="ts">
import { ref } from "vue"
import { usePageStore } from "@/stores";
import { useStorage, StorageSerializers } from '@vueuse/core'

const pageStore = usePageStore()
const selected = ref(1)
const searchValue = ref("")
const storageState = useStorage('selected', null, undefined, { serializer: StorageSerializers.object })

const getSelected = async (page: number) => {
    pageStore.selectedPage = page
    selected.value = page
    storageState.value = null
    storageState.value = { tab: "juz", value: { page } }
    if (pageStore) {
        if (pageStore.verses?.length === 0) {
            await pageStore.getVerses(juz.id, true)
        } else {
            return
        }
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
                <v-list-item v-for="n in pageStore.pages" :key="n" @click="getSelected(n)" :active="selected === n">
                    {{ $tr.line('PageNav.textPage') }} {{ n }}</v-list-item>
            </v-list>
        </v-sheet>
    </v-card>
</template>