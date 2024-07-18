// import { formatStringNumber, _range } from "@/utils/number";
// import { Chapter } from "@/types/chapter";

// export const TOTAL_CHAPTERS = 114;

// export const getAllChapters = (): Promise<Chapter[]> => {
//   return new Promise((resolve, reject) => {
//     try {
//       import("@/json/chapters.json").then((response) => {
//         resolve(response.chapters);
//       });
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

// /**
//  *
//  * @param chapterId
//  * @returns  {Chapter}
//  */
// export const getChapter = (chapterId: number) => {
//   const chapter: Chapter[] = [];
//   getAllChapters().then((response) => {
//     response.forEach((c) => {      
//       if (c.id === chapterId) {
//         chapter.push(c);
//       }
//     });
//   });
//   return chapter[0];
// };

// console.log(getChapter(2));

// /**
//  * Given a pageId, get chapter ids from a json file
//  *
//  * @param {string} pageId
//  * @returns {Promise<string[]>} chapterIds
//  */
// type DataPage = {
//   default: {
//     [key: string]: string[];
//   };
// };

// export const getChapterIdsForPage = (
//   pageId: string | number
// ): Promise<string[]> => {
//   return new Promise((res) => {
//     import(`@/json/page-to-chapter-mappings.json`).then((data: DataPage) => {
//       res(data.default[pageId]);
//     });
//   });
// };



/**
 *
 * @param chapterId
 * @returns
 */
// export const getChapterNameByChapterId = async (chapterId: number) => {
//   const chapter = await getChapter(chapterId);
//   return {
//     nameSimple: chapter.nameSimple,
//     nameArabic: chapter.nameArabic,
//     bismillahPre: chapter.bismillahPre,
//   };
// };
