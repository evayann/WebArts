<template>
    <div class="menu">
        <h3> {{ name }} : </h3>
        <router-link v-for="(item, index) in items" :key="item" :to="`/#${item}`" :style="`--pos: ${index}`">
            {{ parseText(item) }}
        </router-link>
    </div>
</template>

<script lang="ts">
import {Options} from "vue-class-component";
import {UtilVue} from "@/util";

@Options({
    name: "CategoriesMenu",
    props: {
        name: String,
        items: Array
    }
})
export default class Menu extends UtilVue {}
</script>

<style scoped>
/* Navbar from https://codepen.io/ludmila-tretyakova/pen/pozgNOq */

/* Variables */
* {
    --menu-item-size: 3em;
    --dark-a-color: #175b52;
    --white-color: rgba(255, 255, 255, 0.84);
}

.menu {
    display: flex;
    flex-wrap: wrap;
    padding: .6em 0 0 0;
    justify-content: center;
}

.menu > a {
    width: calc(3.5 * var(--menu-item-size));
    line-height: var(--menu-item-size);
    transition: 0.5s linear all;
    background: var(--a-color);
    color: var(--white-color);
    text-decoration: none;
}

.menu > a {
    clip-path: polygon(10% 0%, 0% 100%, 95% 100%, 100% 50%, 95% 0%);
    shape-outside: polygon(10% 0%, 0% 100%, 95% 100%, 100% 50%, 95% 0%);
}

.menu a {
    margin-right: 5px;
}

.menu > a:nth-child(n) {
    transform: translateX(calc(-5% * var(--pos))); /* var(--pos) is given by vue binding */
    margin-bottom: 1%;
}

.menu > a:hover {
    background: var(--b-color);
}
</style>
