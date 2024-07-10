import { defineStore } from "pinia";
import { ref, onMounted, computed, watch } from "vue";
// utils
import { getChapterNameByChapterId } from "@/utils/chapter";
//axios
import { instance, makeGetAudioRecitersUrl } from "@/axios";
import { makeGetRecitationsUrl } from "@/axios";
// types
import type { AudioFile, Recitations } from "@/types/audio";
import type {
  mapRecitions,
  VerseTimingsProps,
  PlayAudioEmit,
} from "@/types/audio";

export const useAudioPlayerStore = defineStore("audio-player-store", () => {
  const isLoading = ref(false);
  const audioFiles = ref<AudioFile | null>(null);
  const autoStartPlayer = ref(false);
  const chapterId = ref<number>(0);
  const audioPayLoadSrc = ref<string | undefined>("");
  const selectedVerseKey = ref<string | undefined>("");
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
  const verseTiming = ref<VerseTimingsProps>({
    chapterId: chapterId.value,
    verseKey: "",
    verseNumber: 0,
    inRange: false,
    wordLocation: "",
    audioSrc: "",
  });

  const chapterName = computed(() => {
    const chapter = getChapterNameByChapterId(chapterId.value);
    if (chapter) {
      return chapter.nameSimple;
    }
  });

  const getAudio = async (payload: PlayAudioEmit) => {
    //https://api.qurancdn.com/api/qdc/audio/reciters/9/audio_files?chapter=1&segments=true
    // if (payload.audioID === chapterId.value) return;
    chapterId.value = payload.audioID;
    selectedVerseKey.value = payload.verseKey;
    audioPayLoadSrc.value = payload.audioSrc;
    isLoading.value = true;
    await instance
      .get(makeGetAudioRecitersUrl(selectedReciter.value.id, payload.audioID))
      .then((response) => {
        audioFiles.value = response.data.audio_files[0];
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const getRecitations = async () => {
    // https://api.qurancdn.com/api/qdc/audio/reciters?locale=en
    await instance
      .get(makeGetRecitationsUrl())
      .then((response) => {
        recitations.value = response.data.reciters;
      })
      .catch((e) => {
        console.log(e);
      });
  };

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

  // watch(audioPayLoadSrc, (newSrc) => {
  //   if (newSrc) {
  //     if (newSrc.match("chapter")) {
  //       const split = newSrc.split("-")[1]

  //     } else if (newSrc.match("juz")) {
  //       console.log(newSrc);
  //     } else {
  //       console.log(newSrc);
  //     }
  //   }
  // });

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
    audioPayLoadSrc,
    getRecitations,
    getAudio,
    getRecition,
    playNext,
    playPrevious,
  };
});
