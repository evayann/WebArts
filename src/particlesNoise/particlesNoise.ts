// Inspired from https://openprocessing.org/sketch/566877

import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;

let p5: P5;
let alpha: number;

let time: number = 0;
let nbCircle: number = 600;
let pManager: ParticlesManager;
let maxSize: number = 5;
let doBg: boolean = true;
let noiseScale: number = 200;
let	speed: number = 1;
let	seed: number;

let pause: boolean = false;
let alphaSlider: dat.GUIController;

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
        let transition = p5.map(this.pos.x + this.pos.y, 0, width + height, 0, 1);
        let angle = this.noise * transition * noiseScale;

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
        p5.fill(p5.map(this.pos.x + this.pos.y, 0, width + height, 0, 360) , 255, 255);
        let size: number = p5.map(p5.cos(this.lifetime / 100) + this.noise, -1, 2, 2, maxSize);
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
        for (let p of this.particles) {
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
    time += .02;
}

function reset(): void {
    time = 0;
    alpha = 5;
    p5.randomSeed(seed);
    p5.noiseSeed(seed);
    if (alphaSlider != null)
        alphaSlider.setValue(alpha);
    pManager = new ParticlesManager(nbCircle);
    doBg = true;
}

function setupP5(p: P5): void {
    p5 = p;
    p5.noStroke();
    p5.createCanvas(width, height);
    p5.frameRate(60);
    seed = p5.random(0, 100000);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        speed: speed,
        noiseScale: noiseScale,
        nbCircle: nbCircle,
        alpha: alpha,
        maxSize: maxSize,
        seed: seed,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speed",.11, 2, .01)
        .onChange(value => speed = value)
    guiEffect
        .add(params, "noiseScale",10, 600, 1)
        .onChange(value => {
            noiseScale = value;
            reset();
        })
    guiEffect
        .add(params, "nbCircle",50, 1000, 1)
        .onChange(value => {
            nbCircle = value;
            reset();
        })
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    alphaSlider = guiVisual.add(params, "alpha", 0, 255, 1)
        .onChange(value => alpha = value);
    guiVisual.add(params, "maxSize", 2, 20, 1)
        .onChange(value => maxSize = value);
    guiVisual.open();

    const guiMisc = gui.addFolder("Misc");
    guiMisc
        .add(params, "seed")
        .onChange(value => {
            seed = value;
            reset();
        });
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
    doBg = true;
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
