<script setup lang="ts">
import { watchEffect } from "vue";
// Store
import { useTafsirStore } from "@/stores";
// types
import type { Verse } from "@/types"

const tafsirStore = useTafsirStore();

defineEmits<{
    "update:modelValue": [value: boolean]
}>()

const props = defineProps<{
    modelValue: boolean
    verse: Verse
}>()

// to update verses key 
watchEffect(() => {
    if (props.modelValue) {
        tafsirStore.selectedVerseKey = props.verse.verse_key
    }
})
const getTafsirBySlug = (slug: string, verseKey: string) => {
    tafsirStore.selectedVerseKey = verseKey
    tafsirStore.tafsirSlug = slug
}
</script>
<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" width="800"
        :key="verse.verse_key">
        <v-card :loading="tafsirStore.isLoading">
            <v-card-title class="d-flex">
                <div class="me-auto">
                    <v-icon icon="mdi-update"></v-icon> {{ $tr.line('tafsir.title') }}
                </div>
                <v-btn variant="text" class="ms-auto" icon="mdi-close"
                    @click="$emit('update:modelValue', false)"></v-btn>
            </v-card-title>
            <v-card-text>
                <v-select :items="tafsirStore.selection" v-model="tafsirStore.selectedLanguage" density="compact"
                    hide-details></v-select>
                <v-divider :thickness="2" class="mb-3" color="orange"></v-divider>
                <div v-if="tafsirStore.tafsirsAuthors">
                    <span v-for="item in tafsirStore.tafsirsAuthors" :key="item.id" class="mb-3">
                        <v-chip class="ma-1" v-if="item.language_name === tafsirStore.selectedLanguage.toLowerCase()"
                            :id="verse.verse_key" @click="getTafsirBySlug(item.slug, verse.verse_key)">{{ item.name }}
                        </v-chip>
                    </span>
                </div>
                <v-sheet class="mt-4 text-body-2">
                    <v-divider :thickness="2" color="orange"></v-divider>
                    <v-btn :disabled="tafsirStore.fontSize === 1" icon="mdi-minus" variant="text" class="d-inline"
                        @click="tafsirStore.fontSize--"></v-btn>
                    <input class="d-inline mx-2" v-model="tafsirStore.fontSize" style="width: 18px;" disabled>
                    <v-btn :disabled="tafsirStore.fontSize === 10" icon="mdi-plus" variant="text" class="d-inline"
                        @click="tafsirStore.fontSize++"></v-btn>
                    <div v-if="tafsirStore.tafsir">
                        <span v-for="(verse, key) in tafsirStore.tafsir.verses" :key="key">
                            <div v-for="word in verse.words" :key="word.id">
                                <span v-if="word.char_type_name === 'end'" class="float-right px-1 my-3">({{
                                    word.text_uthmani }})</span>
                                <span class="float-right px-1 my-3" v-else>{{ word.text_uthmani }}</span>
                            </div>
                        </span>
                    </div>
                    <v-divider :thickness="2" color="orange"></v-divider>
                </v-sheet>
                <!-- tafsir text -->
                <div :style="{ fontSize: (tafsirStore.fontSize + 15) + 'px' }">
                    <v-sheet v-if="!tafsirStore.tafsir">
                        <v-container style="height: 300px;">
                            <v-row align-content="center" class="fill-height" justify="center">
                                <v-progress-circular color="primary" model-value="20"
                                    indeterminate></v-progress-circular>
                            </v-row>
                        </v-container>
                    </v-sheet>
                    <v-sheet v-else>
                        <v-sheet v-if="tafsirStore.tafsirRTLMap === 'ar'">
                            <div class="text-right" v-html="tafsirStore.tafsir.text"></div>
                        </v-sheet>
                        <v-sheet v-else v-html="tafsirStore.tafsir.text"></v-sheet>
                    </v-sheet>
                </div>
            </v-card-text>
            <template v-slot:actions>
                <v-btn class="ml-auto" variant="tonal" text="Close" @click="$emit('update:modelValue', false)"
                    size="large"></v-btn>
            </template>
        </v-card>
    </v-dialog>
</template>