import { formatStringNumber, _range } from "@/utils/number";
import jsonChaptersData from "@/json/chapters.json";

/**
 * Given a pageId, get chapter ids from a json file
 *
 * @param {string} pageId
 * @returns {Promise<string[]>} chapterIds
 */
type DataPage = {
  default: {
    [key: string]: string[];
  };
};

export const getChapterIdsForPage = (
  pageId: string | number
): Promise<string[]> => {
  return new Promise((res) => {
    import(`@/json/page-to-chapter-mappings.json`).then((data: DataPage) => {
      res(data.default[pageId]);
    });
  });
};

/**
 * This will generate all the keys for the verses of a chapter. a key is `{chapterId}:{verseId}`.
 *
 * @param {string} chapterId
 * @returns {string[]}
 */
export const generateChapterVersesKeys = (
  chapterId: string
): string[] | undefined => {
  const chapterNumberString = formatStringNumber(chapterId);
  const chapter = jsonChaptersData.chapters.find(
    (ch) => ch.id === Number(chapterId)
  );
  if (chapter) {
    return _range(chapter.verses_count, 0).map(
      (verseId) => `${chapterNumberString}:${verseId + 1}`
    );
  }
};

type ReturnObject = {
  nameArabic: string;
  nameSimple: string;
  bismillahPre: boolean;
};
export const getChapterNameByChapterId = (chapterId: number): ReturnObject | undefined => {
  const chapter = jsonChaptersData.chapters.find((c) => c.id === Number(chapterId));  
  if (chapter) {
   return {
      nameSimple: chapter.name_simple,
      nameArabic: chapter.name_arabic,
      bismillahPre: chapter.bismillah_pre,
    };
  }
};
