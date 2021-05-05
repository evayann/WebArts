<template>
    <router-link :to="`/effect/${value}/${value}`"
                 @mouseleave="updateImage('leave')"
                 @mouseenter="updateImage('enter')" >
        <h2 class="effectName"> {{ parseText(value) }} </h2>
        <div class="box">
            <img :key="image" :src="image" :alt="value"/>
        </div>
    </router-link>
</template>

<script lang="ts">
import {Options} from "vue-class-component";
import {UtilVue} from "@/util";

@Options({
    name: "Effect",
    props: {
        value: String
    },
    data() {
        return {
            image: "placeholder"
        }
    }
})

export default class Effect extends UtilVue {
    private value!: string;
    public image!: string;
    private stat: string;
    private anim: string;

    created() {
        this.stat = require(`@/assets/effects/${this.value}.png`);
        try { this.anim = require(`@/assets/effects/${this.value}.gif`); }
        catch (e) { this.anim = this.stat; }
        this.image = this.stat;
    }

    updateImage(state: string): void {
        this.image = (state === "leave") ? this.stat : this.anim;
    }
}
</script>

<style scoped>
a {
    display: block;
    width: 400px;
    color: #bf2e2e;
    text-decoration: none;
    margin: 0 30px 40px 30px;
}

a h2 {
    padding: 0 0 10px 0;
    margin: 0 0 15px 0;
    border-bottom: 1px solid #bf2e2e;
    font-weight: normal;
}

a:hover h2 {
    color: #ffffff;
    border-color: #ffffff;
}

a img, a div {
    display: block;
    width: 400px;
    height: 225px;
    background: #bf2e2e;
}

.effectName {
    background: linear-gradient(45deg, #bf2e2e 50%, transparent 0) right /250% 100% no-repeat,
    linear-gradient(45deg, transparent 50%, #bf2e2e 0) left /250% 100% no-repeat;
    transition: 0.5s;
}

a:hover .effectName {
    background-position: center;
    color: #fff;
}

.box:hover {
    display: block;
    background-color: #bf2e2e;
    position: relative;
}

.box:hover::before,
.box:hover::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(45deg, #ff0000, #00f0f0, #00ff00, #0000ff, #ff0000, #00f0f0, #00ff00, #0000ff, #f00f0f);
    width: 100%;
    height: 100%;
    transform: scale(.95);
    z-index: -1;
    background-size: 500%;
    animation: animate 20s infinite;
}

.box:hover::after {
    filter: blur(15px);
}

@keyframes animate {
    0% { background-position: 0 0; }
    50% { background-position: 300% 0; }
    100% { background-position: 0 0; }
}
</style>