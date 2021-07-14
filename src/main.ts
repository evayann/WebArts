import App from "@/pages/Page.vue";
import {createApp} from "vue";
import router from "@/router";
import store from "@/store";
import i18n from "@/i18n"
import P5 from "@/components/P5.vue";
import "flag-icon-css/css/flag-icon.css";
import "./registerServiceWorker";

createApp(App)
    .use(i18n)
    .use(router)
    .use(store)
    .use(P5)
    .mount('#app');