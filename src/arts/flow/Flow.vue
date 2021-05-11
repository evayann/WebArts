<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width as w, height as h, p5Instance} from "@/components/P5.vue";
import {ArtVue, time, setLoopTime, menu, GUIType} from "@/arts/util";

let p5: p5Instance;
let speedFactor = 1;
let spaceOffset = 2.5;
let sizeFactor = 1;
let density = 2000;

let s = 0, v = 0, u = 0;
let x = 0, y = 0, z = 1;
const C: (number) => number = Math.cos;
const T: (number) => number = Math.tan;

function draw(): void {
    p5.background("black");
    p5.scale(0.5);
    p5.translate(w, h * .75);
    const t: number = (time * 1000) / (1000 + 5000 / speedFactor);
    for (let i = density; i--; p5.rect(w * x / z, h * y / z, s = (500 * sizeFactor) / (z * z * z), s)) {
        x = spaceOffset * C(u = t + i) + C(v = t + i * i);
        y = T(u) + C(v) * T(v) - 2;
        z = C(u) - 5;
    }
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.noStroke();
    loop();
}

function loop(): void {
    setLoopTime((1 + 5 / speedFactor) * p5.PI);
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
                    menu("Speed", speedFactor, .1, 5, .1, value => {
                        speedFactor = value;
                        loop();
                    }),
                    menu("Size", sizeFactor, .1, 3, .1, value => sizeFactor = value),
                    menu("Offset", spaceOffset, 0, 5, .1, value => spaceOffset = value),
                    menu("Density", density, 500, 5000, 10, value => density = value),
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>