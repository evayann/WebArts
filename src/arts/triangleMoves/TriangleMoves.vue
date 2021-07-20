<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, halfWidth as centerX, halfHeight as centerY, P5} from "@/components/P5.vue";
import {ArtVue, time, setLoopTime, menu, color, GUIType} from "@/arts/art";
import {BoxGrid, BoxDrawable, range} from "@/arts/util";

let p5: p5Instance;
let alpha = 65;
let stroke = 1;
let nbElements = 5;
let sColor = "#ecb2cd";
let strokeColor: P5.Color;
let triangles: Triangles;

const parseX = (from: number, to: number, x: number): number => {
    if (x < 1 / 3)
        return p5.lerp(from, to, p5.map(x, 0, 1 / 3, 0, 1));
    else if (x < 2 / 3)
        return p5.lerp(to, from, p5.map(x, 1 / 3, 2 / 3, 0, 1));
    else
        return from;
};

const parseY = (from: number, to: number, x: number): number => {
    return (x < 2 / 3) ?
        p5.lerp(from, to, p5.map(x, 0, 2 / 3, 0, 1)) :
        p5.lerp(to, from, p5.map(x, 2 / 3, 1, 0, 1));
};

class Triangle implements BoxDrawable {
    private readonly offsets: [number, number, number][];

    constructor() {
        this.offsets = [];
        range(8).forEach(i => {
            const o0: number = ((i + 1)) % 9;
            const o1: number = (o0 + 1) % 9;
            const o2: number = (o1 + 1) % 9;
            this.offsets.push([o0, o1, o2]);
        });
    }

    renderInBox(tlx: number, tly: number, size: number): void {
        p5.push();
        const off = size * .1;
        const ms = size * .8;
        const s2 = ms * 2;
        p5.translate(tlx - (tlx / size), tly - size / 2);

        const pos = (t: number) => {
            return [parseX(off, s2, t), parseY(-ms, ms, t)];
        };

        this.offsets.forEach(triangleOffset => {
            const [o0, o1, o2] = triangleOffset;
            const [x0, y0] = pos(((time + o0) % 9) / 9);
            const [x1, y1] = pos(((time + o1) % 9) / 9);
            const [x2, y2] = pos(((time + o2) % 9) / 9);
            p5.triangle(x0, y0, x1, y1, x2, y2);
            p5.triangle(-x0, -y0, -x1, -y1, -x2, -y2);
        });

        p5.pop();
    }
}

class Triangles extends BoxGrid {
    addDrawables(): void {
        range(this.nbElements * this.nbElements).forEach(() =>
            this.effects.push(new Triangle())
        );
    }
}

function draw(): void {
    p5.noStroke();
    p5.fill(0, alpha);
    p5.rect(0, 0, width, height);
    p5.translate(centerX, centerY);
    p5.fill("black");
    p5.stroke(strokeColor);
    p5.strokeWeight(stroke);
    triangles.render();
}

function reset(): void {
    triangles.reset(nbElements, 1, true);
}

function setupP5(p: p5Instance): void {
    p5 = p;
    strokeColor = p5.color(sColor);
    triangles = new Triangles();
    setLoopTime(9);
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
                    menu("Grid Size", nbElements, 2, 10, 1, value => { nbElements = value; reset(); }),
                ],
                "Visual & Color": [
                    menu("Alpha", alpha, 0, 255, 1, value => alpha = value),
                    menu("Stroke size", stroke, 1, 3, .1, value => stroke = value),
                    color("Stroke", sColor, value => strokeColor = p5.color(value))
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>
