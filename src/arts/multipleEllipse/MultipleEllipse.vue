<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth as cx, halfHeight as cy, p5Instance} from "@/components/P5.vue";
import {ArtVue, setLoopTime, time, menu, GUIType} from "@/arts/art";

let p5: p5Instance;
let speedFactor = 1;
let spaceOffset = 5;
let sizeFactor = 1;
let density = 5000;

let nbCircle = 30;
let nbCircleForOne = 60;
let offset = 50;

function draw(): void {
    p5.background("black");
    p5.translate(cx, cy);
    // const size: number = p5.min(cx / 2, cy / 2);
    // for (let nb = nbCircle; nb--;) {
    //     p5.push();
    //     const rad: number = (nb * p5.TAU) / nbCircle;
    //     p5.translate(p5.cos(rad) * size, p5.sin(rad) * size);
    //     for (let j = nbCircleForOne; j--;) {
    //         const rad: number = j + time + (j * p5.PI) / nbCircleForOne;
    //         p5.circle(p5.cos(rad) * size, p5.sin(rad) * size, 10);
    //     }
    //     p5.pop();
    // }

    const pos: number = p5.min(cx / 2, cy / 2) + offset;
    const size: number = pos - 2 * offset;
    for (let nb = nbCircle; nb--;) {
        p5.push();
        const rad: number = (nb * p5.TAU) / nbCircle;
        p5.rotate(rad);
        p5.translate(size + 100, 0);
        for (let j = nbCircleForOne; j--;) {
            const rad: number = j + time + (j * p5.QUARTER_PI) / nbCircleForOne;
            p5.circle(p5.cos(rad) * size, p5.sin(rad) * size, 10);
        }
        p5.pop();
    }
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.noStroke();
    loop();
}

function loop(): void {
    setLoopTime((1 + 5 / speedFactor) * p5.TAU);
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