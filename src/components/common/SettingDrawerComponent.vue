<script setup lang="ts">
import { useTranslationsStore, useSettingStore, useAudioPlayerStore } from "@/stores";

// stores
const translationsStore = useTranslationsStore()
const settingStore = useSettingStore()
const audioPlayerStore = useAudioPlayerStore()

defineProps<{
    settingsDrawer: boolean
}>()

const emit = defineEmits<{
    "update:settingsDrawer": [value: boolean];
}>()


</script>
<template>
    <v-navigation-drawer location="right" :model-value="settingsDrawer" disable-resize-watcher
        @update:model-value="emit('update:settingsDrawer', $event)" width="330">
        <template #prepend>
            <div class="d-flex ma-2">
                <v-sheet class="me-auto my-auto text-h6"><v-icon icon="mdi-cogs"></v-icon> {{ $tr.line('setting.title')
                    }}</v-sheet>
                <v-btn icon="mdi-close" variant="text" class="my-auto"
                    @click="emit('update:settingsDrawer', false)"></v-btn>
            </div>
        </template>
        <v-card class="ma-3">
            <v-divider color="orange" :thickness="2"></v-divider>
            <v-card-text class="mx-2">
                <p class="text-subtitle-2 mb-2">{{ $tr.line("setting.audioPlayer") }}</p>
                <v-switch :label="$tr.line('setting.autoplay')" color="primary" v-model="settingStore.autoPlay"
                    hide-details></v-switch>
                <v-switch :label="$tr.line('setting.playerFullWidth')" color="primary" v-model="settingStore.inset"
                    :false-value="true" :true-value="false" hide-details></v-switch>

                <v-select v-model="audioPlayerStore.selectedReciter" :label="$tr.line('setting.reciter')"
                    :items="audioPlayerStore.recitations" item-title="name" item-value="reciter_id" return-object>
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :subtitle="item.raw.style.name"
                            :title="item.raw.name"></v-list-item>
                    </template>
                </v-select>

                <v-divider class="mb-2"></v-divider>
                <p class="text-subtitle-2 mb-3">{{ $tr.line("setting.quran") }}</p>
                <v-select label="Verses Per Page" :items="settingStore.versesPages" v-model="settingStore.VersesPerPage"
                    hide-details></v-select>
                <v-divider class="mb-2"></v-divider>
                <v-sheet class="">
                    <div class="my-3">
                        <v-select label="Font" :items="settingStore.fontFamilyGroup"
                            v-model="settingStore.cssVars.quranFontFamily" hide-details></v-select>
                    </div>
                    <v-sheet id="quran-font-size" class="d-flex justify-center my-3">
                        <div class="ma-2 py-5">{{ $tr.line('setting.fontSize') }}</div>
                        <div class="ma-2 pa-2"><v-btn icon="mdi-minus" class="d-inline" variant="plain"
                                @click="settingStore.cssVars.quranFrontSize--"
                                :disabled="settingStore.cssVars.quranFrontSize === 1"></v-btn>
                            <input class="d-inline mx-2" style="width: 15px;"
                                v-model="settingStore.cssVars.quranFrontSize" disabled>
                            <v-btn icon="mdi-plus" class="d-inline" variant="plain"
                                @click="settingStore.cssVars.quranFrontSize++"
                                :disabled="settingStore.cssVars.quranFrontSize === 10"></v-btn>
                        </div>

                    </v-sheet>
                </v-sheet>
                <v-divider class="mb-2"></v-divider>
                <v-sheet class="ma-2">
                    <p class="text-subtitle-2 mb-3">{{ $tr.line("setting.translation") }}</p>
                    <div class="mb-3 mx-2">
                        <v-btn-toggle v-model="settingStore.cssVars.translationsFontFamily" variant="outlined" divided
                            :elevation="1">
                            <v-btn v-for="(v, k) in settingStore.fontFamilyGroup" :key="k" :value="v">
                                {{ v }}
                            </v-btn>
                        </v-btn-toggle>
                    </div>
                    <v-sheet id="translations-font-size" class="d-flex justify-center my-3">
                        <div class="ma-2 py-5">{{ $tr.line('setting.fontSize') }}</div>
                        <div class="ma-2 pa-2">
                        <v-btn icon="mdi-minus" class="d-inline" variant="plain"
                            @click="settingStore.cssVars.translationsFontSize--"
                            :disabled="settingStore.cssVars.translationsFontSize === 1"></v-btn>
                        <input class="d-inline mx-2" style="width: 15px;"
                            v-model="settingStore.cssVars.translationsFontSize" disabled>
                        <v-btn icon="mdi-plus" class="d-inline" variant="plain"
                            @click="settingStore.cssVars.translationsFontSize++"
                            :disabled="settingStore.cssVars.translationsFontSize === 10"></v-btn>
                            </div>
                    </v-sheet>
                </v-sheet>
                <v-btn variant="outlined" class="pa-2 ma-2" block>
                    <v-sheet class="text-body-2">{{ translationsStore.groupedTranslationsAuthors }}</v-sheet>
                    <v-menu activator="parent" :close-on-content-click="false">
                        <v-list lines="two">
                            <v-sheet v-for="(items, i) in translationsStore.translations" :key="i">
                                <v-list-subheader> {{ i.toString().toUpperCase() }}</v-list-subheader>
                                <v-list-item v-for="item in items" :key="item.id" :value="item.name">
                                    <template #prepend>
                                        <v-list-item-action start>
                                            <v-checkbox-btn v-model="translationsStore.selectedTranslationIds"
                                                :value="item.id"></v-checkbox-btn>
                                        </v-list-item-action>
                                    </template>
                                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                                </v-list-item>
                                <v-divider color="orange" :thickness="2"></v-divider>
                            </v-sheet>
                        </v-list>
                    </v-menu>
                </v-btn>
            </v-card-text>
        </v-card>
    </v-navigation-drawer>
</template>