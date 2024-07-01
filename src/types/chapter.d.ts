import { Verse } from "./verse";
import { AudioFile } from "./audio";

interface Chapter {
  id: number;
  revelationOrder: number;
  revelationPlace: string;
  versesCount: number;
  bismillahPre: boolean;
  pages: Number[];
  nameSimple: string;
  nameArabic: string;
  nameComplex: string;
  translatedName: TranslatedName;
  versesCount: number;
  verses?: Verse[];
  audioFile?: AudioFile | null;
  chapterInfo?: ChapterInfo | null;
  pagination?: Pagination | null;
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

type ChapterInfo = {
  id: number;
  chapter_id: number;
  language_name: string;
  short_text: string;
  source: string;
  text: string;
};

type Slug = {
  slug: string;
  locale: string;
};

type TranslatedName = {
  name: string;
  languageName: string;
};

type Loading = {
  chapters: boolean;
  verses: boolean;
  info: boolean;
  length: number
}

interface ChapterSchema {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
  verses: Verse[];
  pagination: Pagination | null
  chapterInfo: ChapterInfo | null
  audioFile: AudioFiles | null
}

export { Chapter, ChapterInfo, Loading, ChapterSchema };
