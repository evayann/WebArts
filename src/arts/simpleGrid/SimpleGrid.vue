<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, seed, menu, switchButton, color, GUIType} from "@/arts/util";

let widthGrid = 80;
let heightGrid = 80;

let useColor = true;
const bColor = "#23172a";
const fColor = "#4e7de0";
const tColor = "#886400";
let backgroundColor: P5.Color;
let fromColor: P5.Color;
let toColor: P5.Color;

let nbLines = 1;
let spaceBetweenLine = 2;

function drawLine(p: p5Instance, x: number, y: number): void {
    let left = false;
    if (p.random(0, 1) < 0.5)
        left = true;

    for (let i = -nbLines / 2; i <= nbLines / 2; i++) {
        const incX: number = x, incY = (left) ? y - i * spaceBetweenLine : y + i * spaceBetweenLine;

        if (useColor)
            p.stroke(p.lerpColor(fromColor, toColor, ((incX + widthGrid) / width + (incY + heightGrid) / height) / 2.0));
        else
            p.stroke(0);

        if (left)
            p.line(incX, incY, incX + widthGrid, incY + heightGrid);
        else
            p.line(incX, incY + heightGrid, incX + widthGrid, incY);
    }
}

function draw(p: p5Instance): void {
    p.clear();
    p.background(backgroundColor);
    p.randomSeed(seed);
    for (let i = 0; i < width; i += widthGrid)
        for (let j = 0; j < height; j += heightGrid)
            drawLine(p, i, j);
    p.noLoop();
}

function setupP5(p: p5Instance): void {
    fromColor = p.color(fColor);
    toColor = p.color(tColor);
    backgroundColor = p.color(bColor);
    draw(p);
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5(p);
    }

    drawP5(p: p5Instance): void {
        draw(p);
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Grid Width",widthGrid, 10, 500, 1, value => {widthGrid = value; draw(this.p5);}),
                    menu("Grid Height", heightGrid, 10, 500, 1, value => {heightGrid = value; draw(this.p5);}),
                    menu("Offset", spaceBetweenLine, 1, 10, 1, value => {spaceBetweenLine = value; draw(this.p5);}),
                    menu("Number Lines", nbLines, 1, 5, 1, value => {nbLines = value; draw(this.p5);}),
                ],
                "Visual & Color": [
                    switchButton("Use Color", "Black", value => {useColor = value; draw(this.p5);}),
                    color("Background", bColor, value => {backgroundColor = this.p5.color(value); draw(this.p5)}),
                    color("From", fColor, value => {fromColor = this.p5.color(value); draw(this.p5)}),
                    color("To", tColor, value => {toColor = this.p5.color(value); draw(this.p5)})
                ],
                "Misc": [this.seed(() => draw(this.p5))]
            }
        });
    }
}
</script>