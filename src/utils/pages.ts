import jsonPagesChaptersMappingData from "@/json/page-to-chapter-mappings.json";
import jsonChaptersData from "@/json/chapters.json";
import { localizeNumber } from "@/utils/number";
import type { Page } from "@/types/page";

export const DEFAULT_NUMBER_OF_PAGES = 604;

/**
 * get getAllPageMappings for all Pages
 *
 * @returns {[juz: string]: Page2ChaptersMapping}
 */

export const getPages2ChaptersMappings = () => {
  return jsonPagesChaptersMappingData;
};
/**
 * get the chapter name for page
 * @param pageId
 * @returns
 */
type ChaptersMap = {
  id: number;
  nameArabic: string;
  nameSimple: string;
};
const getChaptersForPage = (
  pageId: string | number
): ChaptersMap[] | undefined => {
  const chapters = [];
  const chapter = jsonChaptersData.chapters.find(
    (chapter) => chapter.id === Number(pageId)
  );
  if (chapter) {
    chapters.push({
      id: chapter.id,
      nameArabic: chapter.nameArabic,
      nameSimple: chapter.nameSimple,
    });
  }
  return chapters;
};

/**
 * return all pages
 * with type property
 */
export const getAllPages = (lang: string = "en"): Page[] => {
  return [...Array(DEFAULT_NUMBER_OF_PAGES)].map((__n, index) => {
    const page = index + 1;
    return {
      pageNumber: Number(localizeNumber(page, lang)),
      verses: [],
      pagination: null,
      chaptersMap: getChaptersForPage(page),
      audioFile: null,
    };
  });
};
