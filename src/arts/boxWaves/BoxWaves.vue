<template>
    <P5Vue :canvas3D="true" @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth, halfHeight, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, button, color, GUIType} from "@/arts/util";

let p5: p5Instance;
const bfColor = "#781818";
let boxFillColor: P5.Color;
const bsColor = "#627d7d";
let boxStrokeColor: P5.Color;

let cycle = 1;
let time = 0;
const max = 5;
let amplitude = 10;
let chaos = false;
let boxs: Array<Box> = [];

class Box {
    private readonly x: number;
    private readonly y: number;
    private readonly w: number;
    private readonly h: number;
    private readonly distCenterRatio: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.distCenterRatio = p5.dist(0, 0, x, y) / p5.dist(0, 0, halfWidth, halfHeight);
    }

    draw(): void {
        p5.push();
        p5.translate(this.x + this.w / 2, this.y + this.h / 2);
        p5.box(this.w, this.h,
            lerpTrigo(1, 500, p5.cos((time * cycle) + this.distCenterRatio * amplitude)));
        p5.pop();
    }
}

function lerpTrigo(from: number, to: number, t: number): number {
    return p5.lerp(from, to, p5.map(t, -1, 1, 0, 1));
}

function splitSquare(x: number, y: number, w: number, h: number,
                     xOff: number, yOff: number, it: number): void {
    if (it >= max)
        boxs.push(new Box(x, y, w, h));
    else {
        splitSquare(x, y, w * xOff, h * yOff, p5.random(.2, .8), p5.random(.2, .8), it + 1);
        splitSquare(x + w * xOff, y, w * (1 - xOff), h * yOff, p5.random(.2, .8), p5.random(.2, .8), it + 1);
        splitSquare(x + w * xOff, y + h * yOff, w * (1 - xOff), h * (1 - yOff), p5.random(.2, .8), p5.random(.2, .8), it + 1);
        splitSquare(x, y + h * yOff, w * xOff, h * (1 - yOff), p5.random(.2, .8), p5.random(.2, .8), it + 1);
    }
}

function drawP5(p5: p5Instance): void {
    p5.background("black");
    p5.fill(boxFillColor);
    p5.stroke(boxStrokeColor);
    p5.scale(0.4);
    p5.rotateX(0.6);
    boxs.forEach(box => box.draw());
    time += .02;
}

function reset(): void {
    p5.clear();
    boxs = [];
    const size: number = Math.min(width, height);
    if (!chaos) {
        splitSquare(-size, -size, size, size, 0.75, 0.75, 1);
        splitSquare(0, -size, size, size, 0.25, 0.75, 1);
        splitSquare(0, 0, size, size, 0.25, 0.25, 1);
        splitSquare(-size, 0, size, size, 0.75, 0.25, 1);
    } else {
        splitSquare(-size, -size, size, size, p5.random(.2, .8), p5.random(.2, .8), 1);
        splitSquare(0, -size, size, size, p5.random(.2, .8), p5.random(.2, .8), 1);
        splitSquare(0, 0, size, size, p5.random(.2, .8), p5.random(.2, .8), 1);
        splitSquare(-size, 0, size, size, p5.random(.2, .8), p5.random(.2, .8), 1);
    }
    time = 0;
    drawP5(p5);
}

function setupP5(p: p5Instance): void {
    p5 = p;
    boxFillColor = p5.color(bfColor);
    boxStrokeColor = p5.color(bsColor);
    p5.strokeWeight(1);
    p5.normalMaterial();
    p5.frameRate(60);
    reset();
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5(p);
    }

    drawP5(p: p5Instance): void {
        drawP5(p);
    }

    generateUI(): GUIType {
        const params: Record<string, unknown> = {
            cycle: cycle,
            chaos: chaos,
            amplitude: amplitude,
            boxFillColor: bfColor,
            boxStrokeColor: bsColor
        };

        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("cycle",.1, 2, .1, value => cycle = value),
                    menu("amplitude",.1, 40, .1, value => amplitude = value),
                    button("chaos", value => { chaos = value; reset(); })
                ],
                "Visual & Color": [
                    color("boxFillColor", value => { boxFillColor = value; }),
                    color("boxStrokeColor", value => { boxStrokeColor = value; })
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>