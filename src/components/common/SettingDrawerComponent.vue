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
            <v-divider :thickness="2"></v-divider>
            <v-card-text class="mx-2">
                <p class="text-subtitle-2 mb-2">{{ $tr.line("setting.audioPlayer") }}</p>
                <v-switch :label="$tr.line('setting.autoplay')" color="primary"
                    v-model="settingStore.audioPlayerSetting.autoPlay" hide-details></v-switch>
                <v-switch :label="$tr.line('setting.playerFullWidth')" color="primary"
                    v-model="settingStore.audioPlayerSetting.fullwidth" hide-details></v-switch>
                <v-switch :label="$tr.line('setting.dismissPlayer')" color="primary"
                    v-model="settingStore.audioPlayerSetting.dismissOnEnd" hide-details></v-switch>
                <!-- Reciters -->
                <v-sheet class="my-3">
                    <v-btn variant="tonal" block>
                        {{ audioPlayerStore.selectedReciter.name }}
                        <v-menu activator="parent">
                            <v-list>
                                <v-list-item v-for="reciter in audioPlayerStore.recitations" :key="reciter.reciter_id"
                                    @click="audioPlayerStore.getRecition(reciter)" :title="reciter.name"
                                    :subtitle="reciter.style.name">
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-btn>
                </v-sheet>
                <v-divider class="my-2" :thickness="2"></v-divider>
                <p class="text-subtitle-2 mb-3">{{ $tr.line("setting.quran") }}</p>
                <v-sheet class="d-flex flex-column">
                    <v-btn variant="tonal" block>
                        {{ settingStore.cssVars.quranFontFamily }}
                        <v-menu activator="parent">
                            <v-list>
                                <v-list-item v-for="(font, index) in settingStore.fontFamilyGroup" :key="index"
                                    :value="font" @click="settingStore.cssVars.quranFontFamily = font">
                                    <v-list-item-title>{{ font }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-btn>
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
                    <v-sheet>
                        <div class="ma-2 py-5">{{ $tr.line('setting.highlightedWord') }}</div>
                        <v-btn-toggle divided v-model="settingStore.highlightedWordColor">
                            <v-btn value="blue-darken-2">
                                <v-sheet color="blue-darken-2" height="20" width="26" tile></v-sheet>
                            </v-btn>
                            <v-btn value="deep-purple-lighten-1">
                                <v-sheet color="deep-purple-lighten-1" height="20" width="26" tile></v-sheet>
                            </v-btn>
                            <v-btn value="teal-lighten-1">
                                <v-sheet color="teal-lighten-1" height="20" width="26" tile></v-sheet>
                            </v-btn>
                            <v-btn value="orange-darken-1">
                                <v-sheet color="orange-darken-1" height="20" width="26" tile></v-sheet>
                            </v-btn>
                        </v-btn-toggle>
                    </v-sheet>
                </v-sheet>

                <v-divider class="my-2" :thickness="2"></v-divider>
                <v-sheet>
                    <p class="text-subtitle-2 mb-3">{{ $tr.line("setting.translation") }}</p>
                    <!-- <div class="my-3">
                        <v-select label="Font" :items="settingStore.fontFamilyGroup"
                        v-model="settingStore.cssVars.quranFontFamily" hide-details></v-select>
                    </div> -->
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
                <v-btn variant="tonal" class="pa-2 ma-2" block>
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