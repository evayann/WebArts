<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, time, setLoopTime, menu, switchButton, color, GUIType} from "@/arts/art";
import {easeInOutElastic} from "@/arts/easecurve";

let p5: p5Instance;
const sColor = "#35d492";
let squareColor: P5.Color;

let cycle = .5;
const size = 20;
const offset = 1.7;
let nbSquares = 20;
let rotate = true;

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
}

function draw(): void {
    p5.background("black");
    p5.fill(squareColor);
    p5.noStroke();
    drawSquares();
}

function reset(): void {
    p5.clear();
    setLoopTime(7 / cycle);
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    squareColor = p5.color(sColor);
    reset();
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
                    menu("Cycle", cycle, .1, 2, .1, value => {cycle = value; reset();}),
                    menu("Number elements per line", nbSquares, 5, 40, 1, value => nbSquares = value),
                    switchButton("No Rotation", "Rotation", value => {rotate = value; reset();}, rotate)
                ],
                "Visual & Color": [
                    color("Elements", sColor, value => squareColor = p5.color(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
