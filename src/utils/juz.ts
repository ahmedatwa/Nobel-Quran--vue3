import jsonJuzsData from "@/json/juz-to-chapter-mappings.json";
import jsonChaptersData from "@/json/chapters.json";
import type { Verse } from "@/types/verse";
import type { JuzVerseMapping } from "@/types/juz";

/**
 * Given a juzId, get chapters ids from a json file
 *
 * @param {string} juzId
 * @returns {string[]} chapterIds
 */
// export const getChapterIdForPage = async (pageId: string, index: number): Promise<string> => {
//  console.log(jsonPagesData);

// };
/**
 * Given a juzId, get chapters ids from a json file
 *
 * @param {string} juzId
 * @returns {string[]} chapterIds
 */
type Object = {
  nameArabic: string;
  nameSimple: string;
  bismillahPre: boolean;
};
export const getChapterNameByJuzId = (
  juzId: string | number | undefined,
  index: number
): Object => {
  const juzData = jsonJuzsData[juzId as keyof typeof jsonJuzsData];
  const chapterId = juzData[index];
  let object = {
    nameArabic: "",
    nameSimple: "string",
    bismillahPre: false,
  };

  jsonChaptersData.chapters.forEach((chapter) => {
    if (chapter.id === Number(chapterId)) {
      object = {
        nameSimple: chapter.name_simple,
        nameArabic: chapter.name_arabic,
        bismillahPre: chapter.bismillah_pre,
      };
    }
  });
  return object;
};

export const getFirstVerseOfJuzByPage = (verses: Verse[]) => {
  const first = verses[0];
  if (first) {
    return first.verse_key;
  }
};

export const getChapterAndVerseMappingForJuz = (
  juzNumber: number,
  verseMapping: JuzVerseMapping
) => {
  const array = [];
  for (const key in verseMapping) {
    const verses = verseMapping[key];

    array.push({
      juzNumber: juzNumber,
      chapter: getChapterNameByJuzId(juzNumber, Number(key)),
      verses,
    });
  }
  return array;
};
