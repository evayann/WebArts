<template>
    <P5Vue :canvas3D="true" @preload="this.preloadP5" @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth, halfHeight, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, button, color, GUIType} from "@/arts/util";

let p5: p5Instance;
let shaderGraph: P5.Graphics;
let shader: P5.Shader;

let speed = 1;
const bColor = "#ca365c";
let clamping = 2.5;
let ballColor: P5.Color;
let displayCircle = false;

let balls: Balls;

const parseColor = (color: P5.Color) => [p5.red(color) / 255, p5.green(color) / 255, p5.blue(color) / 255];


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

    draw(): void {
        p5.noFill();
        p5.stroke("white");
        p5.circle(this.pos.x, this.pos.y, this.radius);
    }

    static getX(b: Ball): number {
        return b.pos.x;
    }

    static getY(b: Ball): number {
        return b.pos.y;
    }

    static getR(b: Ball): number {
        return b.radius;
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

    update(): void {
        this.balls.forEach(b => {
            b.update();
            if (displayCircle)
                b.draw();
        });
    }

    len(): number {
        return this.balls.length;
    }

    private get(f: (b: Ball) => number): Array<number> {
        const elements = [];
        this.balls.forEach(b => elements.push(f(b)));
        return elements;
        // return this.balls.reduce((acc, b) => {acc.push(f(b))}, []);
    }

    getXs(): Array<number> {
        return this.get(Ball.getX);
    }

    getYs(): Array<number> {
        return this.get(Ball.getY);
    }

    getRs(): Array<number> {
        return this.get(Ball.getR);
    }
}

function drawBalls(): void {
    shaderGraph.shader(shader);
    shader.setUniform("color", parseColor(ballColor));
    shader.setUniform("clamping", clamping);
    shader.setUniform("width", width);
    shader.setUniform("height", height);
    shader.setUniform("ballsX", balls.getXs());
    shader.setUniform("ballsY", balls.getYs());
    shader.setUniform("ballsR", balls.getRs());
    shaderGraph.plane(width, height);
    p5.image(shaderGraph, 0, 0, width, height);
}

function draw(): void {
    drawBalls();
    balls.update();
}

function preload(p: p5Instance) {
    p5 = p;
    shaderGraph = p5.createGraphics(width, height, p5.WEBGL);
    shaderGraph.noStroke();
    const vert =
        `#ifdef GL_ES
        precision highp float;
        precision highp int;
        #endif

        varying vec2 vPos;
        attribute vec3 aPosition;

        void main() {
            vec4 pos = vec4(aPosition, 1.0);
            pos.xy *= 2.0;
            vPos = (gl_Position = pos).xy;
        }`;
    const frag =
        `#ifdef GL_ES
        precision highp float;
        #endif

        #define MAX_BALLS 20

        varying vec2 vPos;
        uniform vec3 color;
        uniform float width;
        uniform float height;
        uniform float clamping;
        uniform float ballsX[MAX_BALLS];
        uniform float ballsY[MAX_BALLS];
        uniform float ballsR[MAX_BALLS];

        void main() {
            float sum = 0.0;
            for (int i = 0; i < MAX_BALLS; i++) {
                float xDiff = vPos.x * width - ballsX[i] * 2.0;
                float yDiff = -vPos.y * height - ballsY[i] * 2.0;
                sum += (0.25 * ballsR[i]) / sqrt(xDiff * xDiff + yDiff * yDiff);
            }
            gl_FragColor = vec4(color * clamp(sum, 0.0, clamping), 1.0);
        }`;
    shader = shaderGraph.createShader(vert, frag);
}

function setupP5(): void {
    p5.pixelDensity(1);
    p5.rectMode(p5.CENTER);
    p5.imageMode(p5.CENTER);
    balls = new Balls(~~p5.random(10, 20));
    ballColor = p5.color(bColor);
    draw();
}

export default class Art extends ArtVue {
    preloadP5(p: p5Instance): void {
        preload(p);
    }

    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5();
    }

    drawP5(): void {
        draw();
    }

    generateUI(): GUIType {
        const params = {
            displayCircle: displayCircle,
            clamping: clamping,
            bColor: bColor,
            speed: speed,
        };
        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("speed", .1, 10, .1, value => speed = value),
                    menu("clamping", 1, 5, .01, value => clamping = value),
                    button("displayCircle", value => displayCircle = value)
                ],
                "Visual & Color" : [
                    color("bColor", value => ballColor = this.p5.color(value)),
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>