<script setup lang="ts">
import { ref, watch, inject } from "vue"
// stores
import { useTranslationsStore } from "@/stores/TranslationsStore";

const translationsStore = useTranslationsStore()
const selectedTranslationIds = ref<number[]>([131]);
const translationDrawer = inject<boolean>("translationDrawer")

const emit = defineEmits<{
    "update:translationDrawer": [value: boolean];
    "update:selectedTranslations": [value: number[]];
}>()

watch(selectedTranslationIds, (selected) => {
    if (selected) {
        emit("update:selectedTranslations", selected)
    }
})

</script>

<template>
    <v-navigation-drawer location="right" v-model="translationDrawer" disable-resize-watcher
        @update:model-value="translationDrawer =  $event">
        <div class="d-flex ma-2">
            <v-sheet class="me-auto my-auto text-h6">
               <v-icon icon="mdi-translate"></v-icon> {{ $tr.line('translationNav.Translations') }}</v-sheet>
            <v-btn icon="mdi-close" variant="text" class="my-auto"
                @click="translationDrawer = false"></v-btn>
        </div>
        <v-divider :thickness="1" color="orange" class="my-2"></v-divider>
        <v-list lines="two">
            <v-sheet v-for="(items, i) in translationsStore.translations" :key="i">
                <v-list-subheader> {{ i.toString().toUpperCase() }}</v-list-subheader>
                <v-list-item v-for="item in items" :key="item.id" :value="item.name">
                    <template #prepend>
                        <v-list-item-action start>
                            <v-checkbox-btn v-model="selectedTranslationIds" :value="item.id"></v-checkbox-btn>
                        </v-list-item-action>
                    </template>
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item>
                <v-divider color="orange" :thickness="2"></v-divider>
            </v-sheet>
        </v-list>
    </v-navigation-drawer>
</template>