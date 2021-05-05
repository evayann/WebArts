<template>
    <div class="footer">
        <div class="content">
            <a href="https://github.com/evayann">
                <img src="@/assets/github.png" alt="logo-github"/>
            </a>
            <p> GitHub </p>
        </div>
        <div class="content">
            <a href="https://yann.fzcommunication.fr">
                <img src="@/assets/logo.png" alt="logo-personal-website"/>
            </a>
            <p> My Website </p>
        </div>
        <div class="content">
            <a href="https://twitter.com/_evayann_">
                <img src="@/assets/twitter.png" alt="logo-twitter"/>
            </a>
            <p> Twitter </p>
        </div>
    </div>
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
}

.footer {
    display: flex;
    padding: 2em;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.footer a img {
    padding: 0 2em 0 2em;
    width: 150px;
    height: 150px;
    background: transparent;
}

.content:hover {
    filter: brightness(65%);
}
</style>