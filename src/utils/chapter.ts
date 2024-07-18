import { formatStringNumber, _range } from "@/utils/number";
import { Chapter } from "@/types/chapter";

export const TOTAL_CHAPTERS = 114;

export const getAllChapters = (): Promise<Chapter[]> => {
  return new Promise((resolve, reject) => {
    try {
      import("@/json/chapters.json").then((response) => {
        resolve(response.chapters);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const getChapter = (chapterData: Chapter[], chapterId: number) => {
  return chapterData.find((chapter) => chapter.id === chapterId);
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
  chapterData: Chapter[],
  chapterId: string
): string[] | undefined => {
  const chapterNumberString = formatStringNumber(chapterId);
  const chapter = chapterData.find((ch) => ch.id === Number(chapterId));
  if (chapter) {
    return _range(chapter.versesCount, 0).map(
      (verseId) => `${chapterNumberString}:${verseId + 1}`
    );
  }
};

type ReturnObject = {
  nameArabic: string;
  nameSimple: string;
  bismillahPre: boolean;
};

export const getChapterNameByChapterId = (
  chapterData: Chapter[],
  chapterId: number
): ReturnObject | undefined => {
  const chapter = getChapter(chapterData, chapterId);
  if (chapter) {
    return {
      nameSimple: chapter.nameSimple,
      nameArabic: chapter.nameArabic,
      bismillahPre: chapter.bismillahPre,
    };
  }
};
