<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth, halfHeight, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, time, resetTime, setLoopTime, menu, color, GUIType} from "@/arts/art";
// Inspired by https://twitter.com/cs_kaplan/status/1359695674862895105?s=12

let p5: p5Instance;
const pColor = "#dbec42";
let ptColor: P5.Color;

let speed = 1;
let nbElements = 5;
let blockSize: number = Math.min(width, height) / nbElements;
let hbSize: number = blockSize / 2;
let size: number = blockSize * .7;
let xEl: number = Math.floor((width / blockSize) / 2) + 2;
let yEl: number = Math.floor((height / blockSize) / 2) + 2;

function easeInOutExpo(x: number): number {
    return x === 0
        ? 0
        : x === 1
            ? 1
            : x < 0.5 ? p5.pow(2, 20 * x - 10) / 2
                : (2 - p5.pow(2, -20 * x + 10)) / 2;
}

function easeInQuart(x: number): number {
    return x * x * x * x;
}

function drawShape(h: number, reduce: number): void {
    p5.beginShape();
    p5.vertex(-h, 0);
    p5.vertex(-h + reduce, h);
    p5.vertex(h - reduce, h);
    p5.vertex(h, 0);
    p5.endShape(p5.CLOSE);
}

function drawHalfSquare(x: number, y: number, w: number, h: number, value: number, rotate: number): void {
    p5.push();
    p5.translate(x, y);
    p5.rotate((1 - value) * (p5.HALF_PI / 2) + rotate);
    p5.scale(p5.map(easeInOutExpo(value), 0, 1, 1, 1.4));
    drawShape(h, value * (size / 2));
    p5.pop();
}

function drawHalf(x: number, y: number, rot: number, sign: number, value: number): void {
    p5.push();
    p5.translate(sign * blockSize * value, sign * blockSize * value);
    drawHalfSquare(x + hbSize, y + hbSize, size, size / 2, value, rot);
    p5.pop();
}

function drawSquare(x: number, y: number, value: number): void {
    drawHalf(x, y, 0, -1, value);
    drawHalf(x, y, p5.PI, 1, value);
}

function draw(): void {
    p5.background("black");
    p5.stroke(ptColor);
    p5.fill(ptColor);
    const anim: number = easeInQuart(p5.map((time * speed) % 5, 0, 5, 0, 1));
    p5.translate(halfWidth, halfHeight);
    for (let y = -yEl * blockSize; y <= yEl * blockSize; y += blockSize)
        for (let x = -xEl * blockSize; x <= xEl * blockSize; x += blockSize)
            drawSquare(x, y, anim);
}

function reset(): void {
    p5.clear();
    resetTime();
    setLoopTime((1 / speed) * 5);
    blockSize = Math.min(width, height) / nbElements;
    hbSize = blockSize / 2;
    size = blockSize * .7;
    xEl = p5.int((width / blockSize) / 2) + 2;
    yEl = p5.int((height / blockSize) / 2) + 2;
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    ptColor = p5.color(pColor);
    p5.strokeWeight(2);
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
                    menu("Speed", speed, .1, 5, .1, value => {speed = value; reset();}),
                    menu("Number Element", nbElements, 5, 20, 1, value => {nbElements = value; reset();})
                ],
                "Visual & Color": [
                    color("Element", pColor, value => {ptColor = p5.color(value); p5.stroke(ptColor);})
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>

