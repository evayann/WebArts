<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, color, list, GUIType} from "@/arts/art";
import {range} from "@/arts/util";

let p5: p5Instance;
const bColor = "#000000";
const lColor = "#b7e3ce";
let bgColor: P5.Color;
let lineColor: P5.Color;

let offset = 1;
let size = 20;
let hSize = size / 2;
let scale = 10;
let speed = 1;
let strokeSize = 3;

const computeNoise = (x: number, y: number) =>
        p5.noise((x / width) * scale + (offset * speed) / 100,
            (y / height) * scale + (offset * speed) / 100);

type DrawFunc = (x: number, y: number, noise: number) => void;

const drawersFunction: { [id: string]: DrawFunc } = {
    drawLine: drawLine, drawCurve: drawCurve
};
let drawer: DrawFunc = drawLine;

function drawLine(x: number, y: number, noise: number): void {
    if (noise < .5)
        p5.line(x, y, x + size, y + size);
    else
        p5.line(x, y + size, x + size, y);
}

function drawCurve(x: number, y: number, noise: number): void {
    if (noise < .5) {
        p5.arc(x - hSize, y - hSize, size, size, 0, 90);
        p5.arc(x + hSize, y + hSize, size, size, 180, 270);
    }
    else {
        p5.arc(x - hSize, y + hSize, size, size, 270, 360);
        p5.arc(x + hSize, y - hSize, size, size, 90, 180);
    }
}

function draw(): void {
    p5.background(bgColor);
    p5.stroke(lineColor);
    p5.strokeWeight(strokeSize);
    range(width, size).forEach(x => range(height, size).forEach(y => drawer(x, y, computeNoise(x, y))));
    offset++;
}

function setupP5(p: p5Instance): void {
    p5 = p;
    bgColor = p5.color(bColor);
    lineColor = p5.color(lColor);
    p5.angleMode(p5.DEGREES);
    p5.rectMode(p5.CENTER);
    p5.noFill();
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
                    menu("Speed", speed, .1, 10, .1, value => speed = value),
                    list("Draw Function", "drawLine", Object.keys(drawersFunction),
                        value => drawer = drawersFunction[value]),
                    menu("Scale", scale, 1, 25, 1, value => scale = value),
                    menu("Block Size", size, 5, 50, 1, value => {size = value; hSize = size / 2;})
                ],
                "Visual & Color" : [
                    menu("Stroke Size", strokeSize, 1, 5, .1, value => strokeSize = value),
                    color("From", bColor, value => bgColor = this.p5.color(value)),
                    color("To", lColor, value => lineColor = this.p5.color(value))
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>