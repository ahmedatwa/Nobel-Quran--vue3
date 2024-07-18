<script setup lang="ts">
import { ref, computed } from "vue"
// types
import type { Page } from "@/types/page";
// stores
import { usePageStore } from "@/stores";
// utils
import { localizeNumber } from "@/utils/number"

const pageStore = usePageStore()

const pagesSearchValue = ref("")
const pagesCurrentSortDir = ref("asc");
const pagesCurrentSort = ref("pageNumber");
const pagesPageSize = ref(21)
const pagesCurrentPage = ref(1)
const totalPages = ref(604)
const pagesPaginationLength = computed(() => {
    return Math.ceil(totalPages.value / pagesPageSize.value)
})


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

const mouseEnter = async (page: Page) => {
    if (!page.verses?.length)
        await getPageVerses(page.pageNumber)
}

const getSelectedPage = async (page: Page) => {
    if (!page.verses?.length) {
        await getPageVerses(page.pageNumber)
    }
    pageStore.selectedPage = page
}

const getPageVerses = async (pageNumber: number) => {
    await pageStore.getVerses(pageNumber, false)
}

</script>

<template>
    <v-container>
        <v-row>
            <v-col cols="12" class="mb-4">
                <v-text-field :label="$tr.line('home.inputSearch')" prepend-inner-icon="mdi-magnify"
                    v-model="pagesSearchValue" color="blue-lighten-3" hide-details>
                    <template #append>
                        <v-btn v-tooltip="$tr.line('home.buttonSort')"
                            :icon="pagesCurrentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                            variant="text" @click="pagesSort('pageNumber')" color="primary"></v-btn>
                    </template>
                </v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="!pageStore.pagesList?.length">
            <v-col cols="12" md="4" v-for="n in totalPages" :key="n">
                <v-skeleton-loader type="image"></v-skeleton-loader>
            </v-col>
        </v-row>
        <v-row dense v-else>
            <v-col v-for="page in pages" :key="page.pageNumber" cols="12" md="4">
                <v-card @click="getSelectedPage(page)" :border="true" @mouseenter="mouseEnter(page)">
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
                <v-pagination rounded v-model="pagesCurrentPage" :length="pagesPaginationLength" @next="nextPagesPage"
                    @prev="prevPagesPage"></v-pagination>
            </v-col>
        </v-row>
    </v-container>
</template>