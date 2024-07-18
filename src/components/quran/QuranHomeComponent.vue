<script setup lang="ts">

defineProps<{
    modelValue?: string
}>()

const emit = defineEmits<{
    "update:modelValue": [value: string]
    "update:selected": [value: boolean]
}>()

</script>
<template>

    <v-container>
        <v-row>
            <v-col cols="12" class="my-4">
                <v-sheet class="pa-4 text-center mx-auto" elevation="12" max-width="600" rounded="lg" width="100%">
                    <v-icon class="mb-5" color="primary" icon="mdi-book-open-page-variant-outline" size="112"></v-icon>
                    <h2 class='text-h5 mb-6'>{{ $tr.line("home.intoTitle") }}</h2>
                    <div>{{ $tr.line("home.introSubtitle") }}</div>
                </v-sheet>
            </v-col>
            <v-col cols="12">
                <v-card :rounded="true">
                    <v-tabs :model-value="modelValue" align-tabs="center" color="primary"
                        @update:model-value="$emit('update:modelValue', $event as string)" grow>
                        <v-tab value="c" prepend-icon="mdi-book-alphabet" :to="{ name: 'chaptersTab' }">{{
                            $tr.line('home.textChapters')
                        }} </v-tab>
                        <v-tab value="j" :to="{ name: 'juzsTab' }" prepend-icon="mdi-bookshelf">{{
                            $tr.line('home.textJuzs')
                            }}</v-tab>
                        <v-tab value="p" :to="{ name: 'pagesTab' }" prepend-icon="mdi-page-layout-sidebar-left">{{
                            $tr.line('home.textPages')
                        }}</v-tab>
                        <v-tab value="r" :to="{ name: 'relevationOrderTab' }"
                            prepend-icon="mdi-order-numeric-descending">
                            {{ $tr.line('home.textRelevation') }}</v-tab>

                    </v-tabs>
                    <RouterView @update:selected="$emit('update:selected', $event)"> </RouterView>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
   
</template>
<style scoped>
:deep(.v-skeleton-loader__image) {
    height: 86px !important;
}
</style>