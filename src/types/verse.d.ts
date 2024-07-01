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
  text_indopak: string;
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
    text_indopak: string;
    text_imlaei: string;
    location: string;
    text: string;
    code_v1: string;
    code_v2: string;
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

export { Verse };
