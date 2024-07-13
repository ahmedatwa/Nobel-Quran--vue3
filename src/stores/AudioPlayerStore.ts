import { defineStore } from "pinia";
import { ref, onMounted, computed } from "vue";
// utils
import { getChapterNameByChapterId, TOTAL_CHAPTERS } from "@/utils/chapter";
import { setLoadingIInterval, clearLoadingInterval } from "@/utils/interval";
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
import { useSettingStore } from "@/stores";

export const useAudioPlayerStore = defineStore("audio-player-store", () => {
  const AVATAR_PLACEHOLDER_API = "https://ui-avatars.com/api/";
  const settingStore = useSettingStore();
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

  const getAudio = async (payload: PlayAudioEmit, audioSrc?: string) => {
    //https://api.qurancdn.com/api/qdc/audio/reciters/9/audio_files?chapter=1&segments=true
    // if (payload.audioID === chapterId.value) return;
    chapterId.value = payload.audioID;
    selectedVerseKey.value = payload.verseKey;
    audioPayLoadSrc.value = payload.audioSrc ? payload.audioSrc : audioSrc;
    isLoading.value = true;
    await instance
      .get(makeGetAudioRecitersUrl(selectedReciter.value.id, payload.audioID))
      .then((response) => {
        // this triggers verseTiming computed func in audioPlayer Component
        audioFiles.value = null;
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
        throw e;
      });
  };

  const getRecition = async (reciter: Recitations) => {
    selectedReciter.value = reciter;
    await getAudio({ audioID: chapterId.value });
  };

  /**
   * play next chapter and loaddata when needed
   * @param audioSrc 
   * @return void
   */
  const playNext = async (audioSrc?: string) => {
    if (chapterId.value) {
      settingStore.isAppLoading = true;
      setLoadingIInterval();
      chapterId.value =
        chapterId.value >= TOTAL_CHAPTERS ? 1 : chapterId.value + 1;
      // get the audio files
      await getAudio(
        { audioID: chapterId.value }, audioSrc);
      // TODO: Auto switch translations view with audio loop on
      // check chapter verses
      // const chapter = chapterStore.chaptersList.find(
      //   (c) => c.id === chapterId.value
      // );
      // fetch the chapter verses if not found
      // if (chapter) {
      //   if (!chapter.verses?.length) {
      //     await chapterStore.getVerses(chapter.id, true);
      //   }
      //   chapterStore.selectedChapter = chapter;
      // }

      // Clear Loading interval when data is ready
      if (audioFiles.value) {
        settingStore.isAppLoading = false;
        clearLoadingInterval();
      }
    }
  };

  const playPrevious = async () => {
    if (chapterId.value) {
      chapterId.value = chapterId.value - 1;
      await getAudio({ audioID: chapterId.value });
    }
  };

  onMounted(async () => {
    await getRecitations();
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

  // in case reciter avatar didn't load
  const getReciterNameInitials = computed(() => {
    if (selectedReciter.value) {
      const split = selectedReciter.value.name.split(" ");
      return split[0].charAt(0) + split[1].charAt(0);
    }
  });

  const avatarPlaceholder = computed(() => {
    return `${AVATAR_PLACEHOLDER_API}?name="${selectedReciter.value.name}`;
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
    audioPayLoadSrc,
    getReciterNameInitials,
    avatarPlaceholder,
    getRecitations,
    getAudio,
    getRecition,
    playNext,
    playPrevious,
  };
});
