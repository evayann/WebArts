import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import {nextTick} from "vue";
import store from "@/store";

const effects = store.getters.effectsName.reduce((acc, packageName) => {
    const effect = packageName.charAt(0).toUpperCase() + packageName.slice(1);
    acc.push({
        path: packageName,
        name: effect,
        component: () => import(`@/arts/${packageName}/${effect}.vue`),
        meta: {
            title: effect
        }
    });
    return acc;
}, []);

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "Home",
        component: HomePage,
        meta: {
            title: "WebArts"
        }
    },
    {
        path: "/effect/:effectName",
        name: "Effect",
        // route level code-splitting
        // this generates a separate chunk (EffectPage.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "EffectPage" */ "@/pages/EffectPage.vue"),
        props: true,
        children: effects
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.beforeEach((to, from) => {
    // Use next tick to handle router history correctly
    // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
    nextTick(() => {
        document.title = to.meta.title as string || "WebArts"; // Title
    });
});

export default router;
