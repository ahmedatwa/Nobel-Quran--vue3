<script setup lang="ts">
import { computed } from 'vue';

const year = computed(() => {
    return new Date().getFullYear()
})

</script>
<template>
    <v-footer>
        <v-row justify="center" no-gutters>
            <v-col class="text-center mx-auto" cols="12">
                Developed by A0twa | {{ year }} — <strong>The Nobel Quran</strong>
                <div class="flex-1-1-100">
                    <v-btn variant="text" href="https://github.com/ahmedatwa/Nobel-Quran--vue3/issues"
                        target="_blank"><v-icon icon="mdi-bug-check-outline"></v-icon> Bug
                        Report</v-btn>
                </div>
            </v-col>
        </v-row>
    </v-footer>
</template>