<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth, halfHeight, p5Instance} from "@/components/P5.vue";
import {ArtVue, time, setLoopTime, resetTime, menu, switchButton, GUIType} from "@/arts/art";

let p5: p5Instance;
// Inspired from https://www.reddit.com/r/loadingicon/comments/m4yept/overlapping_waves_oc/?utm_source=share&utm_medium=ios_app&utm_name=iossmf

let speed = 1;
let nbLoop = 5;
let nbPoint = 1000;
let makeWave: (value: number, from: number, to: number) => void;

function flatWave(value: number, from: number, to: number): void {
    p5.beginShape();
    for (let i = nbPoint + 1; i--;) {
        const prct: number = i / nbPoint;
        const y: number = (prct > from && prct < to) ? 0 : p5.cos(value + prct * 3 * p5.TAU) * (halfHeight * 0.5);
        p5.curveVertex(p5.map(i, 0, nbPoint, -halfWidth, halfWidth), y);
    }
    p5.endShape();
}

function circleWave(value: number, from: number, to: number): void {
    const size: number = Math.min(halfWidth / 2, halfHeight / 2);
    p5.beginShape();
    for (let i = nbPoint + 1; i--;) {
        const prct: number = i / nbPoint;
        const v: number = value + prct * nbLoop * p5.TAU;
        const x: number = p5.cos(prct * p5.TAU) * size;
        const y: number = p5.sin(prct * p5.TAU) * size;
        if (prct >= from && prct <= to) {
            const s: number = p5.map(Math.min(to - prct, prct - from), 0, 0.5, 0, 1) * size / 2;
            p5.vertex(x + p5.cos(v) * s, y + p5.sin(v) * s);
        } else
            p5.vertex(x, y);
    }
    p5.endShape();
}

function waves(): void {
    const p: number = p5.abs(p5.cos(time / 10)) / 2;

    p5.stroke("yellow");
    makeWave(time * speed, .5 - p, .5 + p);
    p5.stroke("blue");
    makeWave(time * speed + p5.TAU * .33, .5 - p, .5 + p);
    p5.stroke("red");
    makeWave(time * speed + p5.TAU * .66, .5 - p, .5 + p);
}

function draw(): void {
    p5.clear();
    p5.background("black");
    p5.translate(halfWidth, halfHeight);
    waves();
}

function reset(): void {
    p5.clear();
    resetTime();
    draw();
}

function setWaver(value: boolean): void {
    makeWave = value ? circleWave : flatWave;
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.blendMode(p5.ADD);
    p5.noFill();
    p5.strokeWeight(5);
    setWaver(true);
    loop();
    reset();
}

function loop(): void {
    setLoopTime((nbLoop * p5.TAU * 2) / speed);
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
                    menu("Speed", speed, .1, 2, .1, value => {speed = value; loop();}),
                    menu("Number Loop", nbLoop, 0, 10, 1, value => nbLoop = value),
                    menu("Number Point", nbPoint, 10, 1000, 1, value => nbPoint = value),
                    switchButton("Circle", "Line", value => setWaver(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
