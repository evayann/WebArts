<template>
    <div>
        <router-link to="/" id="title">
            <h1><span>❤</span> {{ t("title") }} <span>❤</span></h1>
        </router-link>

        <select v-model="locale">
            <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang.id">
                {{ lang.name }}
            </option>
        </select>

        <div id="prez">
            <h3> {{ t("welcome") }} </h3>
            <p v-html="t('presentation')"></p>
        </div>

        <CategoriesMenu :name="t('menuName')" :items=this.$store.getters.categories></CategoriesMenu>

        <div v-for="effect in this.$store.getters.effects" :key="effect.category">
            <Category :category=effect.category :arts=effect.arts></Category>
        </div>

        <Footer></Footer>
    </div>
</template>

<script lang="ts">
import CategoriesMenu from "@/components/CategoriesMenu.vue";
import Category from "@/components/Category.vue";
import Footer from "@/components/Footer.vue";
import {useI18n} from "vue-i18n";

export default {
    components: {
        Category,
        CategoriesMenu,
        Footer
    },
    setup(): unknown {
        const { t , locale } = useI18n({useScope: "local"});
        const langs = [{name: "Français", id:"fr"}, {name: "English", id:"en"}];
        return {t, locale, langs };
    }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@500&display=swap');

* {
    --a-color: #405566;
    --b-color: #099c95;
    --bg-color: #182838;
    scrollbar-width: thin;
    scrollbar-color: #b84f30 var(--a-color);
}

body {
    margin: 0;
    height: 100%;
}

#title h1 {
    margin-top: 0;
    color: #ffbcaa;
}

#prez {
    margin: 3em 20% 3em 20%;
    padding: 2em;
    background-color: var(--a-color);
}

#title {
    text-decoration: none;
}

#title:hover h1 {
    color: #fdfdfd;
    border-color: #68a4aa;
}

#app {
    font-family: "Comfortaa", cursive;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #ffbcaa;
    background-color: var(--bg-color);
}
</style>

<i18n>
{
    "en": {
        "title": "Generative Art",
        "menuName": "Effects type",
        "welcome": "Welcome !",
        "presentation": "You will find here many procedural effects made with p5js in Typescript and the site is made in Vue3.<br/>I hope you will like it !<br/>To support me you can share !"
    },
    "fr": {
        "title": "Art procédurale",
        "menuName": "Les type d'effets",
        "welcome": "Bienvenue !",
        "presentation": "Vous trouverez ici de nombreux effets procéduraux fait avec p5js en Typescript et le site est fait en Vue3.<br/>J'espère que cela vous plaira !<br/>Pour me soutenir vous pouvez partager !"
    }
}
</i18n>