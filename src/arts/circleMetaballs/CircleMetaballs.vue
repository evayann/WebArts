<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth, halfHeight, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, switchButton, color, GUIType} from "@/arts/art";

let p5: p5Instance;

let speed = 1;
const bColor = "#36ca71";
const c1 = "#e12656";
const c2 = "#f5a161";
let backgroundColor: P5.Color;
let color1: P5.Color;
let color2: P5.Color;
let displayCircle = false;
let nbCircle = 5;
let nbBalls = 30;

let balls: Balls;

const colorize = (color: P5.Color) => { p5.stroke(color); p5.fill(color); };

class Ball {
    private pos: P5.Vector;
    private readonly vel: P5.Vector;
    private readonly radius: number;

    constructor(x: number, y: number, radius: number) {
        this.pos = p5.createVector(x, y);
        this.vel = p5.createVector(p5.random(-5, 5), p5.random(-5, 5));
        this.radius = radius;
    }

    update(): void {
        this.pos.add(P5.Vector.mult(this.vel, speed));
        if (this.pos.x > halfWidth || this.pos.x < -halfWidth) this.vel.x *= -1;
        if (this.pos.y > halfHeight || this.pos.y < -halfHeight) this.vel.y *= -1;
    }

    drawStep(i: number): void {
        colorize(i % 2 == 0 ? color1 : color2);
        p5.circle(this.pos.x, this.pos.y, (i / nbCircle) * this.radius);
    }
}

class Balls {
    balls: Array<Ball>;

    constructor(nbBalls: number) {
        this.balls = [];
        const size = Math.min(width, height);
        for (let i = nbBalls; i--;)
            this.balls.push(new Ball(p5.random(-halfWidth, halfWidth), p5.random(-halfHeight, halfHeight), p5.random(size / 8, size / 2)));
    }

    draw(): void {
        for (let i = nbCircle; --i;)
            this.balls.forEach(b => b.drawStep(i));
    }

    update(): void {
        this.balls.forEach(b => b.update());
    }
}
function draw(): void {
    p5.translate(halfWidth, halfHeight);
    p5.background(backgroundColor);
    balls.draw();
    balls.update();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    reset();
    backgroundColor = p5.color(bColor);
    color1 = p5.color(c1);
    color2 = p5.color(c2);
    draw();
}

function reset(): void {
    balls = new Balls(nbBalls);
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
                    menu("Speed", speed, .1, 10, .1, value => speed = value),
                    menu("Nb ball", nbBalls, 10, 60, 1, value => { nbBalls = value; reset(); }),
                    menu("Circle per ball", nbCircle, 1, 10, 1, value => nbCircle = value),
                ],
                "Visual & Color" : [
                    color("Color 1", c1, value => color1 = this.p5.color(value)),
                    color("Color 2", c2, value => color2 = this.p5.color(value)),
                    color("Background", bColor, value => backgroundColor = this.p5.color(value)),
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>