<script setup lang="ts">
import { ChaptersTabComponent, JuzsTabComponent } from "@/components/home"
import { PagesTabComponent, RelevationTabComponent } from "@/components/home"
// stores
import { useChapterStore, useJuzStore, usePageStore, useSettingStore } from "@/stores";
// types
import type { Chapter } from "@/types/chapter"
import type { Juz } from "@/types/juz"
import type { Page } from "@/types/page"
// utils
import { localizeNumber } from "@/utils/number"
import { setLoadingIInterval, clearLoadingInterval } from "@/utils/interval";

// Stores
const chapterStore = useChapterStore()
const settingStore = useSettingStore()
const juzStore = useJuzStore()
const pageStore = usePageStore()

defineProps<{
    modelValue?: string
}>()

const emit = defineEmits<{
    "update:modelValue": [value: string]
    "updateSelected": [value: Chapter | Juz | Page]
}>()




const getSelected = (key: string, value: Page | Chapter | Juz) => {
    if (key) {
        settingStore.isAppLoading = true
        setLoadingIInterval(1000, 50)
        setTimeout(() => {
            settingStore.isAppLoading = false
            clearLoadingInterval()
        }, 1500);

        if (key === "chapter") {
            chapterStore.selectedChapter = value as Chapter
            emit("updateSelected", value as Chapter)
        } else if (key === "juz") {
            juzStore.selectedJuz = value as Juz
            emit("updateSelected", value as Juz)
        } else {
            // Page
            pageStore.selectedPage = value as Page
            emit("updateSelected", value as Page)
        }

    }
}

const mouseEnter = async (key: string, value: Chapter | Page | Juz) => {
    switch (key) {
        case "chapter":
            const chapter = value as Chapter
            if (!chapter.verses?.length)
                await chapterStore.getVerses(chapter.id, false)
            break;
        case "juz":
            const juz = value as Juz
            if (!juz.verses?.length)
                await juzStore.getVerses(juz.juz_number, false)
            break;
        case "page":
            const page = value as Page
            if (!page.verses?.length)
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
                        <v-tab value="chapters" prepend-icon="mdi-book-alphabet" to="/home/chapters">{{
                            $tr.line('home.textChapters')
                        }} </v-tab>
                        <v-tab value="juzs" to="/home/juzs" prepend-icon="mdi-bookshelf">{{ $tr.line('home.textJuzs')
                            }}</v-tab>
                        <v-tab value="pages" to="/home/pages" prepend-icon="mdi-page-layout-sidebar-left">{{
                            $tr.line('home.textPages')
                            }}</v-tab>
                        <v-tab value="relevation" prepend-icon="mdi-order-numeric-descending"
                            to="/home/revelation-order">
                            {{ $tr.line('home.textRelevation') }}</v-tab>
                    </v-tabs>
                    <v-tabs-window :model-value="modelValue">
                        <v-tabs-window-item value="chapters">
                            <chapters-tab-component :chapters="chapterStore.chaptersList"></chapters-tab-component>
                        </v-tabs-window-item>
                        <!-- Juz -->
                        <v-tabs-window-item value="juzs">
                            <juzs-tab-component></juzs-tab-component>
                        </v-tabs-window-item>
                        <!-- Page -->
                        <v-tabs-window-item value="pages">
                            <pages-tab-component></pages-tab-component>
                        </v-tabs-window-item>
                        <!-- relevation order -->
                        <v-tabs-window-item value="relevation">
                            <relevation-tab-component></relevation-tab-component>
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