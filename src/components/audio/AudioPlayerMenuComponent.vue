<script setup lang="ts">
import { watchEffect } from 'vue';
// axios
import { instance } from '@/axios';
// utils
import { updateStorageItem } from '@/utils/storage';
// types
import type { Recitations } from '@/types/audio';

const emit = defineEmits<{
    "update:modelValue": [value: boolean]
    "update:getRecitions": [value: Recitations]
    "update:playbackRate": [value: string]
}>()

const props = defineProps<{
    modelValue: boolean
    selectedReciter: number
    playbackSpeeds: string[]
    playbackRate: string | number
    recitions?: Recitations[]
    audioUrl?: string;
    audioFormat?: string | null;
    chapterName?: string;
    audioExperience: { autoScroll: boolean, tooltip: boolean }
}>()


const downloadFile = () => {
    instance({
        url: props.audioUrl,
        method: 'GET',
        responseType: 'blob',
    }).then((response) => {
        const href = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', props.chapterName + "." + props.audioFormat);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    });
}


watchEffect(() => {
    if (props.audioExperience){
        updateStorageItem("audio-player", {experience: props.audioExperience})
    }
})
</script>
<template>
    <v-menu :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
        :close-on-content-click="false" location="top" target="parent">
        <v-list>
            <v-list-group :value="$tr.line('audio.reciters')" prepend-icon="mdi-account">
                <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props" :title="$tr.line('audio.reciters')"></v-list-item>
                </template>
                    <v-list-item v-for="item in recitions" :key="item.id" :title="item.name"
                        :subtitle="item.style.name" :value="item.reciter_id" :active="selectedReciter === item.id"
                        @click="$emit('update:getRecitions', item)">
                    </v-list-item>
            </v-list-group>
            <!-- Playback Rate -->
            <v-list-group value="playbackSpeeds" prepend-icon="mdi-speedometer">
                <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props" :title="$tr.line('audio.playbackSpeed')"></v-list-item>
                </template>
                <v-list-item v-for="(v, k) in playbackSpeeds" :key="k" :title="v" :value="v"
                    :active="playbackRate === v" @click="$emit('update:playbackRate', v)"></v-list-item>
            </v-list-group>
           
            <!-- Expreience -->
            <v-list-group value="exprience" prepend-icon="mdi-tune">
                <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props" :title="$tr.line('audio.experience')"></v-list-item>
                </template>
                <v-list-item value="autoscroll">
                    <v-list-item-title>{{ $tr.line("audio.autoScroll") }}</v-list-item-title>
                    <template v-slot:prepend>
                        <v-list-item-action start>
                            <v-checkbox-btn v-model="audioExperience.autoScroll"></v-checkbox-btn>
                        </v-list-item-action>
                    </template>
                </v-list-item>
                <v-list-item value="tooltip">
                    <v-list-item-title>{{ $tr.line("audio.tooltip") }}</v-list-item-title>
                    <template #prepend>
                        <v-list-item-action start>
                            <v-checkbox-btn v-model="audioExperience.tooltip"></v-checkbox-btn>
                        </v-list-item-action>
                    </template>
                </v-list-item>
            </v-list-group>
            <v-list-item prepend-icon="mdi-download-circle-outline" @click="downloadFile">
                {{ $tr.line('audio.download') }}</v-list-item>
        </v-list>
    </v-menu>
</template>