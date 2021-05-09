<template>
    <P5Vue :canvas3D="true" @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, switchButton, color, GUIType} from "@/arts/util";
// Inspiration of https://twitter.com/beesandbombs/status/1334573053053972485

let p5: p5Instance;
const bColor = "#0a0e15";
const sColor = "#ffffff";
let backgroundColor: P5.Color;
let strokeColor: P5.Color;
let strokeSize = 1.7;

let counter = 0;
let cubeSize = 50;
let halfCube: number = cubeSize / 2;

let speedFactor = 1;
let waveFactor = 0.25;
let scaleBox = false;

function computeScale(x: number, y: number): number {
    return p5.map(p5.cos(computeRotation(x, y) + counter * 0.1 * speedFactor), -1, 1, 0, 1);
}

function computeRotation(x: number, y: number): number {
    // radius * factor + theta
    return p5.dist(x, y, 0, 0) * waveFactor + p5.atan2(y, x);
}

function draw(): void {
    p5.clear();
    p5.background(backgroundColor);

    p5.ortho();
    p5.rotateX(-30);
    p5.stroke(strokeColor);
    p5.strokeWeight(strokeSize);
    p5.fill(0, 0, 0, 0);

    let offsetX = halfCube / 2;
    for (let j = -1 * cubeSize; j < height + cubeSize; j += cubeSize) {
        for (let i = 0; i < width; i += cubeSize) {
            p5.push();
            p5.translate(offsetX + i - centerX, j - centerY);
            p5.rotateY(computeRotation(-(offsetX + i - centerX), -(j - centerY)) + counter * speedFactor);
            p5.box((!scaleBox) ? halfCube : halfCube - computeScale(-(offsetX + i - centerX), -(j - centerY)) * halfCube);
            p5.pop();
        }
        offsetX = -offsetX;
    }
    counter += 100;
}

function reset(): void {
    counter = 0;
    halfCube = cubeSize / 2;
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    backgroundColor = p5.color(bColor);
    strokeColor = p5.color(sColor);
    p.frameRate(60);
    p.angleMode(p.DEGREES);
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
                    menu("Speed", speedFactor, .7, 1.3, .01, value => speedFactor = value),
                    menu("Cube Size", cubeSize, 30, 300, 1, value => {cubeSize = value; reset();}),
                    switchButton("Different Size", "Same Size", value => scaleBox = value),
                    menu("Wave", waveFactor, .01, 1, .01, value => waveFactor = value),
                ],
                "Visual & Color": [
                    menu("Stroke Size", strokeSize, .1, 5, .1, value => strokeSize = value),
                    color("Stroke", strokeColor, value => strokeColor = p5.color(value)),
                    color("Background", backgroundColor, value => backgroundColor = p5.color(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
