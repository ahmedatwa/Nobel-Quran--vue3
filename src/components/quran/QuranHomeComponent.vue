<script setup lang="ts">
import { useSurahStore, useJuzStore, usePageStore } from "@/stores";
import type { Chapter, Juz } from "@/types"
import { setStorage } from "@/utils/storage";

// Stores
const surahStore = useSurahStore()
const juzStore = useJuzStore()
const pageStore = usePageStore()

defineProps<{
    modelValue: string
}>()

const emit = defineEmits<{
    "update:modelValue": [value: string]
    "update:isLoading": [value: boolean]
    "updateSelected": [value: Chapter | Juz | number]
}>()


const getSelected = (key: string, value: number) => {
    if (key === "chapter") {
        emit("update:isLoading", true)
        const chapter = surahStore.surahList.find((s) => s.id === value)
        if(chapter) surahStore.selectedSurah = chapter
        emit("updateSelected", chapter as Chapter)
        setStorage("chapter", { data: chapter, verse: 1 }, sessionStorage)
    } else if (key === "juz") {
        const juz = juzStore.juzList.find((j) => j.juz_number === value)
        if(juz) juzStore.selectedJuz = juz
        emit("updateSelected", juz as Juz)
        setStorage("juz", { data: juz }, sessionStorage)
    } else {
        // Page
        const page = pageStore.selectedPage.find((p) => p.id === value)
        if(page) pageStore.selectedPage = page
        emit("updateSelected", value as number)
        setStorage("page", { data: page }, sessionStorage)
    }
}

const mouseEnter = async (key: string, value: number) => {
    switch (key) {
        case "chapter":
            await surahStore.getVerses(value, false)
            break;
        case "juz":
            await juzStore.getVerses(value, false)
            break;
        case "page":
            await pageStore.getVerses(value, false)
            break;
    }
}
</script>
<template>
    <v-container>
        <v-row>
            <v-col cols="12" class="my-4">

            </v-col>
            <v-col cols="12">
                <v-tabs :model-value="modelValue" align-tabs="center" color="primary"
                    @update:model-value="$emit('update:modelValue', $event as string)" grow>
                    <v-tab value="surah" @click="surahStore.currentSort = 'id'">{{ $tr.line('home.textSurah') }}</v-tab>
                    <v-tab value="juz">{{ $tr.line('home.textJuz') }}</v-tab>
                    <v-tab value="page">{{ $tr.line('home.textPage') }}</v-tab>
                    <v-tab value="relevation" @click="surahStore.currentSort = 'revelation_order'">
                        {{ $tr.line('home.textRelevation') }}</v-tab>
                </v-tabs>
                <v-tabs-window :model-value="modelValue">
                    <v-tabs-window-item value="surah">
                        <v-container>
                            <v-row>
                                <v-col cols="12" class="mb-4">
                                    <v-text-field :label="$tr.line('home.inputSearch')" prepend-inner-icon="mdi-magnify"
                                        v-model="surahStore.searchValue" color="blue-lighten-3" hide-details>
                                        <template #append>
                                            <v-btn v-tooltip="$tr.line('buttonSort')"
                                                :icon="surahStore.currentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                                                variant="text" @click="surahStore.sort('id')" color="primary"></v-btn>
                                        </template>
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row v-if="!surahStore.surahs?.length">
                                <v-col cols="4" v-for="n in 114" :key="n">
                                    <v-skeleton-loader type="image"></v-skeleton-loader>
                                </v-col>
                            </v-row>
                            <v-row dense v-else>
                                <v-col v-for="chapter in surahStore.surahs" :key="chapter.id" cols="4">
                                    <v-card :data-id="chapter.id" @click="getSelected('chapter', chapter.id)"
                                        :border="true" @mouseenter="mouseEnter('chapter', chapter.id)">
                                        <v-card-text>
                                            <div class="d-flex">
                                                <v-chip color="primary">{{ chapter.id }}</v-chip>
                                                <span class="ms-2 d-flex" style="flex-direction: column;">
                                                    {{ chapter.name_simple }}
                                                    <small class="text-body-2">
                                                        {{ chapter.translated_name.name }}</small>
                                                </span>
                                                <div class="ms-auto">
                                                    <div class="d-flex" style="flex-direction: column;">
                                                        <span>{{ chapter.name_arabic }}</span>
                                                        <br />
                                                        <small>{{ chapter.verses_count }} {{ $tr.line('home.textAyah')
                                                            }}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-tabs-window-item>
                    <!-- Juz -->
                    <v-tabs-window-item value="juz">
                        <v-container>
                            <v-row>
                                <v-col cols="12" class="mb-4">
                                    <v-text-field :label="$tr.line('home.inputSearch')" prepend-inner-icon="mdi-magnify"
                                        v-model="juzStore.searchValue" color="blue-lighten-3" hide-details>
                                        <template #append>
                                            <v-btn v-tooltip="$tr.line('home.buttonSort')"
                                                :icon="juzStore.currentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                                                variant="text" @click="juzStore.sort('id')" color="primary"></v-btn>
                                        </template>
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row v-if="!juzStore.juzs?.length">
                                <v-col cols="4" v-for="n in 114" :key="n">
                                    <v-skeleton-loader type="image"></v-skeleton-loader>
                                </v-col>
                            </v-row>
                            <v-row dense v-else>
                                <v-col v-for="juz in juzStore.juzs" :key="juz.id" cols="4">
                                    <v-card :data-id="juz.id" @click="getSelected('juz', juz.juz_number)" :border="true"
                                        @mouseenter="mouseEnter('juz', juz.id)">
                                        <v-sheet class="d-flex ma-2">
                                            <span class="me-auto">{{ $tr.line("home.textJuz") }} {{ juz.juz_number
                                                }}</span>
                                            <span class="text-caption">{{ juz.verses_count }} {{
                                                $tr.line('home.textVerse')
                                            }}</span>
                                        </v-sheet>
                                        <v-card-text>
                                            <div class="d-flex">
                                                <v-card></v-card>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-tabs-window-item>
                    <!-- Page -->
                    <v-tabs-window-item value="page">
                        <v-container>
                            <v-row>
                                <v-col cols="12" class="mb-4">
                                    <v-text-field :label="$tr.line('home.inputSearch')" prepend-inner-icon="mdi-magnify"
                                        v-model="pageStore.searchValue" color="blue-lighten-3" hide-details>
                                        <template #append>
                                            <v-btn v-tooltip="$tr.line('home.buttonSort')"
                                                :icon="juzStore.currentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                                                variant="text" @click="juzStore.sort('id')" color="primary"></v-btn>
                                        </template>
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row v-if="!pageStore.pages?.length">
                                <v-col cols="4" v-for="n in 604" :key="n">
                                    <v-skeleton-loader type="image"></v-skeleton-loader>
                                </v-col>
                            </v-row>
                            <v-row dense v-else>
                                <v-col v-for="n in pageStore.pages" :key="n" cols="4">
                                    <v-card @click="getSelected('page', n)" :border="true"
                                        @mouseenter="mouseEnter('page', n)">
                                        <v-sheet class="d-flex ma-2">
                                            <span class="me-auto">{{ $tr.line("home.textPage") }} {{ n }}</span>
                                            <!-- <span class="text-caption">{{ juz.verses_count }} {{
                                                $tr.line('home.textVerse')
                                                }}</span> -->
                                        </v-sheet>
                                        <v-card-text>
                                            <div class="d-flex">
                                                <v-card></v-card>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-tabs-window-item>
                    <!-- relevation order -->
                    <v-tabs-window-item value="relevation">
                        <v-container>
                            <v-row>
                                <v-col cols="12" class="mb-4">
                                    <v-text-field :label="$tr.line('home.inputSearch')" prepend-inner-icon="mdi-magnify"
                                        v-model="surahStore.searchValue" color="blue-lighten-3" hide-details>
                                        <template #append>
                                            <v-btn v-tooltip="$tr.line('home.buttonSort')"
                                                :icon="surahStore.currentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                                                variant="text" @click="surahStore.sort('revelation_order')"
                                                color="primary"></v-btn>
                                        </template>
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row v-if="!surahStore.surahs?.length">
                                <v-col cols="4" v-for="n in 114" :key="n">
                                    <v-skeleton-loader type="image"></v-skeleton-loader>
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col v-for="chapter in surahStore.surahs" :key="chapter.id" cols="4">
                                    <v-card @click="getSelected('chapter', chapter.id)" :border="true"
                                        @mouseenter="mouseEnter('chapter', chapter.id)">
                                        <v-card-text>
                                            <div class="d-flex">
                                                <v-chip color="primary">{{ chapter.revelation_order }}</v-chip>
                                                <span class="ms-2 d-flex" style="flex-direction: column;">
                                                    {{ chapter.name_simple }}
                                                    <small class="text-caption">
                                                        {{ chapter.translated_name.name }}</small>
                                                </span>
                                                <div class="ms-auto">
                                                    <div class="d-flex" style="flex-direction: column;">
                                                        <span>{{ chapter.name_arabic }}</span>
                                                        <br />
                                                        <small>{{ chapter.verses_count }} {{ $tr.line('home.textAyah')
                                                            }}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-col>
        </v-row>
    </v-container>
</template>
<style scoped>
:deep(.v-skeleton-loader__image) {
    height: 86px !important;
}
</style>