<script setup lang="ts">
import { ref, computed } from "vue"
// stores
import { useAudioPlayerStore, useChapterStore } from "@/stores";
import { useJuzStore, usePageStore, useSettingStore } from "@/stores";
// types
import type { Chapter } from "@/types/chapter"
import type { Juz, JuzVerseMapping } from "@/types/juz"
import type { Page } from "@/types/page"
// utils
import { localizeNumber, randomNumber } from "@/utils/number"
import { setLoadingIInterval, clearLoadingInterval } from "@/utils/interval";
import { AudioPlayerComponent } from "@/components/audio";

// Stores
const chapterStore = useChapterStore()
const settingStore = useSettingStore()
const juzStore = useJuzStore()
const pageStore = usePageStore()
const { getAudio } = useAudioPlayerStore()
// chapters
const chaptersSearchValue = ref("")
const chaptersCurrentSortDir = ref("asc");
const chaptersCurrentSort = ref("id");
const chaptersPageSize = ref(21)
const chaptersCurrentPage = ref(1)
const totalChapters = ref(114)
const chaptersPaginationLength = computed(() => {
    return Math.ceil(totalChapters.value / chaptersPageSize.value)
})
// Pages
const pagesSearchValue = ref("")
const pagesCurrentSortDir = ref("asc");
const pagesCurrentSort = ref("pageNumber");
const pagesPageSize = ref(21)
const pagesCurrentPage = ref(1)
const totalPages = ref(604)
const pagesPaginationLength = computed(() => {
    return Math.ceil(totalPages.value / pagesPageSize.value)
})
// Juz
const juzSearchValue = ref("")
const juzCurrentSortDir = ref("asc");
const juzCurrentSort = ref("juzNumber");
const juzPageSize = ref(12)
const juzCurrentPage = ref(1)
const totalJuzs = ref(30)
const juzsPaginationLength = computed(() => {
    return Math.ceil(totalJuzs.value / juzPageSize.value)
})

defineProps<{
    modelValue: string
}>()

const emit = defineEmits<{
    "update:modelValue": [value: string]
    "update:playRandomAudio": [value: number]
    "updateSelected": [value: Chapter | Juz | Page]
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

// Pages 
const pages = computed((): Page[] | undefined => {
    if (pageStore.pages) {
        return pageStore.pages.filter((p) => {
            return p.pageNumber.toLocaleString().replace(/([\-\'])/, "").includes(
                pagesSearchValue.value.toLocaleLowerCase().replace(/([\-\'])/, "")
            );
        }).sort((a: any, b: any) => {
            let modifier = 1;
            if (pagesCurrentSortDir.value === "desc") modifier = -1;
            if (a[pagesCurrentSort.value] < b[pagesCurrentSort.value]) return -1 * modifier;
            if (a[pagesCurrentSort.value] > b[pagesCurrentSort.value]) return 1 * modifier;
            return 0;
        }).filter((__, index) => {
            let start = (pagesCurrentPage.value - 1) * pagesPageSize.value;
            let end = pagesCurrentPage.value * pagesPageSize.value;
            if (index >= start && index < end) return true;
        });
    }
})

const nextPagesPage = () => {
    if (pages.value)
        if ((pagesCurrentPage.value * pagesPageSize.value) < pages.value.length) pagesCurrentPage.value++;
}
const prevPagesPage = () => {
    if (pagesCurrentPage.value > 1) pagesCurrentPage.value--;
}

const pagesSort = (s: string) => {
    if (s === pagesCurrentSort.value) {
        pagesCurrentSortDir.value = pagesCurrentSortDir.value === "asc" ? "desc" : "asc";
    }
    pagesCurrentSort.value = s;
};

// Juz
/**
 * mapping chapters names and verses for juz
 */
const juzsMapWithChapters = computed(() => {
    if (juzStore.juzs) {
        const map = juzStore.juzs.map((juz) => {
            return {
                ...juz,
                chapters: getChapterAndVerseMappingForJuz(juz.juz_number, juz.verse_mapping)
            }
        })

        return map.filter((j) => {
            return j.juz_number.toLocaleString().replace(/([\-\'])/, "").includes(
                juzSearchValue.value.toLocaleLowerCase().replace(/([\-\'])/, "")
            );
        }).sort((a: any, b: any) => {
            let modifier = 1;
            if (juzCurrentSortDir.value === "desc") modifier = -1;
            if (a[juzCurrentSort.value] < b[juzCurrentSort.value]) return -1 * modifier;
            if (a[juzCurrentSort.value] > b[juzCurrentSort.value]) return 1 * modifier;
            return 0;
        }).filter((__, index) => {
            let start = (juzCurrentPage.value - 1) * juzPageSize.value;
            let end = juzCurrentPage.value * juzPageSize.value;
            if (index >= start && index < end) return true;
        });
    }
})

const getChapterAndVerseMappingForJuz = (juzNumber: number, verseMapping: JuzVerseMapping) => {
    const array = []
    for (const key in verseMapping) {
        const verses = verseMapping[key];
        const chapterFound = chapterStore.chaptersList.find((chapter) => chapter.id === Number(key))
        if (chapterFound) {
            array.push({
                juzNumber: juzNumber,
                chapterId: key,
                en: chapterFound.nameSimple,
                ar: chapterFound.nameArabic,
                verses

            })
        }
    }
    return array
}
const juzsSort = (s: string) => {
    if (s === juzCurrentSort.value) {
        juzCurrentSortDir.value = juzCurrentSortDir.value === "asc" ? "desc" : "asc";
    }
    juzCurrentSort.value = s;
};
const nextJuzPage = () => {
    if (pages.value)
        if ((juzCurrentPage.value * juzPageSize.value) < pages.value.length) juzCurrentPage.value++;
}
const prevJuzPage = () => {
    if (juzCurrentPage.value > 1) juzCurrentPage.value--;
}

// Audio Player
const isAudioPlayer = ref(false)
const audioPlayerData = ref<{ audioID: number } | null>(null)
const playRandomAudio = async () => {
    const audioID = randomNumber(1, 114)
    await getAudio({audioID})
    isAudioPlayer.value = true
    audioPlayerData.value = {
        audioID
    }
}
</script>
<template>
    <v-container>
        <v-row>
            <v-col cols="12" class="my-4">
                <v-card class="pa-4 text-center mx-auto" elevation="12" max-width="600" rounded="lg" width="100%">
                    <v-card-title>
                        <v-btn variant="tonal" prepend-icon="mdi-play-circle-outline" @click="playRandomAudio">
                            {{ $tr.line('home.buttonPlayAudio') }}</v-btn>
                    </v-card-title>
                    <v-icon class="mb-5" color="primary" icon="mdi-book-open-page-variant-outline" size="112"></v-icon>
                    <h2 class='text-h5 mb-6'>{{ $tr.line("home.intoTitle") }}</h2>
                    <div>{{ $tr.line("home.introSubtitle") }}</div>
                </v-card>
            </v-col>
            <v-col cols="12">
                <v-card :rounded="true">
                    <v-tabs :model-value="modelValue" align-tabs="center" color="primary"
                        @update:model-value="$emit('update:modelValue', $event as string)" grow>
                        <v-tab value="chapters" prepend-icon="mdi-book-alphabet" @click="chaptersCurrentSort = 'id'">{{
                            $tr.line('home.textChapters')
                        }}</v-tab>
                        <v-tab value="juzs" prepend-icon="mdi-bookshelf">{{ $tr.line('home.textJuzs') }}</v-tab>
                        <v-tab value="pages" prepend-icon="mdi-page-layout-sidebar-left">{{ $tr.line('home.textPages')
                            }}</v-tab>
                        <v-tab value="relevation" prepend-icon="mdi-order-numeric-descending"
                            @click="chaptersCurrentSort = 'revelationOrder'">
                            {{ $tr.line('home.textRelevation') }}</v-tab>
                    </v-tabs>
                    <v-tabs-window :model-value="modelValue">
                        <v-tabs-window-item value="chapters">
                            <v-container>
                                <v-row>
                                    <v-col cols="12" class="mb-4">
                                        <v-text-field :label="$tr.line('home.inputSearch')"
                                            prepend-inner-icon="mdi-magnify" v-model="chaptersSearchValue"
                                            color="blue-lighten-3" hide-details>
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
                                        <v-pagination rounded v-model="chaptersCurrentPage"
                                            :length="chaptersPaginationLength" @next="nextChapterPage"
                                            @prev="prevChapterPage"></v-pagination>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-tabs-window-item>
                        <!-- Juz -->
                        <v-tabs-window-item value="juzs">
                            <v-container>
                                <v-row>
                                    <v-col cols="12" class="mb-4">
                                        <v-text-field :label="$tr.line('home.inputSearch')"
                                            prepend-inner-icon="mdi-magnify" v-model="juzSearchValue"
                                            color="blue-lighten-3" hide-details>
                                            <template #append>
                                                <v-btn v-tooltip="$tr.line('home.buttonSort')"
                                                    :icon="juzCurrentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                                                    variant="text" @click="juzsSort('id')" color="primary"></v-btn>
                                            </template>
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row v-if="!juzStore.juzs?.length">
                                    <v-col cols="12" md="4" v-for="n in totalJuzs" :key="n">
                                        <v-skeleton-loader type="image"></v-skeleton-loader>
                                    </v-col>
                                </v-row>
                                <v-row dense v-else>
                                    <v-col v-for="juz in juzsMapWithChapters" :key="juz.id" cols="12" md="4">
                                        <v-card :data-id="juz.id" @click="getSelected('juz', juz)" :border="true"
                                            @mouseenter="mouseEnter('juz', juz)" height="100">
                                            <v-sheet class="d-flex ma-2">
                                                <span class="me-auto">{{ $tr.line("home.textJuz") }}
                                                    {{ localizeNumber(juz.juz_number, $tr.locale.value) }}</span>
                                                <span class="text-caption">{{ localizeNumber(juz.verses_count,
                                                    $tr.locale.value) }} {{
                                                        $tr.line('home.textVerse') }}</span>
                                            </v-sheet>
                                            <v-card-text>
                                                <v-sheet v-for="chapter in juz.chapters" :key="chapter.chapterId"
                                                    class="w-100">
                                                    <div class="d-flex text-blue-grey-lighten-2">
                                                        <div class="me-auto">- {{ $tr.rtl.value ?
                                                            chapter.ar : chapter.en }}
                                                        </div>
                                                        <div>{{ $tr.line("home.textVerses") }} {{
                                                            localizeNumber(chapter.verses,
                                                                $tr.locale.value) }}
                                                        </div>
                                                    </div>
                                                </v-sheet>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                </v-row>
                                <v-row justify="center">
                                    <v-col cols="8">
                                        <v-pagination rounded v-model="juzCurrentPage" :length="juzsPaginationLength"
                                            @next="nextJuzPage" @prev="prevJuzPage"></v-pagination>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-tabs-window-item>
                        <!-- Page -->
                        <v-tabs-window-item value="pages">
                            <v-container>
                                <v-row>
                                    <v-col cols="12" class="mb-4">
                                        <v-text-field :label="$tr.line('home.inputSearch')"
                                            prepend-inner-icon="mdi-magnify" v-model="pagesSearchValue"
                                            color="blue-lighten-3" hide-details>
                                            <template #append>
                                                <v-btn v-tooltip="$tr.line('home.buttonSort')"
                                                    :icon="pagesCurrentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                                                    variant="text" @click="pagesSort('pageNumber')"
                                                    color="primary"></v-btn>
                                            </template>
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row v-if="!pageStore.pages?.length">
                                    <v-col cols="12" md="4" v-for="n in totalPages" :key="n">
                                        <v-skeleton-loader type="image"></v-skeleton-loader>
                                    </v-col>
                                </v-row>
                                <v-row dense v-else>
                                    <v-col v-for="page in pages" :key="page.pageNumber" cols="12" md="4">
                                        <v-card @click="getSelected('page', page)" :border="true"
                                            @mouseenter="mouseEnter('page', page)">
                                            <v-sheet class="d-flex ms-2 mt-2">
                                                {{ $tr.line("home.textPage") }} {{ localizeNumber(page.pageNumber,
                                                    $tr.locale.value) }}
                                            </v-sheet>
                                            <v-card-text v-if="page.chaptersMap">
                                                <v-sheet v-for="(chapter, index) in page.chaptersMap" :key="index">
                                                    <div class="d-flex text-blue-grey-lighten-2">
                                                        <div class="me-auto" v-if="chapter">- {{
                                                            $tr.rtl.value ?
                                                                chapter.nameArabic : chapter.nameSimple }}
                                                        </div>
                                                    </div>
                                                </v-sheet>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                </v-row>
                                <v-row justify="center">
                                    <v-col cols="8">
                                        <v-pagination rounded v-model="pagesCurrentPage" :length="pagesPaginationLength"
                                            @next="nextPagesPage" @prev="prevPagesPage"></v-pagination>
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
                                            prepend-inner-icon="mdi-magnify" v-model="chaptersSearchValue"
                                            color="blue-lighten-3" hide-details>
                                            <template #append>
                                                <v-btn v-tooltip="$tr.line('home.buttonSort')"
                                                    :icon="chaptersCurrentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                                                    variant="text" @click="chaptersSort('revelationOrder')"
                                                    color="primary"></v-btn>
                                            </template>
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row v-if="!chapters?.length">
                                    <v-col cols="12" md="4" v-for="n in totalChapters" :key="n">
                                        <v-skeleton-loader type="image"></v-skeleton-loader>
                                    </v-col>
                                </v-row>
                                <v-row dense>
                                    <v-col v-for="chapter in chapters" :key="chapter.id" cols="12" md="4">
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
                                                            <small>{{ localizeNumber(chapter.versesCount,
                                                                $tr.locale.value) }} {{
                                                                    $tr.line('home.textAyah')
                                                                }}</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-pagination rounded v-model="chaptersCurrentPage"
                                            :length="chaptersPaginationLength" @next="nextChapterPage"
                                            @prev="prevChapterPage"></v-pagination>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-tabs-window-item>
                    </v-tabs-window>
                </v-card>
            </v-col>
        </v-row>
        <audio-player-component :model-value="isAudioPlayer" :audio-player="audioPlayerData"
            @update:model-value="isAudioPlayer = $event"></audio-player-component>

    </v-container>
</template>
<style scoped>
:deep(.v-skeleton-loader__image) {
    height: 86px !important;
}
</style>