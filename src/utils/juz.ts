import jsonJuzsData from "@/json/juz-to-chapter-mappings.json";
import jsonChaptersData from "@/json/chapters.json";

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

