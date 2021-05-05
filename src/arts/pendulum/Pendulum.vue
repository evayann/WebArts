<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5" @windowresized="this.resizeP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth, halfHeight, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, button, color, GUIType} from "@/util";

let armLength: number = Math.min(halfWidth, halfHeight) / 2;

let p5: p5Instance;
const hColor = "#b98a5d";
let historyColor: P5.Color;

let damping = .99;
let histLength = 500;
let hidePendulum = true;

const m1 = 10;
let a1X = 0;
let a1XV = 0;
let a1Y = 0;
let a1YV = 0;
let g = 1;
let history: Array<number[]> = [];

function updateHistory(x: number, y: number): void {
    p5.strokeWeight(1);
    p5.stroke(historyColor);
    p5.noFill();

    p5.beginShape();
    for (const [xo, yo] of history)
        p5.vertex(xo, yo);
    p5.endShape();

    history.push([x, y]);
    if (history.length > histLength)
        history.splice(0, 1);
}

function update(): number[] {
    const grav: number = -g / armLength;

    const a1AX = grav * p5.sin(a1X);
    a1XV = (a1XV + a1AX) * damping;
    a1X += a1XV;

    const a1AY = grav * p5.sin(a1Y);
    a1YV = (a1YV + a1AY) * damping;
    a1Y += a1YV;

    return [halfWidth * 1.5 * p5.sin(a1X), halfHeight * 1.5 * p5.sin(a1Y)];
}

function display(xy: number[]): void {
    const [x, y] = xy;
    p5.translate(halfWidth, halfHeight);
    updateHistory(x, y);
    if (hidePendulum)
        return;
    p5.stroke(255);
    p5.line(0, 0, x, y);
    p5.strokeWeight(2);
    p5.fill(0);
    p5.circle(x, y, m1);
}

function draw() {
    p5.background("black");
    display(update());
}

function reset(): void {
    p5.clear();
    history = [];
    a1X = p5.random(0, p5.PI);
    a1Y = p5.random(0, p5.PI);
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    historyColor = p5.color(hColor);
    p5.stroke(historyColor);
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

    resizeP5(): void {
        armLength = Math.min(halfWidth, halfHeight) / 2;
    }

    generateUI(): GUIType {
        const params = {
            gravity: g,
            damping: damping,
            histLength: histLength,
            historyColor: hColor,
            hidePendulum: hidePendulum
        };
        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("gravity", .01, 2, .01, value => g = value),
                    menu("damping", 0.9, 1, .001, value => damping = value),
                    menu("histLength", 0, 1000, 1, value => histLength = value)
                ],
                "Visual & Color": [
                    color("historyColor", value => {historyColor = p5.color(value); p5.stroke(historyColor);}),
                    button("hidePendulum", value => {hidePendulum = value; draw();})
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>