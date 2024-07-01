
interface verseMap {
  [key: number]: string;
}
/**
 * Given list of verses, get all the first and the last verseKeys
 *
 * @param '{verseMap}'
 * @returns number
 */
export const getFirstVerseNumberInJuz = (versesMap: verseMap): number | undefined => {
  if (versesMap) {
    for (const key in versesMap) {
      const element = versesMap[key];
      return Number(element.split("-")[0]);
    }
  }
};

export const isVerseKeyWithinRanges = (verseKey: string, range?: string[]) => {
  if (range) return range.includes(verseKey);
};
