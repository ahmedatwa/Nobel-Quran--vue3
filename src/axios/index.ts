import axios from "axios";


export const instance = axios.create({
  baseURL: "https://api.quran.com/api/v4",
  headers: {
   "Accept": "application/json"
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
