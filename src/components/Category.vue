<template>
    <div class="category" :id="category">
     <h2 class="title"> {{ parseText(category) }} </h2>
        <div class="arts">
            <Effect v-for="art in arts" :key="art" :value=art></Effect>
        </div>
    </div>
</template>

<script lang="ts">
import {Options} from "vue-class-component";
import Effect from "./Effect.vue";
import {UtilVue} from "@/util";

@Options({
    name: "Category",
    components: {
        Effect,
    },
    props: {
        category: String,
        arts: Array
    }
})

export default class Category extends UtilVue {
    private category!: string
    private arts!: Array<string>
}
</script>

<style scoped>
.title {
    padding: .5rem;
    background-color: var(--a-color);
    filter: brightness(150%);
}

.arts {
    padding-top: 1.5em;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
}

.category {
    margin: 1.75em;
    background-color: var(--a-color);
    filter: brightness(85%);
}
</style>