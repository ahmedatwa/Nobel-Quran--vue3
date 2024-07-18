import { createWebHistory, createRouter } from "vue-router";
import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: () => import("@/components/quran/QuranHomeComponent.vue"),
    children: [
      {
        name: "chaptersTab",
        path: "/",
        component: () => import("@/components/home/ChaptersTabComponent.vue"),
      },
      {
        name: "juzsTab",
        path: "/",
        component: () => import("@/components/home/JuzsTabComponent.vue"),
      },
      {
        name: "pagesTab",
        path: "/",
        component: () => import("@/components/home/PagesTabComponent.vue"),
      },
      {
        name: "relevationOrderTab",
        path: "/",
        component: () => import("@/components/home/RelevationTabComponent.vue"),
      },
    ],
  },
  // {
  //   path: "",
  //   name: "quranHome",
  //   component: () => import("@/components/quran/QuranComponent.vue"),
  //   props: true,
  // },
  {
    path: "/chapters",
    name: "chapters",
    component: () => import("@/components/chapters/ChaptersComponent.vue"),
    children: [
      {
        path: "/translations/:chapterName/verse/:verse",
        name: "chapterTranslations",
        component: () =>
          import("@/components/chapters/ChapterTranslationsViewComponent.vue"),
      },
      {
        path: "/reading/:chapterName/verse/:verse",
        name: "chapterReading",
        component: () =>
          import("@/components/chapters/ChapterReadingViewComponent.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// router.beforeEach((_to, _from, _next) => {
//   settingStore.isAppLoading = true;
// });
// router.afterEach((_to, _from) => {
//   settingStore.isAppLoading = false;
// });

export default router;
