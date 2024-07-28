interface Translation {
    id: number;
    name: string;
    author_name: string;
    slug: string | null;
    language_name: string;
    translated_name: {
      name: string;
      language_name: string;
    };
  }

  interface TranslationReduceMap {
    [key: string]: [Translation];
  }

  export {
    Translation,
    TranslationReduceMap
  }