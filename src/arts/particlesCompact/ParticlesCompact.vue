<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, GUIType} from "@/arts/util";

let p5: p5Instance;
let hue = 0;

let nbCircle = 80;
let maxRadius = 400;

let pManager: ParticlesManager;

class Particle {
    readonly pos: P5.Vector;
    private readonly vel: P5.Vector;
    private readonly acc: P5.Vector;
    readonly size: number;

    constructor(x: number, y: number, size: number) {
        this.pos = p5.createVector(x, y);
        this.vel = P5.Vector.random2D();
        this.acc = p5.createVector();
        this.size = size;
    }

    update(): void {
        this.vel.add(this.acc);
        this.vel.limit(20);
        this.vel.mult(0.9);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    draw(particles: Array<Particle>): void {
        this.movement(particles);
        this.update();
        p5.circle(this.pos.x, this.pos.y, this.size);
    }

    movement(targets: Array<Particle>): void {
        let sumForce = p5.createVector();
        targets.forEach(p => sumForce.add(P5.Vector.mult((P5.Vector.sub(this.pos, p.pos)), p.size)));
        sumForce.div(targets.length);
        const d = p5.constrain(sumForce.mag(), 1, 10);
        sumForce.setMag(50 / p5.sq(d));
        if (P5.Vector.sub(this.pos, p5.createVector()).mag() > maxRadius / 2)
            sumForce = P5.Vector.mult(P5.Vector.sub(p5.createVector(), this.pos), .001);
        this.acc.add(sumForce);
    }

}

class ParticlesManager {
    private readonly particles: Array<Particle>;

    constructor(nbPart: number) {
        this.particles = [];
        for (let i = nbPart; i--;)
            this.new();
    }

    draw(): void {
        this.particles.forEach(p => p.draw(this.nearest(p)));
    }

    new(): void {
        const pos: number = p5.random(0, p5.TAU);
        this.particles.push(new Particle(
            p5.cos(pos) * p5.random(0, maxRadius / 2 - 50),
            p5.sin(pos) * p5.random(0, maxRadius / 2 - 50),
            (p5.random(10, 50) + p5.random(10, 50) + p5.random(10, 50)) / 3));
        if (this.particles.length > nbCircle)
            this.particles.splice(0, this.particles.length + 1 - nbCircle);
    }

    private nearest(p: Particle): Array<Particle> {
        const pts: Array<Particle> = [];
        for (const part of this.particles) {
            const dist = P5.Vector.sub(part.pos, p.pos).mag();
            if (dist < (p.size + part.size) && dist != 0)
                pts.push(part);
        }
        return pts;
    }
}

function drawCircle(): void {
    p5.colorMode(p5.HSB);
    p5.fill(hue, 255, 255);
    pManager.draw();
    hue = (hue + .5) % 360;
}

function draw(): void {
    p5.background("black");
    p5.translate(width / 2, height / 2);
    drawCircle();
    if (p5.random() < .25)
        pManager.new();
}

function reset(): void {
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
            maxRadius: maxRadius
        };
        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("nbCircle", 20, 200, .1, value => nbCircle = value),
                    menu("maxRadius", 200, 1000, 1, value => maxRadius = value)
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>