<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, seed, menu, GUIType} from "@/arts/util";
// Inspired from https://openprocessing.org/sketch/566877

let p5: p5Instance;

let pManager: ParticlesManager;
let noiseScale = 200;
let nbCircle = 600;
let maxSize = 5;
let alpha = 5;
let speed = 1;
let doBg = true;

class Particle {
    private pos: P5.Vector;
    private prevPos: P5.Vector;
    private vel: P5.Vector;
    private lifetime: number;
    private noise: number;

    constructor(x: number, y: number) {
        this.reborn(x, y);
    }

    update(): void {
        this.noise = p5.noise(this.pos.x / (noiseScale * 2), this.pos.y / (noiseScale * 2));
        const transition = p5.map(this.pos.x + this.pos.y, 0, width + height, 0, 1);
        const angle = this.noise * transition * noiseScale;

        this.vel.set(p5.cos(angle), p5.sin(angle)).mult(speed);
        this.prevPos = this.pos.copy();
        this.pos.add(this.vel);
        this.lifetime += speed;
    }

    reborn(x: number, y: number): void {
        this.pos = p5.createVector(x, y);
        this.vel = p5.createVector();
        this.lifetime = 0;
        this.noise = 0;
    }

    draw(): void {
        this.update();
        p5.fill(p5.map(this.pos.x + this.pos.y, 0, width + height, 0, 360), 255, 255);
        const size: number = p5.map(p5.cos(this.lifetime / 100) + this.noise, -1, 2, 2, maxSize);
        p5.circle(this.pos.x, this.pos.y, size);
    }

    isDead(): boolean {
        return this.pos.y > height || this.pos.y < 0
            || this.pos.x > width || this.pos.x < 0 || this.prevPos.dist(this.pos) < 0.1;
    }
}

class ParticlesManager {
    private readonly particles: Array<Particle>;

    constructor(nbPart: number) {
        this.particles = [];
        for (let i = nbPart; i--;)
            this.particles.push(new Particle(p5.random(0, width), p5.random(0, height)));
    }

    draw(): void {
        for (const p of this.particles) {
            p.draw();
            p.isDead() ? p.reborn(p5.random(0, width), p5.random(0, height)) : p.update();
        }
    }
}

function draw(): void {
    if (doBg) {
        p5.background("black");
        doBg = false;
    }
    p5.colorMode(p5.RGB);
    p5.fill(0, alpha);
    p5.rect(0, 0, width, height);
    p5.colorMode(p5.HSB);
    pManager.draw();
}

function reset(): void {
    p5.randomSeed(seed);
    p5.noiseSeed(seed);
    pManager = new ParticlesManager(nbCircle);
    doBg = true;
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
            speed: speed,
            noiseScale: noiseScale,
            nbCircle: nbCircle,
            alpha: alpha,
            maxSize: maxSize,
            seed: seed
        };
        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("speed", .11, 2, .01, value => speed = value),
                    menu("noiseScale", 10, 600, 1,
                        value => { noiseScale = value; reset(); }),
                    menu("nbCircle", 50, 1000, 1,
                        value => { nbCircle = value; reset(); }),
                ],
                "Visual & Color": [
                    menu("alpha", 0, 255, 1, value => alpha = value),
                    menu("maxSize", 2, 20, 1, value => maxSize = value)
                ],
                "Misc": [
                    this.seed(),
                    this.pause(),
                    this.reset(reset)
                ]
            }
        });
    }
}
</script>