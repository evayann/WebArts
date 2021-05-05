import {createApp} from "vue";
import App from "@/pages/Page.vue";
import store from "@/store";
import router from "@/router";
import P5 from "@/components/P5.vue";
import i18n from "@/i18n"

createApp(App)
    .use(i18n)
    .use(router)
    .use(store)
    .use(P5)
    .mount('#app');