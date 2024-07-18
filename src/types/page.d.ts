import { Verse } from "./verse";

interface Page {
  pageNumber: number;
  verses: Verse[];
  chaptersMap?: {
    id: number;
    nameArabic: string;
    nameSimple: string;
  }[];
  pagination?: Pagination | null;
  audioFile?: AudioFiles | null;
}

type Pagination = Record<
  | "per_page"
  | "current_page"
  | "next_page"
  | "total_pages"
  | "total_records"
  | "totalRecordsFetched",
  number
>;

interface PageHeaderData {
  left: { nameArabic: string; nameSimple: string; bismillahPre: boolean } | undefined;
  right: {
    pageNumber: string | number;
    hizbNumber: string | number;
    juzNumber: string | number;
  };
}

type ChaptersForPage = {
  [key: string | number]: string[];
};

type ChaptersForPageReturnData = {
  chapterId: number;
  nameArabic: string;
  nameSimple: string;
};

type GroupVersesByChapterID = {
  [key: number]: Verse[]
}


export {
  Page,
  PageHeaderData,
  ChaptersForPage,
  ChaptersForPageReturnData,
  GroupVersesByChapterID,
};
