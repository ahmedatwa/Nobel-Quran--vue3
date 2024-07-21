<script setup lang="ts">
import { ref, watchEffect } from "vue"
// components
import { ChaptersNavComponent } from "@/components/chapters";
import { JuzsNavComponent } from "@/components/juzs";
import { PagesNavComponent } from "@/components/pages";
// utils
import { setStorage } from "@/utils/storage";
import { useWindowScroll } from "@/utils/useWindowScroll"
// types
import type { ChapterAutoScrollData, IntersectingData } from "@/types/chapter"
import type { JuzVersesIntersecting } from "@/types/juz"

const navigationTab = ref("chapters")

const props = defineProps<{
    selected: string
    chapterIntersectingData?: IntersectingData
    chapterAutoScrollData?: ChapterAutoScrollData;
    juzManualIntersecting?: JuzVersesIntersecting
    intersectingPageVerseNumber?: number
    navigationModelValue?: boolean
    activeJuzNumber?: number
    activePageNumber?: number
}>()

const emit = defineEmits<{
    "update:selectedTab": [value: string]
    "update:selectedPage": [value: number]
    "update:selectedVerseNumber": [value: number]
    "update:modelValue": [value: boolean]
}>()

watchEffect(() => {
    if (props.selected) {
        navigationTab.value = props.selected
    }
})

watchEffect(() => {
    if (navigationTab.value) {
        emit('update:selectedTab', navigationTab.value)
        setStorage("tab", navigationTab.value)
    }
})


const { isScrollingUp } = useWindowScroll()

</script>
<template>
    <v-navigation-drawer :model-value="navigationModelValue" width="300"
        :style="{ top: isScrollingUp ? '35px' : '90px' }" :temporary="$vuetify.display.smAndDown"
        @update:model-value="$emit('update:modelValue', $event)" :permanent="$vuetify.display.mdAndUp"
        disable-resize-watcher id="v-navigation-drawer">
        <!-- <template #prepend> -->
        <v-tabs v-model="navigationTab" align-tabs="center" :show-arrows="false" hide-slider class="mt-4"
            density="comfortable" color="primary" grow>
            <v-tab value="chapters" slim class="me-2">{{ $tr.line("navigation.textSurah")
                }}</v-tab>
            <v-tab value="juzs" slim class="me-2">{{ $tr.line("navigation.textJuz")
                }}</v-tab>
            <v-tab value="pages" slim>{{ $tr.line("navigation.textPage") }}</v-tab>
        </v-tabs>
        <v-divider color="primary" :thickness="2"></v-divider>
        <v-tabs-window v-model="navigationTab">
            <v-tabs-window-item value="chapters">
                <chapters-nav-component :intersecting-data="chapterIntersectingData"
                    @update:selected-verse-number="$emit('update:selectedVerseNumber', $event)">
                </chapters-nav-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="juzs">
                <juzs-nav-component :manual-intersecting="juzManualIntersecting" :active-juz-number="activeJuzNumber"
                    class="pb-5" @update:selected-verse-number="$emit('update:selectedVerseNumber', $event)">
                </juzs-nav-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="pages">
                <pages-nav-component :active-page-number="activePageNumber" class="pb-5"
                    :intersecting-page-verse-number="intersectingPageVerseNumber"
                    @update:selected-page="$emit('update:selectedPage', $event)"></pages-nav-component>
            </v-tabs-window-item>
        </v-tabs-window>
        <!-- </template> -->
    </v-navigation-drawer>
</template>
<style scoped>
:deep(.v-navigation-drawer__content) {
    overflow-y: hidden;
}

.top-45 {
    top: 45px !important;
    transition: all .5s ease-in-out;
    transform-origin: left top;
    transform: scaleY(1);
}

.top-100 {
    top: 100px;
    transition: all .5s ease-in-out;
    transform-origin: left top;
    transform: scaleY(1);
}
</style>