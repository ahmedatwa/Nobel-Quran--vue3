import { AudioFile } from "./audio";
import { Verse } from "./verse";

interface Juz {
  first_verse_id: number;
  id: number;
  juz_number: number;
  last_verse_id: number;
  verse_mapping: string[];
  verses_count: number;
  verses: Verse[] | null;
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

interface juzVersesByPageMap {
  [key: number]: Verse[];
}

interface JuzHeaderData {
  left?: { nameArabic: string; nameSimple: string; bismillahPre: boolean };
  right: {
    pageNumber: string | number;
    hizbNumber: string | number;
    juzNumber: string | number;
  };
}

type JuzVerseMapping = {
  [key: number]: string;
};

type JuzVersesIntersecting = {
  currentVerseNumber: number;
  lastVerseNumber: number;
};

export {
  Juz,
  JuzHeaderData,
  juzVersesByPageMap,
  JuzVerseMapping,
  JuzVersesIntersecting,
};
