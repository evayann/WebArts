<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, GUIType} from "@/util";

let p5: p5Instance;
let hue = 0;
let alpha = 25;
let time = 0;
let nbCircle = 20;
let pManager: ParticlesManager;

class Particle {
    private readonly pos: P5.Vector;

    constructor(x: number, y: number) {
        this.pos = p5.createVector(x, y);
    }

    draw(): void {
        p5.circle(this.pos.x + xCompute(time) * this.pos.x / 2, this.pos.y + yCompute(time) * this.pos.x / 2, 10);
    }
}

function xCompute(t): number {
    return Math.sin(t);
}

function yCompute(t): number {
    return ((Math.cos(t) * Math.sin(t)) / Math.tan(.5 * t));
}

class ParticlesManager {
    private particles: Array<Particle>;

    constructor(nbPart: number) {
        this.particles = [];
        for (let i = nbPart; i--;)
            this.particles.push(new Particle(Math.min(width, height) / 4, 0));
    }

    draw(): void {
        for (const [i, p] of this.particles.entries()) {
            p5.push();
            p5.rotate(-(i / this.particles.length) * p5.TAU);
            p.draw();
            p5.pop();
        }
    }
}

function draw(): void {
    p5.colorMode(p5.RGB);
    p5.fill(0, alpha);
    p5.rect(0, 0, width, height);
    p5.translate(width / 2, height / 2);
    p5.colorMode(p5.HSB);
    p5.fill(hue, 255, 255);
    pManager.draw();
    time += .02;
    hue = (hue + .1) % 360;
}

function reset(): void {
    time = 0;
    pManager = new ParticlesManager(nbCircle);
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.noStroke();
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
            nbCircle: nbCircle,
            alpha: alpha
        };
        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("nbCircle", 5, 50, 1, value => { nbCircle = value; reset(); }),
                ],
                "Visual & Color": [
                    menu("alpha", 0, 255, 1, value => alpha = value)
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
