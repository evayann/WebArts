<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5" @windowresized="this.resetP5"></P5Vue>
</template>

<script lang="ts">
import {p5Instance, halfWidth as centerX, halfHeight as centerY, P5} from "@/components/P5.vue";
import {ArtVue, time, resetTime, setLoopTime, menu, color, GUIType} from "@/arts/art";
import {BoxGrid, BoxDrawable, range, parseColor, shuffle} from "@/arts/util";

let p5: p5Instance;
let nbElements = 6;
let block: BoxBlock;

const bColor = "rgba(75,20,73,0.91)";
let bgColor: P5.Color;

const colors: Array<string> = parseColor("256eff-3ddc97-fcfcfc-ff495c-ffff47", "-");

const drawers: Array<Drawer> = [statRect, rect, parallel];

type Drawer = (index: number, theta: number, size: number, colors: Array<string>) => void;

function bg(size: number, alpha: number): void {
    const s: number = size * 1.1;
    p5.noStroke();
    p5.fill(0, alpha);
    p5.rect(-s, -s, 2 * s, 2 * s);
    bgColor.setAlpha(alpha);
    p5.fill(bgColor);
    p5.circle(0, 0, 2 * size);
}

function statRect(index: number, theta: number, size: number, colors: Array<string>): void {
    p5.stroke(colors[index % colors.length]);
    const v: number = theta + time;
    p5.line(Math.cos(theta) * size, Math.sin(theta) * size,
        Math.cos(v + Math.PI) * size, Math.sin(v + Math.PI) * size);
}

function rect(index: number, theta: number, size: number, colors: Array<string>): void {
    const v: number = theta + time;
    const sizes: [number, number] = [6, 2];
    const selectColors = [colors[index % colors.length], "black"];
    range(2).forEach(i => {
        p5.strokeWeight(sizes[i]);
        p5.stroke(selectColors[i]);
        p5.line(p5.cos(theta) * size, p5.sin(theta) * size,
            p5.cos(v + p5.PI) * size, p5.sin(v + p5.PI) * size);
    });
}

function parallel(index: number, theta: number, size: number, colors: Array<string>): void {
    const v: number = theta + time;
    const sizes: [number, number] = [6, 2];
    const selectColors = [colors[index % colors.length], "black"];
    range(2).forEach(i => {
        p5.strokeWeight(sizes[i]);
        p5.stroke(selectColors[i]);
        p5.line(p5.cos(theta) * size, p5.sin(theta) * size,
            p5.cos(p5.PI - v) * size, p5.sin(p5.PI - v) * size);
    });
}

class CircleLine implements BoxDrawable {
    private readonly nbLines: number;
    private readonly alpha: number;
    private readonly draw: Drawer;
    private readonly colors: Array<string>;

    constructor(nbLines: number, draw: Drawer) {
        this.nbLines = nbLines;
        this.alpha = p5.random(50);
        this.draw = draw;
        this.colors = shuffle([...colors]);
    }

    renderInBox(tlx: number, tly: number, size: number): void {
        p5.push();
        p5.translate(tlx, tly);
        bg(size, this.alpha);
        range(this.nbLines).forEach(i => this.draw(i, i * (p5.PI / this.nbLines), size, this.colors));
        p5.pop();
    }
}

class BoxBlock extends BoxGrid {
    addDrawables(): void {
        range(this.nbElements * this.nbElements).forEach(() => {
            this.effects.push(new CircleLine(~~(p5.random(5, 15)), p5.random(drawers)));
        });
    }
}

function draw(): void {
    p5.translate(centerX, centerY);
    block.render();
}

function reset(): void {
    p5.clear();
    p5.background("black");
    block.reset(nbElements, 2/3);
    resetTime();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    block = new BoxBlock();
    bgColor = p5.color(bColor);
    setLoopTime(p5.TAU);
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

    resetP5() {
        if (p5 !== undefined)
            p5.background("black");
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Grid Size", nbElements, 2, 10, 1, value => { nbElements = value; reset(); }),
                ],
                "Visual & Color": [
                    color("Background", bColor, value => bgColor = p5.color(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
