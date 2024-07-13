import { shallowRef } from "vue";

const interval = shallowRef();
export const loadingIntervalValue = shallowRef(0);

export const setLoadingIInterval = (ms: number = 1000, val: number = 10) => {
  interval.value = setInterval(() => {
    if (loadingIntervalValue.value === ms) {
      return (loadingIntervalValue.value = 0);
    }
    loadingIntervalValue.value += val;
  }, ms);
};

export const clearLoadingInterval = () => {
    clearInterval(interval.value);
}
