<script lang="ts">
import { ref } from "vue"



</script>

<template>

    <v-container>
        <v-row>
            <v-col cols="12" class="mb-4">
                <v-text-field :label="$tr.line('home.inputSearch')" prepend-inner-icon="mdi-magnify"
                    v-model="chaptersSearchValue" color="blue-lighten-3" hide-details>
                    <template #append>
                        <v-btn v-tooltip="$tr.line('home.buttonSort')"
                            :icon="chaptersCurrentSortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                            variant="text" @click="chaptersSort('revelationOrder')" color="primary"></v-btn>
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
                <v-pagination rounded v-model="chaptersCurrentPage" :length="chaptersPaginationLength"
                    @next="nextChapterPage" @prev="prevChapterPage"></v-pagination>
            </v-col>
        </v-row>
    </v-container>

</template>