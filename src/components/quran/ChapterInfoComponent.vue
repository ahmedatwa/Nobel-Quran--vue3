<script setup lang="ts">
import { inject, shallowRef, watchEffect } from "vue";
// stores
import { useChapterStore } from "@/stores";
// types
import type { ChapterInfo } from "@/types";
import { langKey } from "@/types/symbols";

const chapterStore = useChapterStore()
const chapterInfo = shallowRef<ChapterInfo | null>(null)
const $t = inject(langKey)

const props = defineProps<{
    infoDialog: boolean
}>()

defineEmits<{
    "update:infoDialog": [value: boolean]
}>()

watchEffect(async () => {
    if (props.infoDialog)
        if (chapterStore.selectedChapter) {
            const chapter = chapterStore.chaptersList.find((c) => c.id === chapterStore.selectedChapter?.id)
            if (chapter?.chapterInfo) {
                chapterInfo.value = chapter.chapterInfo
                return
            } else {
                await chapterStore.getchapterInfo(chapterStore.selectedChapter?.id, $t?.locale.value).then((response) => {
                    chapterInfo.value = response.data.chapter_info;
                    chapterInfo.value = response.data.chapter_info
                }).catch((e) => {
                    throw e
                })
            }
        }
})

</script>
<template>
    <v-dialog :model-value="infoDialog" @update:model-value="$emit('update:infoDialog', $event)" width="600">
        <v-card>
            <template #title>
                <v-sheet class="my-2">
                    <v-icon icon="mdi-update"></v-icon> {{ $tr.locale.value === 'ar' ?
                        chapterStore.selectedChapter?.nameArabic : chapterStore.selectedChapter?.nameSimple }}
                    <v-icon icon="mdi-close" class="float-right" @click="$emit('update:infoDialog', false)"></v-icon>
                </v-sheet>
                <v-divider :thickness="2" color="primary"></v-divider>
            </template>
            <template #text>
                <v-container v-if="!chapterInfo" style="height: 400px;">
                    <v-row align-content="center" class="fill-height" justify="center">
                        <v-col class="text-subtitle-1 text-center" cols="12">
                            {{ $tr.line("quranReader.loadingChapterInfo") }}
                        </v-col>
                        <v-col cols="6">
                            <v-progress-linear color="primary" height="6" indeterminate rounded></v-progress-linear>
                        </v-col>
                    </v-row>
                </v-container>
                <div v-else class="ma-3" v-html="chapterInfo.text"></div>
            </template>
        </v-card>
    </v-dialog>
</template>