import { formatStringNumber, _range } from "@/utils/number";

interface verseMap {
  [key: number]: string;
}
const COLON_SPLITTER = ":";
/**
 * Given list of verses, get all the first and the last verseKeys
 *
 * @param '{verseMap}'
 * @returns number
 */
export const getFirstVerseNumberInJuz = (
  versesMap: verseMap
): number | undefined => {
  if (versesMap) {
    for (const key in versesMap) {
      const element = versesMap[key];
      return Number(element.split("-")[0]);
    }
  }
};

export const isVerseKeyWithinRanges = (verseKey: string, range?: string[]) => {
  if (range) return range.includes(verseKey);
};

export const isVerseNumberWithinRanges = (
  verseNumber: number,
  range: number[]
) => {
  const min = range[0];
  const max = range.slice(-1)[0];
  return verseNumber >= min && verseNumber <= max;
};
/**
 * Get the verse number from its key. A key is the combination between the verse's chapter
 * and its number separated by ":" e.g. 1:5.
 *
 * @param {string} verseKey
 * @returns {number} The verse number extracted from the key.
 */
export const getVerseNumberFromKey = (verseKey: string): number =>
  Number(verseKey.split(COLON_SPLITTER)[1]);

/**
 * Get the chapter and verse number of a verse from its key.
 *
 * @param {string} verseKey
 * @returns {[string, string]} The verse number extracted from the key.
 */
export const getVerseAndChapterNumbersFromKey = (
  verseKey: string
): [string, string] => {
  const splits = verseKey.split(COLON_SPLITTER);
  return [splits[0], splits[1]];
};

/**
 * Split the word's location and get the surahNumber, verseNumber and wordNumber.
 *
 * @param {string} wordLocation the word location {surahNumber}:{verseNumber}:{wordNumber}
 * @returns {[string, string, string]}
 */
export const getWordDataByLocation = (
  wordLocation: string
): [string, string, string] => {
  const locationSplits = wordLocation.split(COLON_SPLITTER);
  return [locationSplits[0], locationSplits[1], locationSplits[2]];
};

/**
 * make verseKey from chapterNumber and verseNumber, example "1:5"
 *
 * @param {number|string} chapterNumber
 * @param {number|string} verseNumberOrRangeFrom
 * @param {number|string} rangeTo
 * @returns {string}
 */
export const makeVerseKey = (
  chapterNumber: number | string,
  verseNumberOrRangeFrom: number | string,
  rangeTo?: number | string
): string => {
  if (rangeTo && verseNumberOrRangeFrom !== rangeTo) {
    return `${chapterNumber}:${verseNumberOrRangeFrom}-${rangeTo}`;
  }

  return `${chapterNumber}:${verseNumberOrRangeFrom}`;
};

/**
 * make wordLocation from verseKey and wordPosition, example "1:1:2"
 *
 * @param {string} verseKey
 * @param {string} wordPosition
 * @returns {string} wordLocation
 */
export const makeWordLocation = (
  verseKey: string,
  wordPosition: number
): string => `${verseKey}:${wordPosition}`;

/**
 * If the verse is a range of verses, for example 1:3-5
 * we'll return {surah: 1, from: 3, to: 5}
 *
 * @param {string} verseKey
 * @returns {surah: number, from: Number, to: Number}
 */
export const getVerseNumberRangeFromKey = (
  verseKey: string
): { surah: number; from: number; to: number } => {
  const splits = verseKey.split(COLON_SPLITTER);
  const surahNumber = splits[0];
  const verseNumber = splits[1]; // for example (3-5)
  const [from, to] = verseNumber.split("-"); // for example [3, 5]
  return {
    surah: Number(surahNumber),
    from: Number(from),
    to: to ? Number(to) : Number(from),
  };
};

/**
 * This will generate all the keys for the verses of a chapter. a key is `{chapterId}:{verseId}`.
 *
 * @param {string} chapterId
 * @returns {string[]}
 */
export const generateChapterVersesKeys = (
  versesCount: number,
  chapterId: string
): string[] | undefined => {
  const chapterNumberString = formatStringNumber(chapterId);
  return _range(versesCount, 0).map(
    (verseId) => `${chapterNumberString}:${verseId + 1}`
  );
};

export const getChapterIdfromKey = (key: string) => {
  return Number(key.split(COLON_SPLITTER)[0]);
};


export const verseFields = [
  "id",
  "chapter_id",
  "verse_number",
  "verse_key",
  "verse_index",
  "text_uthmani",
  "text_uthmani_simple",
  "text_imlaei",
  "text_imlaei_simple",
  "text_indopak",
  "text_uthmani_tajweed",
  "juz_number",
  "hizb_number",
  "rub_number",
  "sajdah_type",
  "sajdah_number",
  "page_number",
  "image_url",
  "image_width",
  "v1_page",
  "v2_page",
];

export const verseWordFields = [
  "id",
  "position",
  "text_uthmani",
  "text_indopak",
  "text_imlaei",
  "verse_key",
  "page_number",
  "page_number",
  "line_number",
  "audio_url",
  "location",
  "char_type_name",
  "code_v1",
  "code_v2",
  "v1_page",
  "v2_page ",
];

export const verseTranslationFields = [
  "resource_id",
  "resource_name",
  "id",
  "text",
  "verse_id",
  "language_id",
  "language_name",
  "verse_key",
  "chapter_id",
  "verse_number",
  "juz_number",
  "hizb_number",
  "rub_number",
  "page_number",
];
