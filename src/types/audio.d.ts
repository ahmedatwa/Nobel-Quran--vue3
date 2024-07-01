interface AudioFile {
  id: number;
  chapter_id: number;
  file_size: number | null;
  format: string | null;
  total_files: number | null;
  audio_url: string;
  verse_timings: VerseTimings[];
  duration: number;
}

interface VerseTimings {
  duration: number;
  timestamp_from: number;
  timestamp_to: number;
  verse_key: string;
  inRange?: boolean;
  wordLocation?: number;
  segments: object[];
}

interface Recitations {
  id: number;
  reciter_id: number;
  name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
  style: {
    name: string;
    language_name: string;
    description: string;
  };
  qirat: {
    name: string;
    language_name: string;
  };
}

interface mapRecitions {
  [key: string]: Recitations;
}

export { VerseTimings, AudioFile, Recitations, mapRecitions };
