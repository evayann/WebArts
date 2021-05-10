<template>
    <footer class="footer">
        <a href="https://github.com/evayann" class="content">
            <img src="@/assets/github.png" alt="logo-github"/>
            <p> GitHub </p>
        </a>
        <a href="https://yann.fzcommunication.fr" class="content">
            <img src="@/assets/logo.png" alt="logo-personal-website"/>
            <p> My Website </p>
        </a>
        <a href="https://www.buymeacoffee.com/evayann" class="content">
            <img src="@/assets/BMC.png" alt="logo-BMC"/>
            <p> Buy me a Coffee </p>
        </a>
        <a href="https://twitter.com/_evayann_" class="content">
            <img src="@/assets/twitter.png" alt="logo-twitter"/>
            <p> Twitter </p>
        </a>
    </footer>
</template>

<script lang="ts">
import {Options, Vue} from "vue-class-component";

@Options({name: "Footer"})
export default class Footer extends Vue {}
</script>

<style scoped>
.footer {
    background-color: var(--a-color);
    filter: brightness(85%);
    display: flex;
    flex-wrap: wrap;
}

.footer {
    display: flex;
    padding: 2em 0 2em 0;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.footer a img {
    padding: 0 1em 0 1em;
    width: 5rem;
    height: 5rem;
    background: transparent;
}

.content {
    width: 10em;
    text-decoration: none;
    color: var(--white-color);
}

.content:hover {
    filter: brightness(65%);
}
</style>