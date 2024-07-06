import { defineStore } from "pinia";
import { ref, computed, onMounted, watchEffect } from "vue";
// axios
import { instance } from "@/axios";
// types
import type { Tafsirs, SingleTafsir } from "@/types/chapter";

export const useTafsirStore = defineStore("tafsir-store", () => {
  const tafsirsAuthors = ref<Tafsirs[]>([]);
  const selectedLanguage = ref("English");
  const isLoading = ref(false);
  const tafsir = ref<SingleTafsir>();
  const tafsirSlug = ref("en-tafisr-ibn-kathir");
  const selectedVerseKey = ref("1:1");
  const fontSize = ref(1);
  const QDC_API = "https://api.qurancdn.com/api/qdc";
  const DEFAULT_TAFSIR_WORD_FIELDS = [
    "verse_key",
    "verse_id",
    "page_number",
    "location",
    "text_uthmani",
    "code_v1",
    "qpc_uthmani_hafs",
  ];

  const getTafsirs = async () => {
    isLoading.value = true;
    instance
      .get(`resources/tafsirs`)
      .then((res) => {
        tafsirsAuthors.value = res.data.tafsirs;
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const getTafsir = async (slug: string, verseKey: string) => {
    // https://tafsirs/en-tafisr-ibn-kathir/by_ayah/1:1
    isLoading.value = true;
    instance({
      baseURL: `${QDC_API}/tafsirs/${slug}/by_ayah/${verseKey}?words=true&word_fields=${DEFAULT_TAFSIR_WORD_FIELDS.join(
        ","
      )}`,
      method: "GET",
    })
      .then((res) => {
        tafsir.value = res.data.tafsir;
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const selection = computed(() => {
    return [
      ...new Set(
        tafsirsAuthors.value.map(
          (obj) =>
            obj.language_name.charAt(0).toUpperCase() +
            obj.language_name.slice(1)
        )
      ),
    ];
  });

  const tafsirRTLMap = computed(() => {
    if (tafsir.value) {
      return tafsir.value.slug.slice(0, 2);
    }
  });

  onMounted(async () => {
    if (!tafsirsAuthors.value.length) {
      await getTafsirs();
    }
  });

  watchEffect(async () => {
    if (tafsirSlug.value && selectedVerseKey.value) {
      await getTafsir(tafsirSlug.value, selectedVerseKey.value);
    }
  });
  return {
    getTafsirs,
    getTafsir,
    tafsirsAuthors,
    tafsirRTLMap,
    tafsir,
    selection,
    selectedLanguage,
    selectedVerseKey,
    tafsirSlug,
    fontSize,
    isLoading,
  };
});
