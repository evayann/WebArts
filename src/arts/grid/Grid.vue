<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {p5Instance, P5, halfWidth as centerX, halfHeight as centerY} from "@/components/P5.vue";
import {ArtVue, time, setLoopTime, resetTime, menu, color, GUIType} from "@/arts/art";
import {BoxGrid, BoxDrawable, range} from "@/arts/util";
import {easeOutCubic} from "@/arts/easecurve";
// Inspired by https://twitter.com/loackme_/status/1391016153569546240?s=12

let p5: p5Instance;
const gColor = "#c596e7";
let gridColor: P5.Color;

let speed = 1;
let strokeSize = 5;
let anim: number;
const nbElements = 3;
let grid: Grid;

function drawSquareCross(x: number, y: number, size: number, value: number, rot=0): void {
    p5.push();
    p5.translate(x, y);
    p5.rotate(rot);
    p5.line(0, -size, value * size, -value * size);
    p5.line(0, -size, -value * size, -value * size);

    p5.line(0, size, value * size, value * size);
    p5.line(0, size, -value * size, value * size);

    p5.line(size, 0, value * size, value * size);
    p5.line(size, 0, value * size, -value * size);

    p5.line(-size, 0, -value * size, -value * size);
    p5.line(-size, 0, -value * size, value * size);
    p5.pop();
}

function drawRotation(x: number, y: number, size: number, value: number): void {
    let v: number = value < .5 ?
        p5.map(value, 0, .5, 1, 0) :
        p5.map(value, .5, 1, 0, 1);
    drawSquareCross(x, y, size, v, value * p5.HALF_PI);
}

class GridCross implements BoxDrawable {
    renderInBox(cx: number, cy: number, size: number) {
        let a: number;
        if (anim < 10) {
            a = p5.constrain(p5.cos((anim / 10) * p5.TAU), 0, 1);
            p5.strokeWeight(strokeSize + 5 * a);
            drawSquareCross(cx, cy, size, a);
        } else if (anim < 20) {
            a = anim < 15 ?
                p5.constrain(p5.cos(p5.map(anim, 10, 15, 0, p5.PI)) * 2, -1, 1) :
                p5.constrain(p5.cos(p5.map(anim, 15, 20, p5.PI, 0)) * 2, -1, 1);
            p5.strokeWeight(strokeSize + 5 * p5.abs(a));
            drawSquareCross(cx, cy, size, a);
        } else {
            a = p5.map(anim, 20, 30, 0, 1);
            p5.strokeWeight(strokeSize + 5 - 5 * a);
            drawRotation(cx, cy, size, easeOutCubic(1 - a));
        }
    }
}

class Grid extends BoxGrid {
    addDrawables(): void {
        range(this.nbElements * this.nbElements)
            .forEach(() => this.effects.push(new GridCross()));
    }
}

function draw(): void {
    p5.background("black");
    p5.stroke(gridColor);
    p5.translate(centerX, centerY);
    anim = (time * speed) % 30;
    grid.render();
}

function reset(): void {
    p5.clear();
    resetTime();
    setLoopTime(30 / speed);
    grid.reset(nbElements);
    draw();
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        p5 = p;
        grid = new Grid(nbElements);
        gridColor = p5.color(gColor);
        reset();
    }

    drawP5(p: p5Instance): void {
        super.drawP5(p);
        draw();
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Speed", speed, .1, 5, .01, value => {speed = value; reset();}),
                ],
                "Visual & Color": [
                    menu("Stroke Size", strokeSize, 1, 10, .1, value => strokeSize = value),
                    color("Line", gColor, value => { gridColor = value; this.p5.stroke(gridColor)} ),
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>