<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width as w, height as h, p5Instance} from "@/components/P5.vue";
import {ArtVue, menu, GUIType} from "@/arts/util";

let p5: p5Instance;
let speedFactor = 1;
let spaceOffset = 5;
let sizeFactor = 1;
let density = 5000;

let s = 0, v = 0, u = 0;
let x = 0, y = 0, z = 1;
const C: (number) => number = Math.cos;
const T: (number) => number = Math.tan;
const S: (number) => number = Math.sin;

function draw(): void {
    p5.background("black");
    p5.scale(0.5);
    p5.translate(w, h * .75);
    const t: number = p5.millis() / (1000 + 1000 * (1 / speedFactor));
    for (let i = density; i--; p5.rect((w / 2) * x / z, h * 1.25 - h * y / z, s = (500 * sizeFactor) / (z * z * z), s)) {
        x = spaceOffset * C(u = t + 1000 / i) + C(v = t + i);
        y = S(density / i) + T(v) * C(v) - 5;
        z = S(u) - 5;
    }
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.frameRate(60);
    p5.noStroke();
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5(p);
    }

    drawP5(): void {
        draw();
    }

    generateUI(): GUIType {
        const params = {
            speedFactor: speedFactor,
            spaceOffset: spaceOffset,
            sizeFactor: sizeFactor,
            density: density
        };
        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("speedFactor", .1, 5, .1, value => speedFactor = value),
                    menu("sizeFactor", .1, 3, .1, value => sizeFactor = value),
                    menu("spaceOffset", 0, 5, .1, value => spaceOffset = value),
                    menu("density", 500, 5000, 10, value => density = value),
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>