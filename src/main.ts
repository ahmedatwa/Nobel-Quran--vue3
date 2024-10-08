import { registerPlugins } from "./plugins";
import i18nPlugin from "./plugins/i18n";
import { en, ar } from "@/locales";

// Components
import App from "./App.vue";
import Axios from "axios";

// Composables
import { createApp } from "vue";
import { createPinia } from "pinia";
import "./assets/style.css";

// fonts
import '@fontsource/gulzar';
import '@fontsource/amiri';
// Supports weights 100-900
import '@fontsource-variable/noto-kufi-arabic';

const pinia = createPinia();

pinia.use(() => {
  Axios;
});

const app = createApp(App);

registerPlugins(app);

app.use(pinia)
   .use(i18nPlugin, {
  en,
  ar,
});

app.mount("#app");
