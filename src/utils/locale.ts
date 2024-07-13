/* eslint-disable max-lines */
/* eslint-disable import/prefer-default-export */
export const LANG_LOCALE_MAP = {
  en: "en-US",
  ar: "ar-EG",
  bn: "bn-BD",
  fa: "fa-IR",
  fr: "fr-FR",
  id: "id-ID",
  it: "it-IT",
  nl: "nl-NL",
  pt: "pt-BR",
  ru: "ru-RU",
  sq: "sq-AL",
  th: "th-TH",
  tr: "tr-TR",
  ur: "ur-PK",
  zh: "zh-CN",
  ms: "ms-MY",
};

export const LANGUAGES = [
  { key: "en", value: "English", rtl: false },
  { key: "ar", value: "Arabic", rtl: true },
];

/**
 * Get the full locale name with lang + country e.g. ar-SA or en-US.
 * fallback to en-US
 * @param {string} locale
 * @returns {string}
 */
export const getLangFullLocale = (locale?: string): string => {
  locale = locale ? locale : "en-US";
  return LANG_LOCALE_MAP[locale as keyof typeof LANG_LOCALE_MAP];
};
