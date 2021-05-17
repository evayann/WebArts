<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, color, GUIType, setLoopTime} from "@/arts/art";
// Inspired by https://mobile.twitter.com/beesandbombs/status/1334541858366775298

let p5: p5Instance;

let partA: P5.Graphics;
let partB: P5.Graphics;
const fColor = "#ffffff";
const sColor = "#3166d4";
let fillColor: P5.Color;
let strokeColor: P5.Color;

let angle = 0;
let cycle = 1;

let nbSegment = 3;
let elements = 60;
let xRadius = 300;
let yRadius = 300;
let size = 70;

function generatePoints(): { index: number, point: number[] }[] {
    const points: { index: number, point: number[] }[] = [];
    const offset: number = (nbSegment == 3) ? p5.HALF_PI / 3 : 0;
    for (let i = 0; i < nbSegment; i++) {
        const theta = angle * i + offset;
        points[i] = {index: i, point: [centerX + p5.cos(theta) * xRadius, centerY + p5.sin(theta) * yRadius]};
    }
    return points;
}

function drawSquare(part: P5.Graphics, x: number, y: number, i: number): void {
    part.push();
    part.translate(x, y);
    part.rotate(i);
    part.rect(0, 0, size, size);
    part.pop();
}

function drawSens(pts: { index: number, point: number[] }[], previous: number[], part: P5.Graphics): void {
    for (const pt of pts) {
        const [x1, y1] = previous;
        const [x2, y2] = pt.point;
        for (let j = 0; j < elements; j++) {
            const x: number = p5.lerp(x1, x2, j / elements);
            const y: number = p5.lerp(y1, y2, j / elements);
            drawSquare(part, x, y,
                (((j + pt.index * elements) / (elements * nbSegment)) * p5.TAU
                    + (p5.millis() / 500) * (1 / cycle)));
        }
        previous = pt.point;
    }
}

function drawSquareLoop(): void {
    let pts: { index: number, point: number[] }[] = generatePoints();
    let previous: number[] = pts[pts.length - 1].point;
    drawSens(pts, previous, partA);

    const len: number = pts.length - 1;
    const half: number = ~~(pts.length / 2);
    pts = pts.slice(half, len + 1).concat(pts.slice(0, half));
    previous = pts[pts.length - 1].point;
    drawSens(pts, previous, partB);

    p5.image(partA.get(0, height / 2 - 50, width, height / 2 + 50), 0, height / 2 - 50);
    p5.image(partB.get(0, 0, width, height / 2), 0, 0);
}

function draw(): void {
    partA.clear();
    partB.clear();
    p5.background("black");
    partA.stroke(strokeColor);
    partB.stroke(strokeColor);
    partA.fill(fillColor);
    partB.fill(fillColor);
    drawSquareLoop();
}

function reset(): void {
    angle = p5.TAU / nbSegment;
    partA.resizeCanvas(width, height);
    partB.resizeCanvas(width, height);
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    fillColor = p5.color(fColor);
    strokeColor = p5.color(sColor);
    partA = p5.createGraphics(width, height);
    partB = p5.createGraphics(width, height);
    p5.rectMode(p5.CENTER);
    partA.rectMode(p5.CENTER);
    partB.rectMode(p5.CENTER);
    loop();
    reset();
}

function loop(): void {
    setLoopTime(cycle * p5.TAU);
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
                    menu("Cycle", cycle, .1, 5, .1, value => {cycle = value; loop();}),
                    menu("Number Segment", nbSegment, 3, 20, 1, value => {nbSegment = value; reset();}),
                    menu("Elements per Segment", elements, 3, 60, 1, value => {elements = value; reset();}),
                    menu("Element Size", size, size / 4, size * 2, 1, value => size = value),
                    menu("X Radius", xRadius, xRadius / 8, centerX, 1, value => xRadius = value),
                    menu("Y Radius", yRadius, yRadius / 8, centerY, 1, value => yRadius = value)
                ],
                "Visual & Color": [
                    color("Stroke", sColor, value => strokeColor = p5.color(value)),
                    color("Fill", fColor, value => fillColor = p5.color(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>