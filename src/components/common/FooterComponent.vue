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
                A0twa | {{ year }} — <strong>Quran</strong>
            </v-col>
        </v-row>
    </v-footer>
</template>