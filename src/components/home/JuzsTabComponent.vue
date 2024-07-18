<script setup lang="ts">
import { ref, computed } from "vue"
// types
import type { Juz } from "@/types/juz"
// utils
import { getChapterAndVerseMappingForJuz } from "@/utils/juz"
import { localizeNumber } from "@/utils/number"
// stores
import { useJuzStore } from "@/stores";


const juzStore = useJuzStore()


const juzSearchValue = ref("")
const juzCurrentSortDir = ref("asc");
const juzCurrentSort = ref("juzNumber");
const juzPageSize = ref(12)
const juzCurrentPage = ref(1)
const totalJuzs = ref(30)
const juzsPaginationLength = computed(() => {
    return Math.ceil(totalJuzs.value / juzPageSize.value)
})


const emit = defineEmits<{
    "update:juzSelected": [value: Juz]
}>()

const juzsMapWithChapters = computed(() => {
    if (juzStore.juzList) {
        const map = juzStore.juzList.map((juz) => {
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


const juzsSort = (s: string) => {
    if (s === juzCurrentSort.value) {
        juzCurrentSortDir.value = juzCurrentSortDir.value === "asc" ? "desc" : "asc";
    }
    juzCurrentSort.value = s;
};
const nextJuzPage = () => {
    if ((juzCurrentPage.value * juzPageSize.value) < totalJuzs.value) juzCurrentPage.value++;
}
const prevJuzPage = () => {
    if (juzCurrentPage.value > 1) juzCurrentPage.value--;
}

const mouseEnter = async (juz: Juz) => {
    if (!juz.verses?.length)
        await getJuzVerses(juz.juz_number)
}

const getSelectedJuz = async (juz: Juz) => {
    if (!juz.verses?.length) {
        await getJuzVerses(juz.juz_number)
    }
    juzStore.selectedJuz = juz
}

const getJuzVerses = async (juzNumber: number) => {
    await juzStore.getVerses(juzNumber, false)
}

</script>

<template>
    <v-container>
        <v-row>
            <v-col cols="12" class="mb-4">
                <v-text-field :label="$tr.line('home.inputSearch')" prepend-inner-icon="mdi-magnify"
                    v-model="juzSearchValue" color="blue-lighten-3" hide-details>
                    <template #append>
                        <v-btn v-tooltip="$tr.line('home.buttonSort')"
                            :icon="juzCurrentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                            variant="text" @click="juzsSort('id')" color="primary"></v-btn>
                    </template>
                </v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="!juzStore.juzList?.length">
            <v-col cols="12" md="4" v-for="n in totalJuzs" :key="n">
                <v-skeleton-loader type="image"></v-skeleton-loader>
            </v-col>
        </v-row>
        <v-row dense v-else>
            <v-col v-for="juz in juzsMapWithChapters" :key="juz.id" cols="12" md="4">
                <v-card :data-id="juz.id" @click="getSelectedJuz(juz)" :border="true" @mouseenter="mouseEnter(juz)"
                    height="100">
                    <v-sheet class="d-flex ma-2">
                        <span class="me-auto">{{ $tr.line("home.textJuz") }}
                            {{ localizeNumber(juz.juz_number, $tr.locale.value) }}</span>
                        <span class="text-caption">{{ localizeNumber(juz.verses_count,
                            $tr.locale.value) }} {{
                                $tr.line('home.textVerse') }}</span>
                    </v-sheet>
                    <v-card-text>
                        <v-sheet v-for="chapter in juz.chapters" :key="chapter.juzNumber" class="w-100">
                            <div class="d-flex text-blue-grey-lighten-2">
                                <div class="me-auto">- {{ $tr.rtl.value ?
                                    chapter.chapter.nameArabic : chapter.chapter.nameSimple }}
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
                <v-pagination rounded v-model="juzCurrentPage" :length="juzsPaginationLength" @next="nextJuzPage"
                    @prev="prevJuzPage"></v-pagination>
            </v-col>
        </v-row>
    </v-container>
</template>