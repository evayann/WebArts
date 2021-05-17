<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth, halfHeight, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, GUIType, color} from "@/arts/art";

// Inspired by https://twitter.com/beesandbombs/status/1361727805130760194?s=12

let p5: p5Instance;
const pColor = "#121341";
let ptColor: P5.Color;

let speed = 1;
let time = 0;
let nbElements = 20;
const stroke = 2;
let blockSize: number = Math.min(width, height) / nbElements;
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

function drawLine(x: number, y: number, w: number, h: number): void {
    p5.line(x, y, x + w, y + h)
}

function drawCross(x: number, y: number, value: number): void {
    const _x: number = x * blockSize;
    const _y: number = y * blockSize + blockSize / 2;
    if (p5.abs(x % 2) == 1)
        drawLine(_x, _y + (blockSize / 2), blockSize, 0);
    drawLine(_x + (blockSize / 2) * value, _y, 0, blockSize);
}

function drawSquare(x: number, y: number, value: number): void {
    const _x: number = x * blockSize, _y: number = y * blockSize + (y % 2 == 0 ? 0 : blockSize / 2);
    if (x % 2 == 0) {
        drawLine(_x + (2 * value * blockSize), _y, blockSize, 0);
        drawLine(_x, _y + (-2 * value * blockSize), 0, blockSize);
        drawLine(_x + (2 * value * blockSize), _y + blockSize, blockSize, 0);
        drawLine(_x + blockSize, _y + (-2 * value * blockSize), 0, blockSize);
    } else {
        drawLine(_x, _y + blockSize / 2, blockSize, 0);
    }
}

function draw(): void {
    p5.background("black");
    time += 0.01 * speed;
    p5.stroke(ptColor);
    p5.fill(ptColor);
    const anim: number = easeInOutExpo(p5.map(p5.cos(time), -1, 1, 0, 1));
    p5.translate(halfWidth, halfHeight);
    for (let y = -yEl; y <= yEl; y++)
        for (let x = -xEl; x <= xEl; x++)
            if (y % 2 == 0)
                drawCross(x, y, anim);
            else
                drawSquare(x, y, anim);
}

function reset(): void {
    p5.clear();
    time = 0;
    blockSize = Math.min(width, height) / nbElements;
    xEl = p5.int((width / blockSize) / 2) + 2;
    yEl = p5.int((height / blockSize) / 2) + 2;
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    ptColor = p5.color(pColor);
    p5.frameRate(60);
    p5.strokeWeight(stroke);
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
            speed: speed,
            nbElements: nbElements,
            ptColor: pColor,
            stroke: stroke,
        };
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Speed", speed, .1, 5, .1, value => speed = value),
                    menu("Number Element", nbElements, 10, 40, 1, value => { nbElements = value; reset() }),
                ],
                "Visual & Color" : [
                    color("Line", pColor, value => { ptColor = p5.color(value); p5.stroke(ptColor); }),
                    menu("Stroke Size", stroke, .1, 5, .1, value => this.p5.strokeWeight(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>