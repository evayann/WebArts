<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth, halfHeight, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, color, GUIType} from "@/util";
// Inspired by https://www.reddit.com/r/generative/comments/ljiy5d/can_a_circle_rotate/?utm_source=share&utm_medium=ios_app&utm_name=iossmf

let p5: p5Instance;
const pColor = "#f26060";
let ptColor: P5.Color;

let speed = 1;
let time = 0;
let nbElements = 25;

function drawCircle(x: number, y: number, size: number, value: number): void {
    const dist: number = p5.dist(x, y, halfWidth, halfHeight);
    const normDist: number = dist / p5.dist(0, 0, halfWidth, halfHeight);
    p5.push();
    p5.translate(x, y);
    p5.rotate(normDist * value);
    p5.fill(p5.color(p5.red(ptColor) * normDist, p5.green(ptColor) * normDist, p5.blue(ptColor) * normDist));
    p5.square(0, 0, p5.abs(.5 - value) * size * 2, value > .5 ? size : 0);
    p5.pop();
}

function draw(): void {
    p5.background("black");
    time += 0.01 * speed;
    p5.stroke("white");
    const anim: number = p5.map(p5.cos(time), -1, 1, 0, 1);
    const size: number = (p5.max(width, height) / nbElements) * 1.5;
    const yOffset: number = height / (nbElements * 2);
    const xOffset: number = width / (nbElements * 2);
    p5.translate(halfWidth, halfHeight);
    p5.rotate(time * 0.1 * speed);
    const maxSize: number = p5.max(halfWidth, halfHeight) * 1.5;
    for (let yi = 0; yi < nbElements; yi++) {
        const y: number = yOffset + p5.height / (nbElements * 2) + p5.map(yi, 0, nbElements, -maxSize, maxSize);
        const xOff: number = ((yi % 2 == 0) ? xOffset : 0) + xOffset / 2;
        for (let xi = 0; xi <= nbElements; xi++) {
            const x: number = xOff + p5.map(xi, 0, nbElements, -maxSize, maxSize);
            drawCircle(x, y, size, anim);
        }
    }
}

function reset(): void {
    p5.clear();
    time = 0;
    draw();
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        p5 = p;
        ptColor = p5.color(pColor);
        p5.frameRate(60);
        p5.strokeWeight(2);
        reset();
    }

    drawP5(p: p5Instance): void {
        draw();
    }

    generateUI(): GUIType {
        const params = {
            speed: speed,
            nbElements: nbElements,
            ptColor: pColor,
            pause: () => undefined,
            reset: () => undefined
        };
        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("speed", .1, 5, .01, value => speed = value),
                    menu("nbElements", 10, 100, 1, value => { nbElements = value; reset(); }),
                ],
                "Visual & Color": [
                    color("ptColor", value => { ptColor = value; this.p5.stroke(ptColor)} ),
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>