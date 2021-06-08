<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth as cx, halfHeight as cy, p5Instance} from "@/components/P5.vue";
import {ArtVue, setLoopTime, time, menu, GUIType} from "@/arts/art";
import {easeInOutExpo} from "@/arts/easecurve";

let p5: p5Instance;

let nbPoints = 10;
let nbCirclePoint = 10;

function circle(x: number, y: number, prct: number, lerp: number, size: number): void {
    p5.push();
    p5.translate(x, y);
    const off: number = p5.TAU / nbCirclePoint;
    for (let i = off; i < p5.TAU + off; i += off) {
        p5.push();
        p5.rotate(i);
        for (let nb = 10; nb--;) {
            const rad: number = p5.PI + (nb / 10) * lerp + prct * p5.PI;
            p5.circle(p5.cos(rad) * size / 2 * lerp, p5.sin(rad) * size / 2 * lerp, size / 50);
        }
        p5.pop();
    }
    p5.pop();
}

function line(rad: number, prct: number, lerp: number, size: number): void {
    p5.push();
    p5.rotate(rad);
    p5.translate(size * prct, 0);
    p5.circle(0, 0, size / 50);
    p5.pop();
}

function draw(): void {
    p5.background("black");
    p5.translate(cx, cy);

    const prct: number = easeInOutExpo(time / 10 % 1);
    const lerp: number = .5 - p5.abs(prct - .5);
    const size: number = p5.min(cx, cy) / 1.5;
    const pos: number = lerp * 2;
    circle(0, 0, pos, lerp, size);
    for (let i = 0; i < p5.TAU; i += p5.TAU / nbPoints)
        circle(p5.cos(i) * size, p5.sin(i) * size, pos, lerp, size);
    for (let i = nbPoints; i--;)
        line(i * p5.TAU / nbPoints, i % 2 == 0 ? prct : pos, lerp, size);
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.noStroke();
    loop();
}

function loop(): void {
    setLoopTime(10);
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
                    menu("Number points", nbPoints, 2, 16, 2, value => nbPoints = value),
                    menu("Precision", nbCirclePoint, 1, 10, 1, value => nbCirclePoint = value),
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>