import { ref, computed } from "vue";
import { setStorage, getStorageItemValue } from "@/utils/storage";
import type { App } from "vue";
import { Options, langKey, Translate } from "@/types/symbols";

const storage = getStorageItemValue("locale");
const rtl = ref(false);
const locale = ref("en");

const format = (line: string, args: any[]): string => {
  return line.replace(/{(\d+)}/g, (value, i) => {
    return typeof args[i] != undefined ? args[i] : value;
  });
};

export default {
  install: (app: App, options: Options) => {
    if (storage) {
      locale.value = storage.locale;
      rtl.value = storage.rtl;
    }

    const t = {
      line: (key: string, replacement?: string[]): string => {
        const result = key
          .split(".")
          .reduce((o: string | object, i: string) => {
            if (typeof o === "object") {
              return o[i as keyof typeof o];
            } else {
              return o;
            }
          }, options[locale.value as keyof typeof options]);

        if (result === undefined) return key;
        if (replacement) return format(result.toString(), replacement);
        return result.toString();
      },
      setLocale: (str: string, direction: boolean) => {
        locale.value = str;
        rtl.value = direction;
        setStorage("locale", { locale: str, rtl: direction });
      },
      locale: computed(() => locale.value),
      rtl: computed(() => rtl.value),
    };

    app.provide(langKey, t);

    app.config.globalProperties.$tr = t;
  },
};

declare module "vue" {
  interface ComponentCustomProperties {
    $tr: Translate;
  }
}
