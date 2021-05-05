<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth, halfHeight, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, button, color, GUIType} from "@/util";
// Recreate from gif : https://twitter.com/verytiredrobot/status/1345448387949309954?s=12

let p5: p5Instance;
const eColor = "#9e9eca";
const fColor = "#ca5a5a";
let emptyColor: P5.Color;
let fillColor: P5.Color;
let alpha = 120;
let spaceOffset = 20;

const False = 0;
const True = 1;
let gridHeight = 10;
const gridWidth: number = 2 * gridHeight - 1;
let currentGrid: number[][];
let nextGrid: number[][];

let counter = 0;
let updateTime = 0.75;
const fps = 60;
let initSegment = 3;
let rounded = true;

let drawer;
let rotateOffset = 0;

function computePosition(theta, gen): number[] {
    return [halfWidth + p5.cos(theta) * gen * 25, halfHeight + p5.sin(theta) * gen * 25];
}

function setDrawer(round: boolean): void {
    if (round)
        drawer = (oldTheta: number, currTheta: number, spaceBetween: number, generation: number) => {
            p5.noFill();
            p5.arc(halfWidth, halfHeight, generation * 50, generation * 50, oldTheta + spaceBetween, currTheta - spaceBetween);
        };
    else
        drawer = (oldTheta: number, currTheta: number, spaceBetween: number, generation: number) => {
            const [ox, oy] = computePosition(oldTheta + spaceBetween, generation);
            const [x, y] = computePosition(currTheta - spaceBetween, generation);
            p5.line(ox, oy, x, y);
        };
    p5.fill("black");
    p5.background("black");
}

function rule(p: number, q: number, r: number): number {
    return p ^ (p && q || r);
}

function parents(x: number, y: number): number {
    const top: number = (y - 1) < 0 ? gridHeight + y - 1 : (y - 1) % gridHeight;
    const xm1: number = (x - 1) < 0 ? gridWidth + x - 1 : (x - 1) % gridWidth;
    const p: number = currentGrid[top][xm1];
    const q: number = currentGrid[top][x];
    const r: number = currentGrid[top][(x + 1) % gridWidth];
    return rule(p, q, r);
}

function computeGeneration(): void {
    currentGrid[0][0] = p5.random() > 0.5 ? True : False;
    for (let i = 0; i < gridHeight; i++)
        for (let j = 0; j < gridWidth; j++)
            nextGrid[i][j] = parents(j, i);

    // Update generation, Buffer Swap
    [currentGrid, nextGrid] = [nextGrid, currentGrid];
}

function drawAutomata(): void {
    let nbPartAtGen: number = initSegment - 2;
    p5.stroke((currentGrid[0][0] == True) ? fillColor : emptyColor);
    p5.circle(halfWidth, halfHeight, 10);
    let oldTheta = -1, initTheta = 0;
    for (let r = 1; r < currentGrid.length - 1; r++) {
        nbPartAtGen += 2;
        const spaceBetween: number = spaceOffset / r;
        const angle: number = 360 / nbPartAtGen;
        for (let j = 1; j <= nbPartAtGen; j++) {
            p5.stroke((currentGrid[r][j - 1] == True) ? fillColor : emptyColor);

            const theta: number = angle * j + rotateOffset;
            if (oldTheta == -1) {
                oldTheta = theta;
                initTheta = theta;
            } else {
                drawer(oldTheta, theta, spaceBetween, r);
                oldTheta = theta;
            }
        }
        p5.stroke((currentGrid[r][nbPartAtGen - 1] == True) ? fillColor : emptyColor);
        drawer(oldTheta, initTheta, spaceBetween, r);
        oldTheta = -1;
        rotateOffset += 25;
    }
    rotateOffset = 0;
}

function drawP5(): void {
    drawAutomata();
    counter++;
    if (counter / fps >= updateTime) {
        computeGeneration();
        counter = 0;
    }
}

function reset(): void {
    setDrawer(rounded);
    currentGrid = new Array(gridHeight).fill(False).map(() => new Array(gridWidth).fill(False));
    nextGrid = new Array(gridHeight).fill(False).map(() => new Array(gridWidth).fill(False));
    for (let i = 0; i < p5.random(200, 500); i++)
        computeGeneration();
    counter = 0;
    drawP5();
}

function setColor(): void {
    emptyColor = p5.color(eColor);
    fillColor = p5.color(fColor);
    emptyColor.setAlpha(alpha);
    fillColor.setAlpha(alpha);

    p5.fill("black");
    p5.background("black");
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.angleMode(p5.DEGREES);
    p5.frameRate(fps);
    p5.strokeWeight(7);
    p5.strokeCap(p5.ROUND);
    setColor();
    reset();
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5(p);
    }

    drawP5(): void {
        drawP5();
    }

    generateUI(): GUIType {
        const params = {
            updateTime: updateTime,
            nbGeneration: gridHeight,
            spaceOffset: spaceOffset,
            rounded: rounded,
            alpha: alpha,
            strokeSize: 7,
            fillColor: fColor,
            emptyColor: eColor,
            initSegment: initSegment,
            pause: () => undefined,
            reset: () => undefined
        };

        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("updateTime", .1, 5, .1, value => updateTime = value),
                    menu("initSegment", 3, 7, 1, value => {initSegment = value; reset(); }),
                    menu("nbGeneration", 5, 40, 1, value => {gridHeight = value; reset(); }),
                    menu("spaceOffset", 15, 25, 1, value => {spaceOffset = value; setColor(); }),
                ],
                "Visual & Color": [
                    button("rounded", value => {rounded = value; setDrawer(rounded)}),
                    color("fillColor", value => fillColor = value),
                    color("emptyColor", value => emptyColor = value),
                    menu("alpha", 0, 255, 1, value => {alpha = value; setColor(); }),
                    menu("strokeSize", 1, 12, .1, value => {this.p5.strokeWeight(value); setColor(); }),
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>