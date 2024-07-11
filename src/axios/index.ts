import axios from "axios";

const VITE_API_URL = "https://api.quran.com/api/v4";
const VITE_API_QDC_URL = "https://api.qurancdn.com/api/qdc/";

export const instance = axios.create({
  baseURL: VITE_API_URL,
  headers: {
    Accept: "application/json",
  },
});

instance.interceptors.request.use(
  function (config) {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(config);
      }, 500)
    );
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Urls
// Audio
const audioUrl = VITE_API_QDC_URL + "/audio/reciters/";
export const makeGetAudioRecitersUrl = (
  reciterID: number,
  audioID: number
): string => {
  return (
    audioUrl + reciterID + "/audio_files?chapter=" + audioID + "&segments=true"
  );
};

export const makeGetRecitationsUrl = (locale: string = "en"): string => {
  return audioUrl + "?locale=" + locale;
};
