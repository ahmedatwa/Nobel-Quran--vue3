import { formatStringNumber, _range } from "@/utils/number";
import { Verse } from "@/types/verse";
import { Chapter } from "@/types/chapter";

export const TOTAL_CHAPTERS = 114;

export const getAllChapters = (): Promise<Chapter[]> => {
  return new Promise((resolve, reject) => {
    try {
      import("@/json/chapters.json").then((data) => {
        resolve(data.chapters);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const getChapter = (chaptersData: Chapter[], chapterId: number) => {
  return chaptersData.find((chapter) => chapter.id === chapterId);
};
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
  chapter: Chapter,
  chapterId: string
): string[] | undefined => {
  const chapterNumberString = formatStringNumber(chapterId);
  return _range(chapter.versesCount, 0).map(
    (verseId) => `${chapterNumberString}:${verseId + 1}`
  );
};

/**
 *
 * @param chapterId
 * @returns
 */
type ReturnObject = {
  nameArabic: string;
  nameSimple: string;
  bismillahPre: boolean;
};

export const getChapterNameByChapterId = (
  chaptersData: Chapter[],
  chapterId: number
): ReturnObject | undefined => {
  const chapter = getChapter(chaptersData, chapterId);
  if (chapter) {
    return {
      nameSimple: chapter.nameSimple,
      nameArabic: chapter.nameArabic,
      bismillahPre: chapter.bismillahPre,
    };
  }
};

export const getFirstVerseOfChapter = (verses: Verse[]) => {
  if (verses) return verses[0];
};

export const getChapterBySlug = (slug: string) => {};
