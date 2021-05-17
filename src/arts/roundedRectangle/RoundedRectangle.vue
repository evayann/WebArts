<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, time, resetTime, setLoopTime, menu, color, GUIType} from "@/arts/art";
// Recreate from https://www.reddit.com/r/processing/comments/mxas9y/processing_art_tutorial_ep4_loop_of_hues_and/?utm_source=share&utm_medium=mweb

let p5: p5Instance;
let nbRect = 10;
let currRect = 0;
let prev = 0;
let speed = 1;
let iter = 1;
let anim = 0;
let strokeSize = 3;
let scaleSpeed = .05;

const bColor = "#bb5151";
let bgColor: P5.Color;

const colors = ["#52050A", "#6B1336", "#832161", "#8F50A0", "#9B7EDE", "#ACA8E6", "#BCD2EE"];

const cmp = (x) => p5.map(Math.cos(x), -1, 1, 0, 1);

/**
 * Return [rounded tl, rounded tr, rounded br, rounded bl]
 * @param size
 */
function computeCorner(size: number): [number, number, number, number] {
    const t: number = (time * speed) % p5.TAU;
    return [size * cmp(t), size * cmp(t + p5.QUARTER_PI), size * cmp(t + p5.HALF_PI), size * cmp(t + p5.PI)];
}

function shape(size: number, color): void {
    p5.fill(color);
    const [tl, tr, br, bl] = computeCorner(size / 2);
    p5.square(0, 0, size, tl, tr, br, bl);
}

function draw(): void {
    const blockSize: number = Math.min(width, height) - 40;
    if (time * speed > p5.TAU * nbRect * iter) {
        prev = 0;
        currRect = 0;
        iter++;
    }
    if (p5.map(time * speed % (p5.TAU * nbRect), 0, p5.TAU * nbRect, 0, nbRect) > prev) {
        currRect++;
        prev++;
        anim = 1;
    }

    p5.strokeWeight(strokeSize);
    p5.stroke("black");
    p5.translate(centerX, centerY);
    p5.background(bgColor);
    p5.scale(1 / (currRect - (anim > 0 ? anim : 0)));
    for (let i = currRect + 1; --i > 0;)
        shape(blockSize * i, colors[i % colors.length]);
    anim -= scaleSpeed;
}

function reset(): void {
    loop();
    resetTime();
    prev = 0;
    currRect = 0;
    iter = 0;
}

function loop(): void {
    setLoopTime((p5.TAU * nbRect) / speed);
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.rectMode(p5.CENTER);
    bgColor = p5.color(bColor);
    reset();
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
                    menu("Speed", speed, .1, 5, .1, value => {speed = value; loop()}),
                    menu("Max Rectangle", nbRect, 5, 25, 1, value => { nbRect = value; reset(); }),
                    menu("Scale Out Speed", scaleSpeed, .01, 1, .001, value => scaleSpeed = value),
                ],
                "Visual & Color": [
                    color("Background", bColor, value => bgColor = p5.color(value)),
                    menu("Stroke Size", strokeSize, 0, 6, .1, value => strokeSize = value)
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
