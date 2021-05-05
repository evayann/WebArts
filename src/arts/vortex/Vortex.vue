<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, color, GUIType} from "@/util";

let p5: p5Instance;
const pColor = "#b98a5d";
let ptColor: P5.Color;

let speed = 1;
let time = 0;
let conicShape = 0.26;
let inclination = 2;
let radius = 0;

function draw(): void {
    p5.background("black");
    time += 0.01 * speed;
    for (let i = 0; i < 1500; i++) {
        const j: number = p5.map(p5.cos(time), -1, 1, 0, 1) * i;
        p5.strokeWeight((0.5 + (i / 1500)) * 3);
        const rIncl: number = radius / inclination;
        const a: number = j * conicShape + time;
        const x: number = halfWidth + p5.sin(a) * radius;
        const y: number = height + p5.cos(a) * rIncl - j;
        radius = p5.pow(j, 3) / 1e5;
        p5.point(x, y);
    }
}

function reset(): void {
    p5.clear();
    time = 0;
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    ptColor = p5.color(pColor);
    p5.createCanvas(width, height);
    p5.stroke(ptColor);
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
        const params = {
            speed: speed,
            conicShape: conicShape,
            inclination: inclination,
            ptColor: pColor
        };
        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("speed", .1, 2, .1, value => speed = value),
                    menu("conicShape", 0, 1, .01, value => conicShape = value),
                    menu("inclination", .8, 5, .1, value => inclination = value)
                ],
                "Visual & Color": [
                    color("ptColor", value => {ptColor = p5.color(value); p5.stroke(ptColor);})
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>