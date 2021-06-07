<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth as cx, halfHeight as cy, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, setLoopTime, time, menu, GUIType} from "@/arts/art";

let p5: p5Instance;
let speedFactor = 1;
let sizeFactor = 1;
let nbCircle = 30;
let density = 60;
let offset = 50;

const topColor: (rad: number) => P5.Color = (rad: number) => p5.lerpColor(p5.color("#F3AD2A"), p5.color("#F3AD2A"), rad / p5.PI);
const bottomColor: (rad: number) => P5.Color = (rad: number) => p5.lerpColor(p5.color("#281608"), p5.color("#D77B35"), p5.cos(rad - p5.PI));

function draw(): void {
    p5.background("black");
    p5.translate(cx, cy);
    const pos: number = p5.min(cx / 2, cy / 2) + offset;
    const size: number = pos - 2 * offset;
    for (let nb = nbCircle; nb--;) {
        p5.push();
        const rad: number = (nb * p5.TAU) / nbCircle;
        p5.rotate(rad);
        p5.translate(pos, 0);
        for (let j = density; j--;) {
            const rad: number = (speedFactor * (j + time) + (j * p5.QUARTER_PI) / density) % p5.TAU;
            p5.fill(rad < p5.PI ? topColor(rad) : bottomColor(rad));
            p5.circle(p5.cos(rad) * size, p5.sin(rad) * size, 10 * sizeFactor);
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
                    menu("Offset", offset, 0, 100, .1, value => offset = value),
                    menu("Density", density, 20, 500, 1, value => density = value),
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>