// 需要先安装vue-router依赖: npm install vue-router@4
import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import LogsView from "@/views/LogsView.vue";
import AboutView from "@/views/AboutView.vue";
import MonitorView from "@/views/MonitorView.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/logs",
      name: "logs",
      component: LogsView,
    },
    {
      path: "/monitor",
      name: "monitor",
      component: MonitorView,
    },
    {
      path: "/about",
      name: "about",
      component: AboutView,
    },
  ],
});

export default router;
