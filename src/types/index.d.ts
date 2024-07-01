

// interface ChapterInfo {
//   id: number;
//   chapter_id: number;
//   language_name: string;
//   short_text: string;
//   source: string;
//   text: string;
// }

// type Pagination = Record<
//   | "per_page"
//   | "current_page"
//   | "next_page"
//   | "total_pages"
//   | "total_records"
//   | "totalRecordsFetched",
//   number
// >;

type Verse = {
  id: 1;
  chapter_id: number;
  manzil_number: number;
  ruku_number: number;
  verse_number: number;
  page_number: number;
  verse_key: string;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  sajdah_type: null;
  sajdah_number: null;
  text_uthmani: string;
  text_imlaei_simple: string;
  text_uthmani_simple: string;
  bookmarked?: boolean;
  words: {
    id: number;
    verse_key: string;
    position: number;
    audio_url: string;
    char_type_name: string;
    line_number: number;
    page_number: number;
    code_v1: string;
    text_uthmani: string;
    location: string;
    text: string;
    translation: {
      text: string;
      language_name: string;
    };
    transliteration: {
      text: string;
      language_name: string;
    };
  }[];
  translations: VerseTranslation[];
};

interface VerseTranslation {
  id: number;
  language_id: number;
  resource_id: number;
  resource_name: string;
  text: string;
  verse_key: string;
  verse_number: number;
}


interface AudioFile {
  id: number;
  chapter_id: number;
  file_size: number | null;
  format: string | null;
  total_files: number | null;
  audio_url: string;
}

interface Translation {
  id: number;
  name: string;
  author_name: string;
  slug: string;
  language_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

interface TranslationReduceMap {
  [key: string]: [Translation];
}


interface Tafsirs {
  id: integer;
  name: string;
  author_name: string;
  slug: string;
  language_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

interface Setting {
  autoStartPlayer: boolean;
  showVersesPages: string;
}

interface Juz {
  first_verse_id: number;
  id: number;
  juz_number: number;
  last_verse_id: number;
  verse_mapping: string[];
  verses_count: number;
  verses: Verse[]
  pagination: Pagination | null
  chapterInfo: ChapterInfo | null
  audioFile: AudioFiles | null
}

interface JuzDataParts {
  [key: number]: Verse[];
}

interface Page {
  [key: number]: Verse[]
}

interface HeaderData {
  left: string | undefined;
  right: {
    pageNumber: number | string;
    hizbNumber: number | string;
    juzNumber: number | string;
  } | null;
}

interface Languages {
  id: number;
  direction: string;
  iso_code: string;
  name: string;
  native_name: string;
  translated_names: {
    name: string;
    language_name: string;
  };
  translations_count: number;
}

interface Selected {
  key: string;
  value: Chapter | Juz;
}

// interface AudioFiles {
//   audio_url: string;
//   chapter_id: number;
//   duration: number;
//   file_size: number;
//   format: string;
//   id: number;
//   verse_timings: VerseTimings[];
// }

// interface VerseTimings {
//   duration: number;
//   timestamp_from: number;
//   timestamp_to: number;
//   verse_key: string;
//   inRange?: boolean;
//   wordLocation?: number;
//   segments: object[];
// }

interface CssVars {
  quranFrontSize: number;
  translationsFontSize: number;
  quranFontFamily: string;
  translationsFontFamily: string;
}

interface Pages {
  pageNumber: number,
  verses: Verse[]
}

export type {
  ChapterInfo,
  AudioFile,
  Verse,
  Translation,
  Tafsirs,
  Pagination,
  Setting,
  JuzDataParts,
  HeaderData,
  Languages,
  Selected,
  TranslationReduceMap,
  Juz,
  AudioFiles,
  VerseTimings,
  VerseTranslation,
  CssVars,
  Pages,
};

// interface ChapterScriptTreanslation {
//   id: number;
//   verse_key: string;
//   resource_id: number;
//   text: string;
// }

// interface Chapter {
//   id: number,
//   revelation_place: string,
//   revelation_order: number,
//   bismillah_pre: boolean,
//   name_simple: string,
//   name_complex: string,
//   name_arabic: string,
//   verses_count: number,
//   pages: number[],
//   translated_name: {
//       language_name: string,
//       name: string
//   }
// }
