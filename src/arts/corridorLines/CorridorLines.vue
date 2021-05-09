<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5" @windowresized="this.resizeP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth, halfHeight, p5Instance} from "@/components/P5.vue";
import {ArtVue, menu, GUIType} from "@/arts/util";

let p5: p5Instance;
let time = 0;
let speed = 1;

class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.setPosition(x, y);
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public set(values: number[]): boolean {
        if (values.length < 2) return false;
        this.setPosition(values[0], values[1]);
        return true;
    }
}

class Equation {
    private readonly eqA: number;
    private readonly eqB: number;

    constructor(pt1: Point, pt2: Point) {
        p5.line(pt1.x, pt1.y, pt2.x, pt2.y);
        // Compute point to equation
        this.eqA = (pt2.y - pt1.y) / (pt2.x - pt1.x);
        this.eqB = pt1.y - this.eqA * pt1.x;
    }

    public computeX(y: number): number {
        return (y - this.eqB) / this.eqA;
    }

    public computeY(x: number): number {
        return this.eqA * x + this.eqB;
    }
}

const point: Point = new Point(0, 0);
let opacity = 1;
let spaceOffset = 1.075;
let xOffset = 0.5;
let yOffset = 100;

function lines(eq1: Equation, eq2: Equation, eq3: Equation, eq4: Equation): void {
    let iX: number = point.x, space = 1;
    while (iX < halfWidth) {
        const y1: number = eq1.computeY(iX);
        const y2: number = eq2.computeY(iX);
        const x3: number = eq3.computeX(y2);
        const y4: number = eq4.computeY(x3);
        p5.line(iX, y1, iX, y2);
        p5.line(iX, y2, x3, y2);
        p5.line(x3, y2, x3, y4);
        p5.line(x3, y4, iX, y1);
        space *= spaceOffset;
        iX += space;
    }
}

function getPointPosition(time: number): number[] {
    const pos: number = time % (2 * width);
    if (pos < width)
        return [xOffset * (pos - halfWidth), p5.cos(time / 2) * yOffset]
    else
        return [xOffset * (halfWidth - (pos - width)), p5.cos(time / 2 - p5.HALF_PI) * yOffset]
}

function draw(): void {
    p5.fill(0, opacity * 255);
    p5.rect(0, 0, width, height);
    p5.translate(halfWidth, halfHeight);
    p5.stroke("white");
    point.set(getPointPosition(time));
    lines(new Equation(point, new Point(halfWidth, halfHeight)),
        new Equation(point, new Point(halfWidth, -halfHeight)),
        new Equation(point, new Point(-halfWidth, -halfHeight)),
        new Equation(point, new Point(-halfWidth, halfHeight)));
    time += speed * 10;
}

function reset(): void {
    p5.clear();
    time = 0;
    p5.translate(-halfWidth, -halfHeight);
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.frameRate(30);
    p5.angleMode(p5.DEGREES);
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

    resizeP5(): void {
        reset();
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Speed", speed, .1, 10, .1, value => speed = value),
                    menu("Offset", spaceOffset, 1.005, 2, .005, value => spaceOffset = value),
                    menu("xOffset", xOffset, 0, 2, .1, value => xOffset = value),
                    menu("yOffset", yOffset, 0, 500, 1, value => yOffset = value),
                    menu("Opacity", opacity, .3, 1, .05, value => opacity = value),
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>