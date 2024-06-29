<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ButtonsActionListComponent, ChapterInfoComponent } from '@/components';
import type { HeaderData, Pagination, Verse } from '@/types';
import { useTranslationsStore, useSurahStore } from "@/stores";
import { instance } from '@/axios';

const translationsStore = useTranslationsStore()
const { getChapterName } = useSurahStore()

const tab = ref("translationTab")
const translationsDrawer = ref(false)
const chapterInfoDialog = ref(false)
const headerData = ref<HeaderData | null>(null);
const isLoading = ref(false)
const verses = ref<Verse[]>([]);
const selectPage = ref(1)
const pagination = ref<Pagination>({
    current_page: 1,
    next_page: 2,
    per_page: 20,
    total_pages: 0,
    total_records: 0,
});

const props = defineProps<{
    audioPlayer: { audioID: number, isPlaying?: boolean, format?: string } | null;
    selected?: boolean
    selectedPage: number
    settingCssVars?: { size: string, family: string }
}>()

const emit = defineEmits<{
    "update:translationDrawer": [value: boolean]
    "update:playAudio": [value: { audioID: number }]
    "update:headerData": [value: HeaderData]
}>()

const getVerses = async (
    id: number,
    currentPage: number,
    perPage?: number
) => {
    isLoading.value = true;
    perPage = perPage ? perPage : pagination.value.per_page;
    return await instance
        .get(
            `/verses/by_page/${id}?translations=${translationsStore.selectedTranslationsIdsString}&words=true&translation_fields=resource_name,language_id&page=${currentPage}&per_page=${perPage}&fields=text_uthmani,chapter_id,hizb_number,text_imlaei_simple&word_fields=verse_key,verse_id,page_number,location,text_uthmani,code_v1,qpc_uthmani_hafs`
        )
        .then((response) => {
            verses.value.push(...response.data.verses);
            pagination.value = response.data.pagination;
        })
        .catch((e) => {
            console.log(e);
        })
        .finally(() => {
            isLoading.value = false;
        });
};


// Load More
const loadMore = async (options: { done: (status: 'loading' | 'error' | 'empty' | 'ok') => void }) => {
    if (pagination.value.next_page <= pagination.value.total_pages) {
        if (selectPage.value) {
            await getVerses(selectPage.value, pagination.value.next_page)
            options.done('ok')
        }
    } else {
        options.done('empty')
    }
}

const playAudio = (audioID: number) => {
    emit('update:playAudio', { audioID })
}

const getTranslations = () => {
    translationsDrawer.value = translationsDrawer.value ? false : true
    emit('update:translationDrawer', translationsDrawer.value)
}

watch(() => props.selectedPage, async (newPage) => {
    if (newPage) await getVerses(props.selectedPage, pagination.value.current_page)
})

onMounted(async () => {
    if (props.selected)
        await getVerses(1, pagination.value.current_page)
})

// Header Info
const onIntersect = (isIntersecting: boolean, entries: any) => {
    if (isIntersecting) {
        headerData.value = {
            left: "",
            right: {
                pageNumber: pagination.value.current_page,
                hizbNumber: entries[0].target.dataset.hizbNumber,
                juzNumber: entries[0].target.dataset.juzNumber,
            }
        }
        emit('update:headerData', headerData.value)
    }
}

const loadMoreDisabled = computed((): boolean => {
    return pagination.value.current_page === pagination.value.total_pages
})

const verseMap = computed(() => {
    if (verses.value) {
        return verses.value.reduce((result: any, currentValue: Verse) => {
            (result[currentValue.chapter_id] =
                result[currentValue.chapter_id] || []).push(currentValue);
            return result;
        }, {});
    }
});
</script>
<template>
    <v-card v-show="selected" class="ma-2" :elevation="1">
        <v-tabs v-model="tab" align-tabs="center" color="primary" grow>
            <v-tab value="translationTab" prepend-icon="mdi-book-open">{{ $tr.line("quranReader.textTranslation")
                }}</v-tab>
            <v-tab value="readingTab" prepend-icon="mdi-translate-variant">{{ $tr.line("quranReader.textReading")
                }}</v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="translationTab" class="mx-5">
                <v-infinite-scroll :height="650" :items="verseMap" mode="manual" @load="loadMore" color="primary">
                    <template v-for="(verses, index) in verseMap" :key="index" :id="`chapter-${index}`">
                        <v-container fluid>
                            <v-row :align="'center'" justify="center" dense>
                                <v-col cols="12" class="text-center text-h4">
                                    <p class="d-inline-block quran-content-title">
                                        سورة {{ getChapterName(index)?.ar }}</p>
                                    <p class="quran-content-title">{{ getChapterName(index)?.bismillah
                                        ? $tr.line("quranReader.textBismillah") : '' }}
                                    </p>
                                </v-col>
                                <v-col cols="12">
                                    <v-sheet class="d-flex flex-wrap mx-4">
                                        <v-sheet class="flex-1-0 ma-2 pa-2 d-inline"> {{ $tr.line("textTranslatedBy") }}
                                            <div class="d-inline">
                                                <span class="me-1">
                                                    {{ translationsStore.groupedTranslationsAuthors }}</span>
                                            </div> <v-btn icon="mdi-filter-menu" color="teal-lighten-1"
                                                v-tooltip="$tr.line('quranReader.buttonFilter')"
                                                @click="getTranslations" variant="plain">
                                            </v-btn>
                                        </v-sheet>
                                        <v-sheet class="ma-2 pa-2">
                                            <v-btn variant="outlined" @click="playAudio(index)" color="primary">
                                                <v-icon
                                                    :icon="audioPlayer?.audioID === index ? 'mdi-pause' : 'mdi-play'"
                                                    :key="index"></v-icon>{{ $tr.line("quranReader.buttonPlay") }}
                                            </v-btn>
                                        </v-sheet>
                                    </v-sheet>
                                </v-col>
                                <v-divider :thickness="2" color="orange" class="mb-3"></v-divider>
                                <!-- Body -->
                                <v-col cols="12" v-for="verse in verses" :key="verse.id" class="border-bottom mb-2">
                                    <v-card :id="`verse-card${verse.verse_number}`" class="mx-auto" flat
                                        v-intersect="onIntersect" :data-juz-number="verse.juz_number"
                                        :data-hizb-number="verse.hizb_number">
                                        <v-row no-gutters>
                                            <v-col :order="$tr.rtl.value ? 2 : 1">
                                                <buttons-action-list-component
                                                    @update:play-audio="$emit('update:playAudio', $event)" size="small"
                                                    :is-playing="audioPlayer?.audioID === index" :verse="verse">
                                                </buttons-action-list-component>
                                            </v-col>
                                            <v-col cols="11" class="text-right pt-3" :order="$tr.rtl.value ? 1 : 2">
                                                <div class="quran-content">
                                                    <ul class="">
                                                        <li v-for="word in verse.words" :key="word.id"
                                                            :data-word-location="word.location">
                                                            <p v-tooltip="word.translation.text">{{ word.text_uthmani }}
                                                            </p>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <v-list>
                                                    <v-list-item class="text-left"
                                                        v-for="translation in verse.translations" :key="translation.id">
                                                        <div class="translation" v-html="translation.text"></div>
                                                        <v-sheet class="text-caption mt-2 text-disabled">
                                                            -- {{ translation.resource_name }}</v-sheet>
                                                    </v-list-item>
                                                </v-list>
                                            </v-col>
                                        </v-row>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-container>
                    </template>
                    <template #load-more="{ props }">
                        <v-sheet v-if="!loadMoreDisabled">
                            <v-btn variant="outlined" prepend-icon="mdi-reload" color="primary" v-bind="props">
                                {{ $tr.line("quranReader.textPage") }} {{ pagination.current_page }} of {{
                                    pagination.total_pages }}
                            </v-btn>
                        </v-sheet>
                    </template>
                    <template #loading>
                        <v-container>
                            <v-row>
                                <v-spacer></v-spacer>
                                <v-col cols="12" v-for="n in pagination.per_page" :key="n">
                                    <v-skeleton-loader type="image"></v-skeleton-loader>
                                </v-col>
                            </v-row>
                        </v-container>
                    </template>
                </v-infinite-scroll>
            </v-tabs-window-item>
            <v-tabs-window-item value="readingTab">
                <v-infinite-scroll :height="500" :items="verseMap" mode="manual" :onLoad="loadMore">
                    <template v-for="(verses, index) in verseMap" :key="index">
                        <v-container class="reading-container">
                            <v-row>
                                <v-col cols="12" class="text-center text-h4">
                                    <p class="d-inline-block quran-content-title">
                                        سورة {{ getChapterName(index)?.ar }}</p>
                                    <p class="quran-content-title">{{ getChapterName(index)?.bismillah
                                        ? $tr.line("quranReader.textBismillah") : '' }}
                                    </p>
                                </v-col>
                                <v-col cols="12" class="d-flex">
                                    <div class="me-auto">
                                        <v-btn @click="chapterInfoDialog = !chapterInfoDialog">
                                            {{ $tr.line("quranReader.textSurahInfo") }}
                                        </v-btn>
                                    </div>
                                    <div>
                                        <v-btn variant="outlined" @click="playAudio(index)" color="primary">
                                            <v-icon :icon="audioPlayer?.audioID === index ? 'mdi-pause' : 'mdi-play'"
                                                :key="index"></v-icon>
                                            {{ $tr.line("quranReader.buttonPlay") }}
                                        </v-btn>
                                    </div>
                                </v-col>
                                <v-divider :thickness="2" color="orange"></v-divider>
                                <v-col cols="12" v-for="verse in verses" :key="verse.id">
                                    <div class="quran-content">
                                        <ul class="d-flex justify-center">
                                            <li v-for="word in verse.words" :key="word.id"
                                                :data-word-location="word.location">
                                                <p v-tooltip="word.translation.text">{{ word.text_uthmani }}</p>
                                            </li>
                                        </ul>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-container>
                    </template>
                    <template #load-more="{ props }">
                        <v-sheet v-if="!loadMoreDisabled">
                            <v-btn variant="outlined" prepend-icon="mdi-reload" color="primary" v-bind="props">
                                {{ $tr.line("quranReader.textPage") }} {{ pagination.current_page }} of {{
                                    pagination.total_pages }}
                            </v-btn>
                        </v-sheet>
                    </template>
                    <template #loading>
                        <v-container>
                            <v-row>
                                <v-spacer></v-spacer>
                                <v-col cols="12" v-for="n in pagination.per_page" :key="n">
                                    <v-skeleton-loader type="text"></v-skeleton-loader>
                                </v-col>
                            </v-row>
                        </v-container>
                    </template>
                </v-infinite-scroll>
            </v-tabs-window-item>
        </v-tabs-window>
    </v-card>
    <chapter-info-component :info-dialog="chapterInfoDialog"
        @update:info-dialog="chapterInfoDialog = $event"></chapter-info-component>
</template>
<style scoped>
:deep(.v-card-item__append) {
    align-items: start !important;
}

:deep(:nth-last-child(1 of .reading-container)) {
    border-top: 0.02em inset rgba(0, 0, 0, 0.5) !important;
}

.quran-content {
    font-family: v-bind("props.settingCssVars?.family");
    font-size: v-bind("props.settingCssVars?.size");
}
</style>