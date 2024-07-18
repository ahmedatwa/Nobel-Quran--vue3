<script setup lang="ts">
import { ref, computed } from "vue"
import type { Chapter } from "@/types/chapter";
// utils
import { TOTAL_CHAPTERS, getChapterNameSlug, getFirstVerseOfChapter } from "@/utils/chapter";
import { localizeNumber } from "@/utils/number"
// stores
import { useChapterStore } from "@/stores";
import router from "@/router"

const chapterStore = useChapterStore()

const chaptersSearchValue = ref("")
const chaptersCurrentSortDir = ref("asc");
const chaptersCurrentSort = ref("id");
const chaptersPageSize = ref(21)
const chaptersCurrentPage = ref(1)
const totalChapters = ref(TOTAL_CHAPTERS)
const chaptersPaginationLength = computed(() => {
    return Math.ceil(totalChapters.value / chaptersPageSize.value)
})


const emit = defineEmits<{
    "update:selected": [value: boolean]
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
                            chaptersSearchValue.value.toLocaleLowerCase().replace(/([\-\'])/, "")
                        );
                });
            })
            .sort((a: any, b: any) => {
                let modifier = 1;
                if (chaptersCurrentSortDir.value === "desc") modifier = -1;
                if (a[chaptersCurrentSort.value] < b[chaptersCurrentSort.value]) return -1 * modifier;
                if (a[chaptersCurrentSort.value] > b[chaptersCurrentSort.value]) return 1 * modifier;
                return 0;
            }).filter((__, index) => {
                let start = (chaptersCurrentPage.value - 1) * chaptersPageSize.value;
                let end = chaptersCurrentPage.value * chaptersPageSize.value;
                if (index >= start && index < end) return true;
            });
    }
})

const nextChapterPage = () => {
    if (chapters.value) {
        if ((chaptersCurrentPage.value * chaptersPageSize.value) < chapters.value.length) chaptersCurrentPage.value++;
    }
}
const prevChapterPage = () => {
    if (chaptersCurrentPage.value > 1) chaptersCurrentPage.value--;
}

const chaptersSort = (s: string) => {
    if (s === chaptersCurrentSort.value) {
        chaptersCurrentSortDir.value = chaptersCurrentSortDir.value === "asc" ? "desc" : "asc";
    }
    chaptersCurrentSort.value = s;
};

const mouseEnter = async (chapter: Chapter) => {
    if (!chapter.verses?.length)
        await getChapterVerses(chapter.id)
}

const getSelectedChapter = async (chapter: Chapter) => {
    if (!chapter.verses?.length) {
        await getChapterVerses(chapter.id)
        emit('update:selected', true)
    }
    chapterStore.selectedChapter = chapter
    router.push(`/${chapter.slug}/verse/${getFirstVerseOfChapter(chapter.verses).verse_number}`)
}

const getChapterVerses = async (chapterId: number) => {
    await chapterStore.getVerses(chapterId, false)
}
</script>

<template>
    <v-container>
        <v-row>
            <v-col cols="12" class="mb-4">
                <v-text-field :label="$tr.line('home.inputSearch')" prepend-inner-icon="mdi-magnify"
                    v-model="chaptersSearchValue" color="blue-lighten-3" hide-details>
                    <template #append>
                        <v-btn v-tooltip="$tr.line('buttonSort')"
                            :icon="chaptersCurrentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                            variant="text" @click="chaptersSort('id')" color="primary"></v-btn>
                    </template>
                </v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="!chapters?.length">
            <v-col cols="12" md="4" v-for="n in totalChapters" :key="n">
                <v-skeleton-loader type="image"></v-skeleton-loader>
            </v-col>
        </v-row>
        <v-row dense v-else>
            <v-col v-for="chapter in chapters" :key="chapter.id" cols="12" md="4">
                <v-card :data-id="chapter.id" @click="getSelectedChapter(chapter)" :border="true"
                    @mouseenter="mouseEnter(chapter)">
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
                                    <small>{{ localizeNumber(chapter.versesCount,
                                        $tr.locale.value) }}
                                        {{
                                            $tr.line('home.textAyah')
                                        }}</small>
                                </div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row justify="center">
            <v-col cols="8">
                <v-pagination rounded v-model="chaptersCurrentPage" :length="chaptersPaginationLength"
                    @next="nextChapterPage" @prev="prevChapterPage"></v-pagination>
            </v-col>
        </v-row>
    </v-container>
</template>