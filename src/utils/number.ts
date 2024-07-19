import { getLangFullLocale } from "@/utils/locale";
/**
 * This function returns a number string after making sure
 * it's in the valid format. e.g.
 * 1   -> 1
 * 001 -> 1
 *
 * @param {string} number
 * @returns {string}
 */
export const formatStringNumber = (number: string): string =>
  String(Number(number));

/**
 * This function takes a fraction (a number between 0 and 1) and converts it to a percent number (limited to 100).
 *
 * @param {string | number} fraction a number between 0 and 1
 * @param {number} decimalPoints number of decimal points
 * @returns {number} a number between 0 and 100
 */
export const convertFractionToPercent = (
  fraction: string | number,
  decimalPoints = 1
): number => {
  const number = convertNumberToDecimal(Number(fraction) * 100, decimalPoints);
  return Math.min(number, 100);
};

/**
 * This function takes a number and converts it to a decimal number.
 *
 * @param {string | number} number
 * @param {number} decimalPoints number of decimal points
 * @returns {number}
 */
export const convertNumberToDecimal = (
  number: string | number,
  decimalPoints = 1
): number => {
  return Number(
    (typeof number === "string" ? Number(number) : number).toFixed(
      decimalPoints
    )
  );
};

/**
 * This function takes an item index and the number of items per page and returns the page number.
 *
 * Example:
 * index: 0, perPage: 10 -> 1
 * index: 1, perPage: 10 -> 1
 * index: 10, perPage: 10 -> 2
 * index: 11, perPage: 10 -> 2
 *
 * @param {number} index
 * @param {number} perPage
 * @returns {number}
 */
export const getPageNumberFromIndexAndPerPage = (
  index: number,
  perPage: number
): number => {
  return Math.ceil((index + 1) / perPage);
};

export const localizeNumber = (number: number | string, locale?: string) => {
  if (typeof number === "string") {
    const regex = /[\-\:]/g;
    const match = number.match(regex);
    if (match) {
      const char = match[0];
      const parts = number.split(char);
      const part_1 = Number(parts[0]).toLocaleString(getLangFullLocale(locale));
      const part_2 = Number(parts[1]).toLocaleString(getLangFullLocale(locale));
      const result = part_1.concat(char, part_2);
      return result;
    } else {
      return Number(number).toLocaleString(getLangFullLocale(locale));
    }
  }
  return number.toLocaleString(getLangFullLocale(locale));
};

export const _range = (end: number | string, start: number | string) => {
  return Array.from(
    { length: Number(end) - Number(start) + 1 },
    (_, i) => i + Number(start)
  );
};

export const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};
