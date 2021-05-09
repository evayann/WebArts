<template>
    <div>
        <router-link to="/" id="title">
            <h1><span>❤</span> {{ t("title") }} <span>❤</span></h1>
        </router-link>

        <div v-for="lang in languages" :key="lang.title">
            <button @click="locale=lang.language"  class="langs" v-if="locale !== lang.language">
                <span :class="`flag-icon flag-icon-${lang.flag}`" />
                {{lang.title}}
            </button>
        </div>

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
        const languages = [
            {flag: "fr", language: "fr", title: "Français"},
            {flag: "us", language: "en", title: "English"}
        ];
        return {t, locale, languages};
    }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@500&display=swap');

* {
    --a-color: #405566;
    --dark-a-color: #175b52;
    --b-color: #099c95;
    --bg-color: #182838;
    --white-color: rgba(255, 255, 255, 0.84);
    scrollbar-width: thin;
    scrollbar-color: #b84f30 var(--a-color);
}

.langs {
    padding: 1%;
    font-size: 1.1em;
    margin: 1%;
    font-style: italic;
    color: var(--white-color);
    border: 1px solid var(--b-color);
    background-color: var(--a-color);
}

.langs:hover {
    transition: 0.5s linear all;
    background-color: var(--dark-a-color);
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