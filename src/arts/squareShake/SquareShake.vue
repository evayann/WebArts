<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, switchButton, color, GUIType, time, setLoopTime, resetTime} from "@/arts/util";

let p5: p5Instance;
const sColor = "#35d492";
let squareColor: P5.Color;

let cycle = 1;
let offset = 1.7;
const max = 3;
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

function easeInOutCirc(x: number): number {
    return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

function cmpPos(from: number, to: number, t: number, rot: boolean): number {
    const val = easeInOutElastic(p5.map(t, -1, 1, 0, 1));
    if (rot) p5.rotate(val * p5.PI);
    return p5.lerp(from, to, val);
}

function drawSquare(ix: number, iy: number, w: number, h: number): void {
    p5.push();
    const x: number = cmpPos(ix * 2, ix, p5.cos(time * cycle), rotate);
    const y: number = cmpPos(iy * 2, iy, p5.sin(offset + time * cycle), rotate);
    p5.translate(x, y);
    p5.rect(0, 0, w + 2, h + 2,
        easeInOutCirc(p5.map(p5.cos(time * cycle), -1, 1, 1, 0)) * w / 2);
    p5.pop();
}

function splitSquare(x: number, y: number, w: number, h: number,
                     xOff: number, yOff: number, xInc: number, yInc: number,
                     it: number): void {
    if (it >= max)
        drawSquare(x, y, w, h);
    else {
        const nXOff: number = xOff + xInc, nYOff: number = yOff + yInc;
        splitSquare(x, y, w * xOff, h * yOff, nXOff, nYOff, xInc, yInc, it + 1);
        splitSquare(x + w * xOff, y, w * (1 - xOff), h * yOff, nXOff, nYOff, xInc, yInc, it + 1);
        splitSquare(x + w * xOff, y + h * yOff, w * (1 - xOff), h * (1 - yOff), nXOff, nYOff, xInc, yInc, it + 1);
        splitSquare(x, y + h * yOff, w * xOff, h * (1 - yOff), nXOff, nYOff, xInc, yInc, it + 1);
    }
}

function center(size): void {
    const xOff: number = cmpPos(size, 0, p5.cos(time * cycle), false);
    const yOff: number = cmpPos(size, 0, p5.sin(offset + time * cycle), false);
    p5.translate(width / 2 + xOff, height / 2 + yOff);
}

function draw(): void {
    p5.background("black");
    p5.fill(squareColor);
    p5.noStroke();
    const size: number = Math.min(width, height);
    center(size / 32);
    p5.scale(.5);
    const qSize: number = size / 2;
    const off: number = 1 / (max * 2);
    splitSquare(-qSize, -qSize, qSize, qSize, 0.1, 0.1, off, off, 0);
    splitSquare(0, -qSize, qSize, qSize, 0.9, 0.1, -off, off, 0);
    splitSquare(0, 0, qSize, qSize, 0.9, 0.9, -off, -off, 0);
    splitSquare(-qSize, 0, qSize, qSize, 0.1, 0.9, off, -off, 0);
}

function reset(): void {
    p5.clear();
    setLoopTime(8 / cycle);
    resetTime();
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
                    menu("Offset", offset, 0, Math.PI * 2, .1, value => offset = value),
                    switchButton("Rotation", "No Rotation", value => {rotate = value; reset();})
                ],
                "Visual & Color": [
                    color("Element", sColor, value => squareColor = p5.color(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
