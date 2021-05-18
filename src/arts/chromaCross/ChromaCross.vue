<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, setLoopTime, resetTime, menu, color, GUIType} from "@/arts/art";
import {Chromatic} from "@/arts/chromatic";
import {BoxDrawable, BoxGrid, range} from "@/arts/util";

// Inspired by https://twitter.com/ippsketch/status/1383094594351505410?s=12

let p5: p5Instance;
let nbSegment = 4;
let nbSubSamples = 3;
let speed = 1;

const bColor = "#000000";
let bgColor: P5.Color;

let grid: Grid;

class Cross extends Chromatic implements BoxDrawable {
    computePos(time: number): P5.Vector {
        return new P5.Vector();
    }

    computeRot(time: number): number {
        return ((time * 10) * speed) % 360;
    }

    renderInBox(cx: number, cy: number, size: number): void {
        this.render(p5, cx, cy, size * 3);
    }

    draw(p: P5.Vector, size: number): void {
        const hSize: number = size;
        p5.line(p.x - hSize, p.y - hSize, p.x + hSize, p.y + hSize);
        p5.line(p.x + hSize, p.y - hSize, p.x - hSize, p.y + hSize);
    }
}

class Grid extends BoxGrid {
    addDrawables(): void {
        range(this.nbElements * this.nbElements).forEach(() => {
           this.effects.push(new Cross(nbSubSamples));
        });
    }
}

function draw(): void {
    p5.translate(centerX, centerY);
    p5.background(bgColor);
    grid.render();
}

function reset(): void {
    loop();
    resetTime();
    grid.reset(nbSegment);
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.rectMode(p5.CENTER);
    p5.angleMode(p5.DEGREES);
    bgColor = p5.color(bColor);
    grid = new Grid(nbSegment);
    reset();
}

function loop(): void {
    setLoopTime(36 / (speed * 4));
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
                    menu("Speed", speed, .1, 5, .01, value => {speed = value; loop();}),
                    menu("Number Segment", nbSegment, 3, 10, 1, value => {nbSegment = value; reset();}),
                    menu("Number Samples", nbSubSamples, 1, 15, 1, value => {nbSubSamples = value; reset();})
                ],
                "Visual & Color": [
                    color("Background", bColor, value => bgColor = p5.color(value)),
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
