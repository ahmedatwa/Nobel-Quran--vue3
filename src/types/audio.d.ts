interface AudioFile {
  id: number;
  reciterId?: number;
  chapter_id: number;
  file_size: number | null;
  format: string | null;
  total_files: number | null;
  audio_url: string;
  verse_timings: VerseTimings[];
  duration: number;
}

type VerseTimingSegments = {
  [key: number]: number;
};

interface VerseTimings {
  duration: number;
  timestamp_from: number;
  timestamp_to: number;
  verse_key: string;
  inRange?: boolean;
  wordLocation?: string;
  verseNumber?: number | string;
  segments: VerseTimingSegments[];
}

type VerseTimingsProps = {
  chapterId: number;
  verseKey: String;
  verseNumber: number;
  inRange?: boolean;
  wordLocation: string;
  wordPosition: string | number;
  audioSrc?: string;
};

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

type IsAudioPlayingProps = {
  audioID: number;
  isPlaying?: boolean;
  format?: string;
} | null;

type PlayAudioEmit = { audioID: number; audioSrc?: string; verseKey?: string, pause?: boolean };

type BottomSheetProps = {
  scrim: boolean;
  scrollStrategy: NonNullable<"none" | "block">;
  noClickAnimation: boolean;
};

export {
  VerseTimings,
  AudioFile,
  Recitations,
  mapRecitions,
  VerseTimingsProps,
  IsAudioPlayingProps,
  PlayAudioEmit,
  BottomSheetProps,
  VerseTimingSegments,
};
