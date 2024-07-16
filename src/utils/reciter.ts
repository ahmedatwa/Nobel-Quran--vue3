import type { Recitations } from "@/types/audio";
const AVATAR_PLACEHOLDER_API = "https://ui-avatars.com/api/";

/**
 *
 * @returns '{Recitations[]}'
 */
export const getAllReciters = async (): Promise<Recitations[]> => {
  return new Promise((resolve, reject) => {
    try {
      import("@/json/reciters.json").then((res) => {
        resolve(res.reciters);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 *
 * @param reciterID number
 * @returns '{Recitations[]}'
 */
export const getReciterData = (
  reciters: Recitations[],
  id: number
): Recitations => {
  return reciters[id];
};

/**
 * @param
 * @returns '{GroupRecitionsByStyle}'
 */
type GroupRecitionsByStyle = {
  [key: string]: Recitations[];
};
export const groupRecitionsByStyle = (
  reciters: Recitations[]
): GroupRecitionsByStyle => {
  return reciters.reduce((i: GroupRecitionsByStyle, o: Recitations) => {
    (i[o.style.name] = i[o.style.name] || []).push(o);
    return i;
  }, {});
};

/**
 * @param reciter
 *@returns string AB
 */
export const getReciterNameInitials = (reciter: Recitations): string => {
  const split = reciter.name.split(" ");
  return split[0].charAt(0) + split[1].charAt(0);
};

/**
 *
 * @param name
 * @returns
 */
export const createReciterAvatar = (name: string) => {
  return `${AVATAR_PLACEHOLDER_API}?name="${name}`;
};
