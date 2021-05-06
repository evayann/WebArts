<template>
    <div class="logoImage">
        <a href="https://yann.fzcommunication.fr">
            <img src="@/assets/logo.png" alt="logo-personal-website"/>
        </a>
        <a :href="codePath">
            <img src="@/assets/github.png" alt="logo-github"/>
        </a>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from "vue-class-component";
import {Prop} from "vue-property-decorator";

@Options({
    name: "Logo"
})

export default class Logo extends Vue {
    @Prop()
    private codePath!: string;
}
</script>

<style scoped>

div.logoImage {
    width: 30%;
    position: fixed;
    bottom: .5%;
    right: .5%;
    display: flex;
    flex-direction: row;
    justify-content: right;
}

div.logoImage a img {
    width: 5rem;
    height: 5rem;
    opacity: 0.5;
    background: transparent;
}

div.logoImage a:hover, div.logoImage a img:hover {
    opacity: 1;
    border-radius: 50%;
}

</style>