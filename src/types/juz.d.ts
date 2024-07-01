import { AudioFile } from "./audio";
import { Verse } from "./verse";

interface Juz {
  first_verse_id: number;
  id: number;
  juz_number: number;
  last_verse_id: number;
  verse_mapping: string[];
  verses_count: number;
  verses?: Verse[] | null;
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

interface JuzDataParts {
  [key: number]: Verse[];
}

interface Pages {
  pageNumber: number;
  verses: Verse[];
}

export { Juz, Pages };
