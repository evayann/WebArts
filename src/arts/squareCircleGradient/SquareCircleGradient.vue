<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, color, GUIType} from "@/arts/util";
// Inspired by https://twitter.com/concinnus/status/1360423475631058950?s=12


let p5: p5Instance;
const sColor = "#f26060";
const tColor = "#60f273";
let stColor: P5.Color;
let toColor: P5.Color;

let speed = 1;
let time = 0;
let nbElements = 1;
let inc = true;

let toDraw: Array<Circle> = [];

class Circle {
    private readonly x: number;
    private readonly y: number;
    private readonly s: number;
    private readonly hs: number;
    private readonly start: number;
    private life: number;

    constructor(x: number, y: number, size: number) {
        this.s = size;
        this.hs = this.s / 2;
        this.x = x + this.hs;
        this.y = y + this.hs;
        this.start = time;
        this.life = 0;
        toDraw.unshift(this);
    }

    display(): void {
        this.life = time - this.start;
        p5.fill(p5.lerpColor(stColor, toColor, this.life));
        p5.square(this.x, this.y, p5.abs(this.s - this.life * this.s), this.life * this.s / 2);
        if (this.life > 1)
            toDraw.splice(toDraw.indexOf(this), 1);
    }
}

const generate = (x: number): boolean => p5.sq(x) % 1 < .95;

function draw(): void {
    p5.background("black");
    time += 0.01 * speed;
    p5.stroke("white");
    let xOffset = 0, yOffset = 0;
    (width > height) ? xOffset = (width - height) / 2 : yOffset = (height - width) / 2;
    const gSize: number = p5.min(width, height);
    const size: number = gSize / nbElements;

    if (generate(time)) {
        inc = true;
        for (let yi = 0; yi < nbElements; yi++)
            for (let xi = 0; xi < nbElements; xi++)
                new Circle(xOffset + xi * size, yOffset + yi * size, size);
    } else {
        if (inc) {
            nbElements = (nbElements + 1) % 5;
            inc = false;
        }
    }

    for (const c of toDraw)
        c.display();
}

function reset(): void {
    p5.clear();
    time = 0;
    nbElements = 1;
    toDraw = [];
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    stColor = p5.color(sColor);
    toColor = p5.color(tColor);
    p5.rectMode(p5.CENTER);
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
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Speed", speed, .1, 5, .1, value => speed = value)
                ],
                "Visual & Color": [
                    color("From", sColor, value => stColor = p5.color(value)),
                    color("To", tColor, value => toColor = p5.color(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
