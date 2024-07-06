<script setup lang="ts">
import { ref, watchEffect } from "vue"
// components
import { ChaptersNavComponent } from "@/components/chapters";
import { JuzsNavComponent } from "@/components/juzs";
import { PagesNavComponent } from "@/components/pages";
// utils
import { setStorage } from "@/utils/storage";

const navigationTab = ref("chapters")

const props = defineProps<{
    selected: string
    intersectingVerseNumber?: number
    intersectingJuzVerseNumber?: number
    intersectingPageVerseNumber?: number
    navigationModelValue?: boolean
    activeJuzNumber?: number
    activePageNumber?: number
}>()

const emit = defineEmits<{
    "update:selectedTab": [value: string]
    "update:selectedPage": [value: number]
    "update:selectedVerseKeyView": [value: string]
}>()

watchEffect(() => {
    if (props.selected) {
        navigationTab.value = props.selected
    }
})

watchEffect(() => {
    if(navigationTab.value) {
        emit('update:selectedTab', navigationTab.value)
        setStorage("tab", navigationTab.value)
    }
})
</script>
<template>
    <v-navigation-drawer :model-value="navigationModelValue" width="300" permanent>
        <template #prepend>
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
                    <chapters-nav-component :intersecting-verse-number="intersectingVerseNumber"
                        @update:selected-verse-key-view="$emit('update:selectedVerseKeyView', $event)">
                    </chapters-nav-component>
                </v-tabs-window-item>
                <v-tabs-window-item value="juzs">
                    <juzs-nav-component :intersecting-juz-verse-number="intersectingJuzVerseNumber"
                        :active-juz-number="activeJuzNumber"
                        @update:selected-verse-key-view="$emit('update:selectedVerseKeyView', $event)">
                    </juzs-nav-component>
                </v-tabs-window-item>
                <v-tabs-window-item value="pages">
                    <pages-nav-component :active-page-number="activePageNumber"
                        :intersecting-page-verse-number="intersectingPageVerseNumber"
                        @update:selected-page="$emit('update:selectedPage', $event)"></pages-nav-component>
                </v-tabs-window-item>
            </v-tabs-window>
        </template>
    </v-navigation-drawer>
</template>
