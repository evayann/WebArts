<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, color, GUIType} from "@/arts/util";
// Recreate from gif : https://jacobjoaquin.tumblr.com/post/108139240121/red-yellow-spiral-tunnel-built-with-processing

let p5: p5Instance;
const sColor = "#8d8585";
const fColor = "#0a0e15";
const tColor = "#efefef";
let fromColor: P5.Color;
let toColor: P5.Color;
let strokeColor: P5.Color;
let strokeSize = 1.7;

let counter = 0;

const cycle = 60;
let startPos: number[];
let move = 10;

let distanceBetweenDepth = 50;

let cycleFactor = 1;
let globalDepth: number;
let elementPerDepth = 8;
let angleRotation: number;

let coloredPositions: number[][] = [];

function computeColor(currDepth: number, el: number): P5.Color {
    const toDist = (d, e) => d * elementPerDepth + e;
    const distance: number = toDist(currDepth, el);
    let distanceColor: number = toDist(globalDepth, elementPerDepth - 1);

    for (const [d, e] of coloredPositions) {
        const dist: number = distance - toDist(d, e);
        if (dist >= 0)
            distanceColor = Math.min(distanceColor, dist);
    }

    return p5.lerpColor(toColor, fromColor, distanceColor / toDist(-startPos[0], startPos[0]));//toDist(globalDepth, elementPerDepth - 1));
}

function incrementCurrentPosition(): void {
    coloredPositions.forEach(([d, el], i) => {
        // Increment position
        coloredPositions[i] = (el == elementPerDepth - 1) ? [d + 1, 0] : [d, el + 1];

        // Remove overlaps elements
        if (d > globalDepth)
            coloredPositions.splice(i, 1);
    });
    // Add new element periodically before the first squares
    if (counter % (cycle / cycleFactor) == 0)
        coloredPositions.push(startPos);
    // Increment counter
    counter += 1;
}

function square(depth: number, depthIndex: number, offset: number, start: number): void {
    for (let j = start; j < elementPerDepth; j += 2) {
        p5.fill(computeColor(depthIndex, j))
        p5.rect(0, depth + 25 + offset, depth * 3, depth);
        p5.rotate(angleRotation * 2);
    }
}

function draw(): void {
    p5.clear();

    p5.stroke(strokeColor);
    p5.strokeWeight(strokeSize);
    p5.background("black");

    p5.translate(centerX, centerY);
    for (let i: number = distanceBetweenDepth; i <= globalDepth * distanceBetweenDepth; i += distanceBetweenDepth) {
        const depthIndex: number = i / distanceBetweenDepth;
        square(i, depthIndex, 0, 0);
        p5.rotate(angleRotation);
        square(i, depthIndex, move, 1);
        p5.rotate(-angleRotation);
    }
    incrementCurrentPosition();
}

function resetPosition(): void {
    startPos = [-Math.floor(cycle / elementPerDepth), cycle % elementPerDepth];
}

function reset(): void {
    coloredPositions = [];
    angleRotation = 360 / elementPerDepth;
    globalDepth = Math.max(height / distanceBetweenDepth, width / distanceBetweenDepth);
    resetPosition();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    strokeColor = p5.color(sColor);
    fromColor = p5.color(fColor);
    toColor = p5.color(tColor);
    p.rectMode(p.CENTER);
    p.angleMode(p.DEGREES);
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
                    menu("Cycle", cycleFactor, .5, 2, .01, value => {cycleFactor = value; resetPosition();}),
                    menu("Number Wall", elementPerDepth, 2, 23, 2, value => {elementPerDepth = value; reset();}),
                    menu("Distance", distanceBetweenDepth, 20, 100, 1, value => {distanceBetweenDepth = value; reset();}),
                    menu("Overlap", move, 0, 50, 1, value => {move = value; reset();}),
                ],
                "Visual & Color": [
                    menu("Stroke Size", strokeSize, .1, 5, .1, value => strokeSize = value),
                    color("From", fColor, value => fromColor = p5.color(value)),
                    color("To", tColor, value => toColor = p5.color(value)),
                    color("Stroke", strokeColor, value => strokeColor = p5.color(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
