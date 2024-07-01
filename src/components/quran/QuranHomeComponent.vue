<script setup lang="ts">
import { ref, computed } from "vue"
// stores
import { useChapterStore, useJuzStore, usePageStore } from "@/stores";
// utils
import { setStorage } from "@/utils/storage";
// types
import type { Chapter } from "@/types/chapter"
import type { Juz, Pages } from "@/types/juz"

// Stores
const chapterStore = useChapterStore()
const juzStore = useJuzStore()
const pageStore = usePageStore()
const currentSortDir = ref("asc");
const currentSort = ref("id");
const pageSize = ref(21)
const currentPage = ref(1)

defineProps<{
    modelValue: string
}>()

const emit = defineEmits<{
    "update:modelValue": [value: string]
    "update:isLoading": [value: boolean]
    "updateSelected": [value: Chapter | Juz | Pages]
}>()

const chapters = computed(() => {
    if (chapterStore.chaptersList) {
        const searchableKeys = ["nameSimple", "nameArabic"];
        return chapterStore.chaptersList
            .filter((chapter: { nameSimple: string; nameArabic: string }) => {
                return searchableKeys.some((key) => {
                    return chapter[key as keyof typeof chapter]
                        .toLocaleLowerCase()
                        .replace(/([\-\'])/, "")
                        .includes(
                            chapterStore.searchValue.toLocaleLowerCase().replace(/([\-\'])/, "")
                        );
                });
            })
            .sort((a: any, b: any) => {
                let modifier = 1;
                if (currentSortDir.value === "desc") modifier = -1;
                if (a[currentSort.value] < b[currentSort.value]) return -1 * modifier;
                if (a[currentSort.value] > b[currentSort.value]) return 1 * modifier;
                return 0;
            }).filter((__, index) => {
                let start = (currentPage.value - 1) * pageSize.value;
                let end = currentPage.value * pageSize.value;
                if (index >= start && index < end) return true;
            });
    }
})

const nextChapterPage = () => {
    if (chapters.value) {
        if ((currentPage.value * pageSize.value) < chapters.value.length) currentPage.value++;
    }
}
const prevChapterPage = () => {
    if (currentPage.value > 1) currentPage.value--;
}

const getSelected = (key: string, value: Pages | Chapter | Juz) => {
    if (key === "chapter") {
        emit("update:isLoading", true)
        chapterStore.selectedChapter = value as Chapter
        emit("updateSelected", value as Chapter)
        setStorage("chapter", { data: value, verse: 1 })
    } else if (key === "juz") {
        juzStore.selectedJuz = value as Juz
        emit("updateSelected", value as Juz)
        setStorage("juz", { data: value })
    } else {
        // Page
        pageStore.selectedPage = value as Pages
        emit("updateSelected", value as Pages)
        setStorage("page", { data: value })
    }
}

const mouseEnter = async (key: string, value: Chapter | Pages | Juz) => {
    switch (key) {
        case "chapter":
            const chapter = value as Chapter
            if (!chapter.verses)
                await chapterStore.getVerses(chapter.id, false)
            break;
        case "juz":
            const juz = value as Juz
            if (!value.verses)
                await juzStore.getVerses(juz.juz_number, false)
            break;
        case "page":
            const page = value as Pages
            if (!value.verses)
                await pageStore.getVerses(page.pageNumber, false)
            break;
    }
}
</script>
<template>
    <v-container>
        <v-row>
            <v-col cols="12" class="my-4">
                <v-sheet class="pa-4 text-center mx-auto" elevation="12" max-width="600" rounded="lg" width="100%">
                    <v-icon class="mb-5" color="primary" icon="mdi-book-open-page-variant-outline" size="112"></v-icon>
                    <h2 class='text-h5 mb-6'>{{ $tr.line("home.intoTitle") }}</h2>
                    <div>{{ $tr.line("home.introSubtitle") }}</div>
                </v-sheet>
            </v-col>
            <v-col cols="12">
                <v-card :rounded="true">
                    <v-tabs :model-value="modelValue" align-tabs="center" color="primary"
                        @update:model-value="$emit('update:modelValue', $event as string)" grow>
                        <v-tab value="surah" prepend-icon="mdi-book-alphabet"
                            @click="chapterStore.currentSort = 'id'">{{ $tr.line('home.textSurah')
                            }}</v-tab>
                        <v-tab value="juz" prepend-icon="mdi-bookshelf">{{ $tr.line('home.textJuz') }}</v-tab>
                        <v-tab value="page" prepend-icon="mdi-page-layout-sidebar-left">{{ $tr.line('home.textPage')
                            }}</v-tab>
                        <v-tab value="relevation" prepend-icon="mdi-order-numeric-descending"
                            @click="chapterStore.currentSort = 'revelation_order'">
                            {{ $tr.line('home.textRelevation') }}</v-tab>
                    </v-tabs>
                    <v-tabs-window :model-value="modelValue">
                        <v-tabs-window-item value="surah">
                            <v-container>
                                <v-row>
                                    <v-col cols="12" class="mb-4">
                                        <v-text-field :label="$tr.line('home.inputSearch')"
                                            prepend-inner-icon="mdi-magnify" v-model="chapterStore.searchValue"
                                            color="blue-lighten-3" hide-details>
                                            <template #append-inner>
                                                <v-btn v-tooltip="$tr.line('buttonSort')"
                                                    :icon="chapterStore.currentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                                                    variant="text" @click="chapterStore.sort('id')"
                                                    color="primary"></v-btn>
                                            </template>
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row v-if="!chapters?.length">
                                    <v-col cols="4" v-for="n in 114" :key="n">
                                        <v-skeleton-loader type="image"></v-skeleton-loader>
                                    </v-col>
                                </v-row>
                                <v-row dense v-else>
                                    <v-col v-for="chapter in chapters" :key="chapter.id" cols="4">
                                        <v-card :data-id="chapter.id" @click="getSelected('chapter', chapter)"
                                            :border="true" @mouseenter="mouseEnter('chapter', chapter)">
                                            <v-card-text>
                                                <div class="d-flex">
                                                    <v-chip color="primary">{{ chapter.id }}</v-chip>
                                                    <span class="ms-2 d-flex" style="flex-direction: column;">
                                                        {{ chapter.nameSimple }}
                                                        <small class="text-body-2">
                                                            {{ chapter.translatedName.name }}</small>
                                                    </span>
                                                    <div class="ms-auto">
                                                        <div class="d-flex" style="flex-direction: column;">
                                                            <span>{{ chapter.nameArabic }}</span>
                                                            <br />
                                                            <small>{{ chapter.versesCount }} {{
                                                                $tr.line('home.textAyah')
                                                                }}</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-pagination v-model="currentPage" :length="Math.ceil(114 / pageSize)"
                                            @next="nextChapterPage" @prev="prevChapterPage"></v-pagination>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-tabs-window-item>
                        <!-- Juz -->
                        <v-tabs-window-item value="juz">
                            <v-container>
                                <v-row>
                                    <v-col cols="12" class="mb-4">
                                        <v-text-field :label="$tr.line('home.inputSearch')"
                                            prepend-inner-icon="mdi-magnify" v-model="juzStore.searchValue"
                                            color="blue-lighten-3" hide-details>
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
                                        <v-card :data-id="juz.id" @click="getSelected('juz', juz)" :border="true"
                                            @mouseenter="mouseEnter('juz', juz)">
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
                                        <v-text-field :label="$tr.line('home.inputSearch')"
                                            prepend-inner-icon="mdi-magnify" v-model="pageStore.searchValue"
                                            color="blue-lighten-3" hide-details>
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
                                    <v-col v-for="page in pageStore.pageList" :key="page.pageNumber" cols="4">
                                        <v-card @click="getSelected('page', page)" :border="true"
                                            @mouseenter="mouseEnter('page', page)">
                                            <v-sheet class="d-flex ma-2">
                                                <span class="me-auto">{{ $tr.line("home.textPage") }} {{ page.pageNumber
                                                    }}</span>
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
                                        <v-text-field :label="$tr.line('home.inputSearch')"
                                            prepend-inner-icon="mdi-magnify" v-model="chapterStore.searchValue"
                                            color="blue-lighten-3" hide-details>
                                            <template #append>
                                                <v-btn v-tooltip="$tr.line('home.buttonSort')"
                                                    :icon="chapterStore.currentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                                                    variant="text" @click="chapterStore.sort('revelation_order')"
                                                    color="primary"></v-btn>
                                            </template>
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row v-if="!chapters?.length">
                                    <v-col cols="4" v-for="n in 114" :key="n">
                                        <v-skeleton-loader type="image"></v-skeleton-loader>
                                    </v-col>
                                </v-row>
                                <v-row dense>
                                    <v-col v-for="chapter in chapters" :key="chapter.id" cols="4">
                                        <v-card @click="getSelected('chapter', chapter)" :border="true"
                                            @mouseenter="mouseEnter('chapter', chapter)">
                                            <v-card-text>
                                                <div class="d-flex">
                                                    <v-chip color="primary">{{ chapter.revelationOrder }}</v-chip>
                                                    <span class="ms-2 d-flex" style="flex-direction: column;">
                                                        {{ chapter.nameSimple }}
                                                        <small class="text-caption">
                                                            {{ chapter.translatedName.name }}</small>
                                                    </span>
                                                    <div class="ms-auto">
                                                        <div class="d-flex" style="flex-direction: column;">
                                                            <span>{{ chapter.nameArabic }}</span>
                                                            <br />
                                                            <small>{{ chapter.versesCount }} {{
                                                                $tr.line('home.textAyah')
                                                                }}</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-pagination v-model="currentPage" :length="Math.ceil(114 / pageSize)"
                                            @next="nextChapterPage" @prev="prevChapterPage"></v-pagination>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-tabs-window-item>
                    </v-tabs-window>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
<style scoped>
:deep(.v-skeleton-loader__image) {
    height: 86px !important;
}
</style>