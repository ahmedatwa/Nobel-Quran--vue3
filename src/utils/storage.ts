import { dateToDateString } from "@/utils/datetime";

interface ItemObj {
  [key: string]: string | number | boolean | object;
}

/**
 * clear old items if found
 * @param key
 * @param "{key: string, value: any} "
 * @return void
 */

const setStorage = (key: string, data: any, storageType?: Storage) => {
  storageType = storageType ? storageType : sessionStorage;
  const found = getStorage(key);
  if (found) {
    removeStorageItem(key);
  }

  if (typeof data === "object") {
    storageType.setItem(
      key,
      JSON.stringify({ ...data, date: dateToDateString() })
    );
  } else {
    storageType.setItem(key, data);
  }
};

/**
 * get storage item and parse it
 * @param key
 * @returns {} | null
 */
const getStorage = (key: string, storageType?: Storage) => {
  storageType = storageType ? storageType : sessionStorage;

  const $_ = storageType.getItem(key);
  if ($_) {
    if ($_.charAt(0) === "{") {
      return JSON.parse($_);
    } else {
      return $_;
    }
  }
};

/**
 *
 * @param item
 * @param key
 * @returns string | number | object
 */
const getStorageItemValue = (
  item: string,
  key?: string,
  storageType?: Storage
) => {
  storageType = storageType ? storageType : sessionStorage;
  if (!key) return getStorage(item);

  const state = getStorage(item);

  if (state) {
    for (const k in state) {
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        if (k === key) return state[key];
      }
    }
  }
};
/**
 *
 * @param item
 * @returns void
 */
const removeStorageItem = (item: string, storageType?: Storage) => {
  storageType = storageType ? storageType : sessionStorage;
  storageType.removeItem(item);
};

/**
 * update local storage item
 * @param item
 * @param itemObj
 * @returns
 */
const updateStorageItem = (item: string, itemObj: ItemObj) => {
  if (!item.length) return;

  const result = getStorage(item);

  if (!result) {
    setStorage(item, { ...itemObj });
    return;
  }

  let state = null;

  for (const key in result) {
    for (const [k, v] of Object.entries(itemObj)) {
      if (k === key) {
        state = { ...result, [k]: v };
        setStorage(item, state);
        break;
      }
    }
    break;
  }

  if (!state) {
    setStorage(item, { ...itemObj, ...result });
  }
};

/**
 * @returns void
 */
const clearStorage = (reload: boolean, storageType?: Storage) => {
  storageType = storageType ? storageType : sessionStorage;
  storageType.clear();
  if (reload) location.reload();
};

export {
  setStorage,
  getStorage,
  getStorageItemValue,
  removeStorageItem,
  updateStorageItem,
  clearStorage,
};
