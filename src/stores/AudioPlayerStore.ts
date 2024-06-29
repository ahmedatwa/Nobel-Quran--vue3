import { defineStore } from "pinia";
import { ref, onMounted, computed } from "vue";
import { useSurahStore } from "@/stores";
import { instance } from "@/axios";
import { useMemoize } from "@vueuse/core";
import type { AudioFiles, Recitations, mapRecitions } from "@/types";

export const useAudioPlayerStore = defineStore("audio-player-store", () => {
  const surahStore = useSurahStore();
  const isLoading = ref(false);
  const audioFiles = ref<AudioFiles | null>(null);
  const autoStartPlayer = ref(false);
  const chapterId = ref<number>(0);
  const selectedVerseKey = ref<string | undefined>("");
  const audioExperience = ref({ autoScroll: true, tooltip: false });
  const selectedReciter = ref<Recitations>({
    id: 7,
    reciter_id: 6,
    name: "Mishari Rashid al-`Afasy",
    translated_name: {
      name: "Mishari Rashid al-`Afasy",
      language_name: "english",
    },
    style: {
      name: "Murattal",
      language_name: "english",
      description:
        "Murattal is Quranic recitation at a slower pace, used for study and practice.",
    },
    qirat: {
      name: "Hafs",
      language_name: "english",
    },
  });
  const playbackSpeeds = ref([
    "0.25",
    "0.5",
    "0.75",
    "Normal",
    "1.25",
    "1.5",
    "1.75",
    "2",
  ]);
  const recitations = ref<Recitations[]>([]);
  const verseTiming = ref<{
    chapterId: number;
    verseKey: String;
    inRange: boolean;
    wordLocation: number;
  }>({
    chapterId: chapterId.value,
    verseKey: "",
    inRange: false,
    wordLocation: 0,
  });

  const chapterName = computed(() => {
    if (audioFiles.value) {
      const found = surahStore.surahList?.find((s) => s.id === chapterId.value);
      if (found) return found.name_simple;
    }
  });

  const getAudio = useMemoize(
    async (payload: { audioID: number; verseKey?: string }) => {
      //https://api.qurancdn.com/api/qdc/audio/reciters/9/audio_files?chapter=1&segments=true
      // if (payload.audioID === chapterId.value) return;
      chapterId.value = payload.audioID;
      selectedVerseKey.value = payload.verseKey;
      console.log("audioID", payload.audioID);

      isLoading.value = true;
      await instance
        .get(
          `https://api.qurancdn.com/api/qdc/audio/reciters/${selectedReciter.value.id}/audio_files?chapter=${payload.audioID}&segments=true`
        )
        .then((response) => {
          audioFiles.value = response.data.audio_files[0];
        })
        .catch((e) => {
          throw e;
        })
        .finally(() => {
          isLoading.value = false;
        });
    }
  );

  const getRecitations = useMemoize(async () => {
    // https://api.qurancdn.com/api/qdc/audio/reciters?locale=en
    await instance
      .get("https://api.qurancdn.com/api/qdc/audio/reciters?locale=en")
      .then((response) => {
        recitations.value = response.data.reciters;
      })
      .catch((e) => {
        console.log(e);
      });
  });

  const getRecition = (reciter: Recitations) => {
    selectedReciter.value = reciter;
    getAudio({ audioID: reciter.id });
  };

  const playNext = async () => {
    if (chapterId.value) {
      chapterId.value = chapterId.value >= 114 ? 1 : chapterId.value + 1;
      await getAudio({ audioID: chapterId.value });
    }
  };
  const playPrevious = async () => {
    if (chapterId.value) {
      chapterId.value = chapterId.value - 1;
      await getAudio({ audioID: chapterId.value });
    }
  };

  onMounted(() => {
    getRecitations();
  });

  const mapRecitions = computed((): mapRecitions[] | undefined => {
    if (recitations.value) {
      return recitations.value.reduce((o: any, i) => {
        (o[i.style.name as keyof typeof o] =
          o[i.style.name as keyof typeof o] || []).push(i);
        return o;
      }, {});
    }
  });

  return {
    audioFiles,
    isLoading,
    playbackSpeeds,
    selectedReciter,
    recitations,
    chapterName,
    chapterId,
    autoStartPlayer,
    selectedVerseKey,
    mapRecitions,
    verseTiming,
    audioExperience,
    getRecitations,
    getAudio,
    getRecition,
    playNext,
    playPrevious,
  };
});
