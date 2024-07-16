import { createMemoryHistory, createRouter } from "vue-router";
import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: () => import("@/components/quran/QuranHomeComponent.vue"),
  },
  {
    path: "/home",
    children: [
      {
        path: "/chapters",
        component: () => import("@/components/quran/QuranHomeComponent.vue"),
      },
      {
        path: "/juzs",
        component: () => import("@/components/quran/QuranHomeComponent.vue"),
      },
      {
        path: "/pages",
        component: () => import("@/components/quran/QuranHomeComponent.vue"),
      },
      {
        path: "/relevation-order",
        component: () => import("@/components/quran/QuranHomeComponent.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
