<script setup lang="ts">
import { ref, watchEffect } from "vue"
import { ChaptersNavComponent } from "@/components";
import { PagesNavComponent, JuzsNavComponent } from "@/components";
import { setStorage } from "@/utils/storage";

const tab = ref("surah")

const props = defineProps<{
    selected: string
    intersectingVerseNumber?: number
    modelNav?: boolean
}>()

const emit = defineEmits<{
    "update:selectedTab": [value: string]
    "update:selectedPage": [value: number]
    "update:selectedVerseKeyView": [value: string]
}>()

watchEffect(() => {
    if (props.selected) {
        tab.value = props.selected
    }
})

const updateSelectedTab = () => {
    emit('update:selectedTab', tab.value)
    setStorage("tab", tab.value)
}
</script>
<template>
    <v-navigation-drawer :model-value="modelNav" width="300" permanent>
        <template #prepend>
            <v-tabs v-model="tab" align-tabs="center" :show-arrows="false" hide-slider class="mt-4"
                density="comfortable" color="primary" grow @update:model-value="updateSelectedTab">
                <v-tab value="surah" slim class="me-2">{{ $tr.line("navigation.textSurah")
                    }}</v-tab>
                <v-tab value="juz" slim class="me-2">{{ $tr.line("navigation.textJuz")
                    }}</v-tab>
                <v-tab value="page" slim>{{ $tr.line("navigation.textPage") }}</v-tab>
            </v-tabs>
            <v-divider color="primary" :thickness="2"></v-divider>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="surah">
                    <v-container fluid class="pa-0 mt-2">
                        <chapters-nav-component :intersecting-verse-number="intersectingVerseNumber"
                            @update:selected-verse-key-view="$emit('update:selectedVerseKeyView', $event)">
                        </chapters-nav-component>
                    </v-container>
                </v-tabs-window-item>
                <v-tabs-window-item value="juz">
                    <juzs-nav-component :intersecting-verse-number="intersectingVerseNumber"
                        @update:selected-verse-key-view="$emit('update:selectedVerseKeyView', $event)">
                    </juzs-nav-component>
                </v-tabs-window-item>
                <v-tabs-window-item value="page">
                    <pages-nav-component
                        @update:selected-page="$emit('update:selectedPage', $event)"></pages-nav-component>
                </v-tabs-window-item>
            </v-tabs-window>
        </template>
    </v-navigation-drawer>
</template>
