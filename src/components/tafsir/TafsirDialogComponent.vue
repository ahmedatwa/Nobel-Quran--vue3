<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useMemoize } from "@vueuse/core"
import { instance } from "@/axios";
// types
import type { Tafsirs, Verse } from "@/types"
import axios from "axios";

const tafsirs = ref<Tafsirs[] | null>(null)
const selectedLanguage = ref('English')
const isLoading = ref(false)
const tafsir = ref<any | null>(null)
const fontSize = ref(1)

defineEmits<{
    "update:modelValue": [value: boolean]
}>()

const props = defineProps<{
    activator: string
    //modelValue: boolean
    verse: Verse
}>()

const selection = computed(() => {
    if (tafsirs.value)
        return [...new Set(tafsirs.value.map(obj => obj.language_name.charAt(0).toUpperCase() + obj.language_name.slice(1)))]
});

const getTafsirs = useMemoize(async () => {
    isLoading.value = false
    instance.get(`resources/tafsirs`).then((res) => {
        tafsirs.value = res.data.tafsirs
    }).catch((e) => {
        throw e
    }).finally(() => {
        isLoading.value = false
    })
})

const getTafsir = (slug: string) => {
    // https://tafsirs/en-tafisr-ibn-kathir/by_ayah/1:1
    if (tafsirs.value) {
        isLoading.value = false
        instance({
            baseURL: `https://api.qurancdn.com/api/qdc/tafsirs/${slug}/by_ayah/${props.verse.verse_key}?words=true&word_fields=verse_key,verse_id,page_number,location,text_uthmani,code_v1,qpc_uthmani_hafs`,
            method: "GET"
        }).then((res) => {
            tafsir.value = res.data.tafsir
        }).catch((e) => {
            throw e
        }).finally(() => {
            isLoading.value = false
        })
    }
}

// watchEffect(async () => {
//     if (props.modelValue) {
//         await getTafsirs()
//     }
// })
onMounted(async () => {
    await getTafsirs()
    // await Promise.all([
    //     getTafsirs(),
    //     getTafsir("en-tafisr-ibn-kathir")
    // ])
})

const tafsirRTLMap = computed(() => {
    if (tafsir.value) {
        console.log(tafsir.value.slug);

        return tafsir.value.slug.slice(0, 2)
    }
})

</script>
<template>
    <v-dialog :activator="activator" width="800" :key="verse.id">

        <!-- <v-card prepend-icon="mdi-update" :title="$tr.line('tafsir.title')" class="mx-auto" width="500"
                v-if="!tafsirs">
                <v-container style="height: 400px;">
                    <v-row align-content="center" class="fill-height" justify="center">
                        <v-col class="text-subtitle-1 text-center" cols="12">
                            {{ $tr.line("tafsir.loading") }}
                        </v-col>
                        <v-col cols="6">
                            <v-progress-linear color="primary" height="6" indeterminate rounded></v-progress-linear>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card> -->
        <v-card :loading="isLoading">
            <v-card-title class="d-flex">
                <div class="me-auto">
                    <v-icon icon="mdi-update"></v-icon> {{ $tr.line('tafsir.title') }}
                </div>
                <v-btn variant="text" class="ms-auto" icon="mdi-close"
                    @click="$emit('update:modelValue', false)"></v-btn>
            </v-card-title>
            <v-card-text>
                <v-select :items="selection" v-model="selectedLanguage" density="compact" hide-details></v-select>
                <v-divider :thickness="2" class="mb-3" color="orange"></v-divider>
                <span v-for="item in tafsirs" :key="item.id" class="mb-3">
                    <v-chip class="ma-1" v-if="item.language_name === selectedLanguage.toLowerCase()"
                        @click="getTafsir(item.slug)">
                        {{ item.name }}
                    </v-chip>
                </span>
                <v-sheet class="mt-4 text-body-2">
                    <v-divider :thickness="2" color="orange"></v-divider>
                    <v-btn :disabled="fontSize === 1" icon="mdi-minus" variant="text" class="d-inline"
                        @click="fontSize--"></v-btn>
                    <input class="d-inline mx-2" v-model="fontSize" style="width: 18px;" disabled>
                    <v-btn :disabled="fontSize === 10" icon="mdi-plus" variant="text" class="d-inline"
                        @click="fontSize++"></v-btn>
                    <div v-if="tafsir">

                        <span v-for="word in tafsir.verses[verse.verse_key].words" :key="word.id">
                            <span class="mx-1 d-inline float-right mt-4">{{ word.text_uthmani }}</span>
                        </span>
                    </div>
                    <v-divider :thickness="2" color="orange"></v-divider>
                </v-sheet>
                <v-sheet :style="{ 'font-size': (fontSize + 15) + 'px' }">
                    <!-- <v-sheet v-if="tafsirRTLMap === 'ar'">
                        <p class="text-right" v-html="tafsir.text"></p>
                    </v-sheet> -->
                    <v-sheet>
                        <p v-html="tafsir.text"></p>
                    </v-sheet>
                </v-sheet>
            </v-card-text>
            <template v-slot:actions>
                <v-btn class="ml-auto" text="Close" @click="$emit('update:modelValue', false)"></v-btn>
            </template>
        </v-card>

    </v-dialog>
</template>