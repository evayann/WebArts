import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;

let p5: P5;
let hue: number = 0;

let time: number = 0;
let nbCircle: number = 80;
let maxRadius: number = 400;

let pManager: ParticlesManager;

let pause: boolean = false;


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
        let d = p5.constrain(sumForce.mag(), 1, 10);
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
        let pos: number = p5.random(0, p5.TAU);
        this.particles.push(new Particle(
            p5.cos(pos) * p5.random(0, maxRadius / 2 - 50),
            p5.sin(pos) * p5.random(0, maxRadius / 2 - 50),
            (p5.random(10, 50) + p5.random(10, 50) + p5.random(10, 50)) / 3));
        if (this.particles.length > nbCircle)
            this.particles.splice(0, this.particles.length + 1 - nbCircle);
    }

    private nearest(p: Particle): Array<Particle> {
        let pts: Array<Particle> = [];
        for (let part of this.particles) {
            let dist = P5.Vector.sub(part.pos, p.pos).mag();
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
    time += .02;
}

function reset(): void {
    time = 0;
    pManager = new ParticlesManager(nbCircle);
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    p5.noStroke();
    p5.createCanvas(width, height);
    p5.frameRate(60);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        nbCircle: nbCircle,
        maxRadius: maxRadius,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "nbCircle",20, 200, 1)
        .onChange(value => nbCircle = value);
    guiEffect
        .add(params, "maxRadius",200, 1000, 1)
        .onChange(value => maxRadius = value);
    guiEffect.open();

    const guiMisc = gui.addFolder("Misc");
    let ps = guiMisc
        .add(params, "pause")
        .name("Pause")
        .onChange(() => (! pause) ? ps.name("Play") : ps.name("Pause"));
    guiMisc
        .add(params, "reset")
        .name("Reset");
    guiMisc.open();
}

function resize(): void {
    width = window.innerWidth;
    height = window.innerHeight;
    p5.resizeCanvas(width, height);
    draw();
}

window.onresize = resize;

window.onload = () => {
    let sketch = (p: P5) => {
        p.setup = () => {
            setupP5(p);
        }

        p.draw = () => {
            draw();
        };
    }
    p5 = new P5(sketch);
    resize();
    setupDatGUI();
}
