import {
  verseWordFields,
  verseFields,
  verseTranslationFields,
} from "@/utils/verse";

// Audio
const audioUrl = import.meta.env.VITE_API_QDC_URL + "/audio/reciters/";
export const audioRecitersUrl = (
  reciterID: number,
  audioID: number
): string => {
  return (
    audioUrl + reciterID + "/audio_files?chapter=" + audioID + "&segments=true"
  );
};

export const recitationsUrl = audioUrl;

export const AVATAR_PLACEHOLDER_API = "https://ui-avatars.com/api/";

export const makeChapterInfoUrl = (id: number, locale: string = "en") => {
  return `/chapters/${id}/info?language=${locale}`;
};
// Translations
export const makeTranslationsUrl = (locale: string = "en") => {
  return "/resources/translations?language=" + locale;
};
// Verses
const urlFields = `&words=true&translation_fields=${verseTranslationFields.join(
  ","
)}&fields=${verseFields.join(",")}&word_fields=${verseWordFields.join(",")}`;

export const getVersesUrl = (
  key: string,
  id: number | string,
  translations: string,
  page?: number,
  limit?: number
) => {
  const currentPage = page ? "&page=" + page : "";
  const currentLimit = limit ? "&per_page" + limit : "";
  return `/verses/${key}/${id}?translations=${translations}&${urlFields}${currentPage}${currentLimit}`;
};
