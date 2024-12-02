import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "@/assets/styles/index.scss";
import "@/assets/styles/tailwindcss.css";
import "@icon-park/vue-next/styles/index.css";
// 支持SVG
import "virtual:svg-icons-register";
// import getIP from './utils/getIP'

async function initApp() {
  const app = createApp(App);
  app.use(i18n);
  app.use(ElementPlus);
  app.use(router);
  // getIP()

  // 注册icons
  for (const [key, component] of Object.entries({ ...ElementPlusIconsVue })) {
    app.component(key, component);
  }
  app.mount("#app");
}
initApp();

router.beforeEach(async (_to, _from, next) => {
  await setI18n(localStorage.getItem("i18n") || "zh-CN");
  next();
});
