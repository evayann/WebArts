<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, time, setLoopTime, resetTime, menu, color, GUIType} from "@/arts/art";
import {easeInOutElastic, easeInOutExpo} from "@/arts/easecurve";
// Inspired by https://twitter.com/concinnus/status/1360831157852635136?s=12

let p5: p5Instance;
const pColor = "#8738e1";
let ptColor: P5.Color;

let speed = 1;
let nbElements = 5;
let blockSize: number = Math.min(width, height) / nbElements;
let size: number = blockSize / 2;
let xEl: number = Math.floor((width / blockSize) / 2) + 2;
let yEl: number = Math.floor((height / blockSize) / 2) + 2;

function drawQuarter(x: number, y: number, rotate: number): void {
    p5.push();
    p5.translate(x, y);
    p5.arc(0, 0, size + 1, size + 1, p5.radians(rotate), p5.radians(rotate) + p5.HALF_PI, p5.PIE);
    p5.pop();
}

function drawHalf(x: number, y: number, rotate: number): void {
    drawQuarter(x, y, rotate);
    drawQuarter(x, y, rotate + 90);
}

function drawHorizontal(x: number, y: number, value: number): void {
    drawHalf(x - blockSize * value, y, 0);
    drawHalf(x + blockSize * value, y, 180);
}

function drawVertical(x: number, y: number, value: number): void {
    drawHalf(x, y - blockSize * value, 90);
    drawHalf(x, y + blockSize * value, 270);
}

function drawRotate(x: number, y: number, value: number): void {
    const rot: number = value * 180;
    const mvt: number = value * blockSize;
    drawQuarter(x + mvt, y + mvt, rot); // Bottom Right
    drawQuarter(x - mvt, y + mvt, 90 + rot); // Bottom Left
    drawQuarter(x - mvt, y - mvt, 180 + rot); // Top Left
    drawQuarter(x + mvt, y - mvt, 270 + rot); // Top Right
}

function drawCircle(x: number, y: number, value: number): void {
    if (value < 3)
        drawRotate(x, y, easeInOutExpo(p5.map(value, 0, 3, 0, 1)));
    else if (value < 4)
        drawVertical(x, y, easeInOutElastic(p5.map(value, 3, 4, 0, 1)));
    else
        drawHorizontal(x, y, easeInOutElastic(p5.map(value, 4, 5, 0, 1)));
}

function draw(): void {
    p5.background("black");
    p5.stroke(ptColor);
    p5.fill(ptColor);
    const anim: number = (time * speed) % 5;
    p5.translate(width / 2, height / 2);
    for (let y = -yEl * blockSize; y <= yEl * blockSize; y += blockSize)
        for (let x = -xEl * blockSize; x <= xEl * blockSize; x += blockSize)
            drawCircle(x, y, anim);
}

function reset(): void {
    p5.clear();
    resetTime();
    blockSize = Math.min(width, height) / nbElements;
    size = blockSize / 2;
    xEl = p5.int((width / blockSize) / 2) + 2;
    yEl = p5.int((height / blockSize) / 2) + 2;
    setLoopTime(speed * 5);
    draw();
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        p5 = p;
        ptColor = p5.color(pColor);
        p5.frameRate(60);
        p5.strokeWeight(2);
        reset();
    }

    drawP5(p: p5Instance): void {
        super.drawP5(p);
        draw();
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Speed", speed, .1, 5, .01, value => {speed = value; reset();}),
                    menu("Number Circle", nbElements, 5, 20, 1, value => { nbElements = value; reset(); }),
                ],
                "Visual & Color": [
                    color("Circle", pColor, value => { ptColor = value; this.p5.stroke(ptColor)} ),
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>