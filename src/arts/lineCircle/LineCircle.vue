<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5" @windowresized="this.resizeP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, time, resetTime, menu, color, GUIType, switchButton, setLoopTime} from "@/arts/art";

let p5: p5Instance;
let noColor = false;
const fColor = "#a21c1c";
const tColor = "#3166d4";
let fromColor: P5.Color;
let toColor: P5.Color;
let alpha = 255;

let angle = 0;
let cycle = 1;

let nbSegment = 4;
let xRadius: number = centerX;
let yRadius: number = centerY;
const circleSize = 20;

function drawPoints(): void {
    for (let i = 1; i <= nbSegment; i++) {
        const theta = angle * i;
        const sizeX = p5.cos(theta) * (xRadius - circleSize * 2);
        const sizeY = p5.sin(theta) * (yRadius - circleSize * 2);

        const startX = centerX + sizeX, startY = centerY + sizeY;
        const endX = centerX - sizeX, endY = centerY - sizeY;

        const percent = p5.map(p5.cos(theta + time / cycle), -1, 1, 0, 1);
        const x = p5.lerp(startX, endX, percent);
        const y = p5.lerp(startY, endY, percent);

        !noColor ? p5.fill(p5.lerpColor(fromColor, toColor, percent)) : p5.fill("white");
        p5.circle(x, y, circleSize);
    }
}

function draw(): void {
    p5.fill(0, alpha);
    p5.rect(0, 0, width, height);
    drawPoints();
}

function reset(): void {
    angle = p5.PI / nbSegment;
    resetTime();
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    fromColor = p5.color(fColor);
    toColor = p5.color(tColor);
    p5.noStroke();
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

    resizeP5(): void {
        reset();
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Cycle", cycle,.1, 10, .1, value => {cycle = value; loop();}),
                    menu("Number Circle", nbSegment, 3, 32, 1, value => { nbSegment = value; reset() }),
                    menu("X Radius", xRadius, width / 8, centerX, 1, value => xRadius = value),
                    menu("Y Radius", yRadius, height / 8, centerX, 1, value => yRadius = value),
                ],
                "Visual & Color" : [
                    switchButton("Use Color", "Black & White", value => noColor = value),
                    color("From", fColor, value => fromColor = this.p5.color(value)),
                    color("To", tColor, value => toColor = this.p5.color(value)),
                    menu("Alpha", alpha, 0, 255, 1, value => alpha = value)
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>