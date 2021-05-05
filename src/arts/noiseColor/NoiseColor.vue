<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, button, color, list, GUIType} from "@/util";

let p5: p5Instance;
const fColor = "#fafafa";
const tColor = "#1e3c7c";
let fromColor: P5.Color;
let toColor: P5.Color;

let offset = 1;
let size = 20;
let scale = 10;
let speed = 1;

const computeNoise = (x: number, y: number) =>
        p5.noise((x / width) * scale + (offset * speed) / 100,
            (y / height) * scale + (offset * speed) / 100);

const computeGradient = (x: number) => p5.lerpColor(fromColor, toColor, x);

type DrawFunc = (x: number, y: number, noise: number) => void;

const drawersFunction: { [id: string]: DrawFunc } = {
    gradient: drawNoiseGradient,
    coloredBlock1: drawNoiseColored, coloredBlock2: drawNoiseColored2
};
let drawer: DrawFunc = drawersFunction["coloredBlock2"];

function drawBlock(x: number, y: number, color: P5.Color, opacity: number): void {
    color.setAlpha(opacity * 255);
    p5.fill(color);
    p5.rect(x, y, size, size);
}

function drawNoiseGradient(x: number, y: number, noise: number): void {
    drawBlock(x, y, computeGradient(noise), p5.map(p5.cos(noise), -1, 1, 0, 1));
}

function drawNoiseColored(x: number, y: number, noise: number): void {
    if (noise < 0.45)
        drawBlock(x, y, computeGradient(0.45), noise);
    if (noise < 0.6)
        drawBlock(x, y, computeGradient(0.6), noise);
    if (noise < 0.8)
        drawBlock(x, y, computeGradient(0.8), noise);
    if (noise <= 1)
        drawBlock(x, y, computeGradient(1), noise);
}

function drawNoiseColored2(x: number, y: number, noise: number): void {
    if (noise < 0.6)
        drawBlock(x, y, computeGradient(0.6), 0.8);
    else if (noise < 0.8)
        drawBlock(x, y, computeGradient(0.8), 0.6);
    else
        drawBlock(x, y, computeGradient(1), 0.4);

    if (noise < 0.45)
        drawBlock(x, y, computeGradient(0.45), 1);
}

function draw(): void {
    for (let x = 0; x < width; x += size)
        for (let y = 0; y < height; y += size)
            drawer(x, y, computeNoise(x, y));
    offset++;
}

function setupP5(p: p5Instance): void {
    p5 = p;
    fromColor = p5.color(fColor);
    toColor = p5.color(tColor);
    p5.noStroke();
    p5.frameRate(30);
    draw();
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
            offset: offset,
            speed: speed,
            size: size,
            scale: scale,
            fromColor: fColor,
            toColor: tColor,
            drawers: "coloredBlock2",
        };
        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("speed", .1, 10, .1, value => speed = value),
                    list("drawers", ["gradient", "coloredBlock1", "coloredBlock2"],
                        value => drawer = drawersFunction[value]),
                    menu("scale", 1, 25, 1, value => scale = value),
                    menu("size", 5, 50, 1, value => size = value)
                ],
                "Visual & Color" : [
                    color("fromColor", value => fromColor = this.p5.color(value)),
                    color("toColor", value => toColor = this.p5.color(value)),
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>