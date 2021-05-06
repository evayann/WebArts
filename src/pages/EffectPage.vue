<template>
    <div>
        <router-view />
        <Logo :codePath="`https://github.com/evayann/WebArts/blob/main/src/arts/${effectName}/${effectName.charAt(0).toUpperCase() + effectName.slice(1)}.vue`"></Logo>
    </div>
</template>

<script lang="ts">
import {Options} from "vue-class-component";
import Logo from "@/components/Logo.vue";
import {UtilVue} from "@/util";

@Options({
    name: "Effect",
    components: {
        Logo
    },
    props: {
        effectName: {
            type: String,
            default: "default"
        }
    }
})

export default class EffectPage extends UtilVue {
    private effectName !: string;
}
</script>

<style>

body {
    all: revert;
    margin: 0;
    background-color: var(--bg-color);
}

canvas {
    display: block;
}

</style>
