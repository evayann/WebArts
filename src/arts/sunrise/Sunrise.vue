<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, time, menu, setLoopTime, GUIType} from "@/arts/art";
// Inspired by https://openprocessing.org/sketch/743278

let p5: p5Instance;

let size: number;
let speed = 1;
let nbLines = 34;
let sunSize = 1.1;
let moonSize = .6;
let earthSize = .9;
let sunOffset = 1.5;
let moonOffset = 1.5;
let earthOffset = 1.3;
let sunColor = 0;
let moonColor = 0;
let earthColor = 0;

const radius = (percent: number) => percent * size / 10 + size / 32;
const skyColor = (height: number, percent: number) => height > 0 ?
    p5.fill(195, 340, 20 + percent * 240) :
    p5.fill(195, 280, 20 + percent * 20);
const getX = (cx: number, cy: number, r: number, y: number) => p5.sqrt(p5.sq(r) - p5.sq(y - cy));
const circlePos = (percent: number) => {
    const rad = p5.map(percent, 0, 1, 0, p5.TAU);
    return [Math.cos(rad) * size / 3, Math.sin(rad) * size / 3];
};
const parseArray = (arr: Array<[number, number]>, ifNan: number) =>
    arr.map(v => isNaN(v[0]) ? [ifNan, v[1]] : v);

function earth(percent: number): void {
    p5.noStroke();
    p5.fill((earthColor + 105 + percent * 45) % 360, percent * 180, 20 + percent * 115);
    p5.circle(0, 0, (size / 4) * earthSize);
}

function moonSun(percent: number, cx: number, cy: number): void {
    p5.noStroke();
    const r = radius(percent);

    // Sky
    skyColor(-cy, percent);
    p5.rect(0, -size / 4, size, size / 2);
    skyColor(cy, percent);
    p5.rect(0,  size / 4, size, size / 2);

    // Sun
    p5.fill((sunColor + 20 + percent * 45) % 360, percent * 360, 20 + percent * 115);
    p5.circle(cx, cy, 2 * r * sunSize);

    // Moon
    p5.fill((moonColor + 200 + percent * 45) % 360, percent * 45, 20 + percent * 115);
    p5.circle(-cx, -cy, 2 * r * moonSize);
}

function clouds(percent: number, cx: number, cy: number): void {
    const hs: number = size / 2;
    p5.stroke(225 + percent * 30);
    p5.strokeWeight(5);
    for (let y = -size / 2; y <= size / 2; y += size / (nbLines - 1)) {
        const xs: Array<[number, number]> = [
            [getX(0, 0, (size / 8) * earthSize * earthOffset, y), 0], // Earth
            [getX(cx, cy, radius(percent) * sunSize * sunOffset, y), cx], // Sun
            [getX(-cx, -cy, radius(percent) * moonSize * moonOffset, y), -cx], // Moon
        ];
        const [xMax, xMaxCenter] = parseArray(xs, -size).reduce((max, v) => v[1] + v[0] > max[1] + max[0] ? v : max);
        const [xMin, xMinCenter] = parseArray(xs, size).reduce((min, v) => v[1] + v[0] < min[1] + min[0] ? v : min);
        p5.line(hs, y, xMax === -size ? 0 : xMaxCenter + xMax, y);
        p5.line(-hs, y, xMin === size ? 0 : xMinCenter - xMin, y);
    }
}

function draw(): void {
    p5.clear();
    size = Math.min(width, height) - 20;
    p5.translate(centerX, centerY);
    const t: number = (time / 10) * speed;
    const [cx, cy] = circlePos(t);
    const percent = 1 - p5.abs(((t * 2) % 1) - .5) * 2;
    moonSun(percent, cx, cy);
    earth(percent);
    clouds(percent, cx, cy);
}

function loop(): void {
    setLoopTime(10 / speed);
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.background(51);
    p5.colorMode(p5.HSB);
    p5.rectMode(p5.CENTER);
    loop();
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
                    menu("Speed", speed, .1, 3, .1, value => {speed = value; loop();}),
                    menu("Number lines", nbLines, 5, 50, 1, value => nbLines = value),
                    menu("Earth Size", earthSize, .5, 2, .01, value => earthSize = value),
                    menu("Moon Size", moonSize, .5, 2, .01, value => moonSize = value),
                    menu("Sun Size", sunSize, .5,  2, .01, value => sunSize = value),
                    menu("Earth Offset", earthOffset, 1.1, 2, .01, value => earthOffset = value),
                    menu("Moon Offset", moonOffset, 1.1, 2, .01, value => moonOffset = value),
                    menu("Sun Offset", sunOffset, 1.1,  2, .01, value => sunOffset = value)
                ],
                "Visual & Color": [
                    menu("Earth", earthColor, 0, 360, 1, value => earthColor = value),
                    menu("Moon", moonColor, 0, 360, 1, value => moonColor = value),
                    menu("Sun", sunColor, 0, 360, 1, value => sunColor = value)
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>