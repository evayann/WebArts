<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance} from "@/components/P5.vue";
import {ArtVue, menu, GUIType} from "@/arts/art";
// Implemented from https://medium.com/@r.l.bongers/visual-effect-analysis-animated-raindrops-682b83b87e09

let p5: p5Instance;
let speedFactor = 1;
let nbDropWater = 35;
let nbWater = 100;

function draw(): void {
    p5.background("black");
    const effect_size = height / 3;
    const time: number = p5.millis() / (1000 * (1 / speedFactor));
    p5.fill(((time / 10) % 1) * 255, 255, 255);
    for (let i = 0; i < nbDropWater; i++) {
        const timing_variation = (time + Math.cos(i)) % 2;
        for (let j = timing_variation; j < nbWater; j++) {
            const burst_trigger = ~~timing_variation;
            const drop_size = timing_variation * effect_size - effect_size;
            const y_pos = (burst_trigger ? effect_size : timing_variation * effect_size) * (Math.cos(i) + 2);
            const x_coord = width * p5.map(Math.cos(i * i * i), -1, 1, 0, 1)
                + burst_trigger * drop_size * Math.cos(j);
            const y_coord = y_pos + drop_size * (Math.sin(j) / 5);
            p5.rect(x_coord, y_coord, 3, 3);
        }
    }
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.angleMode(p5.DEGREES);
    p5.frameRate(60);
    p5.noStroke();
    p5.colorMode(p5.HSB);
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5(p);
    }

    drawP5(p: p5Instance): void {
        super.drawP5(p);
        draw();
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Speed", speedFactor, .1, 5, .1, value => speedFactor = value),
                    menu("Number Drop", nbDropWater, 20, 400, 1, value => nbDropWater = value),
                    menu("Water Explosion", nbWater, 10, 200, 1, value => nbWater = value)
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>