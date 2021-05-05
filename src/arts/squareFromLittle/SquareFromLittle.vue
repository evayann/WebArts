<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, button, color, GUIType} from "@/util";

let p5: p5Instance;
const sColor = "#35d492";
let squareColor: P5.Color;

let cycle = 1;
const size = 20;
let time = 0;
const offset = 1.7;
let nbSquares = 20;
let rotate = true;

function easeInOutElastic(x: number): number {
    const c5 = (2 * Math.PI) / 4.5;
    return x === 0 ? 0
        : x === 1
            ? 1
            : x < 0.5
                ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
                : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;

}

function cmpPos(from: number, to: number, time: number): number {
    const val = easeInOutElastic(p5.map(time, -1, 1, 0, 1));
    if (rotate) p5.rotate(val * p5.HALF_PI * .5);
    return p5.lerp(from, to, val);
}

function drawSquares(): void {
    const halfNbSquares = nbSquares / 2;
    p5.translate(centerX, centerY);
    p5.randomSeed(3);
    const minLength: number = centerX / 64;
    const maxLength: number = centerX / 16;
    for (let iy = -halfNbSquares; iy < halfNbSquares; iy++) {
        let free = nbSquares * size;
        while (free > 0) {
            p5.push();
            const rdm: number = p5.min(free, p5.random(minLength, maxLength));
            const ix: number = -halfNbSquares * size + (nbSquares * size - free);
            const x: number = cmpPos(ix * 2, ix, p5.cos(time * cycle));
            const y: number = cmpPos(iy * 2 * size, iy * size, p5.sin(offset + time * cycle));
            p5.translate(x, y);
            p5.rect(0, 0, rdm + 1, size + 1);
            p5.pop();
            free -= rdm;
        }
    }
    time += 0.02;
}

function draw(): void {
    p5.background("black");
    p5.fill(squareColor);
    p5.noStroke();
    drawSquares();
}

function reset(): void {
    p5.clear();
    time = 0;
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    squareColor = p5.color(sColor);
    p5.frameRate(60);
    reset();
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
            cycle: cycle,
            nbSquares: nbSquares,
            squareColor: sColor,
            rotate: rotate
        };
        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("cycle", .1, 2, .1, value => cycle = value),
                    menu("nbSquares", 5, 40, 1, value => nbSquares = value),
                    button("rotate", value => {rotate = value; reset();})
                ],
                "Visual & Color": [
                    color("squareColor", value => squareColor = p5.color(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
