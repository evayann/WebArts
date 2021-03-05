import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;

let p5: P5;
let fColor: string = "#a21c1c";
let color: P5.Color;
let hue: number = 0;
let alpha: number = 25;

let time: number = 0;
let nbCircle: number = 20;

let pManager: ParticlesManager;

let pause: boolean = false;

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
        for (let [i, p] of this.particles.entries()) {
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
    hue = (hue + 0.1) % 255;
}

function reset(): void {
    time = 0;
    pManager = new ParticlesManager(nbCircle);
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    color = p5.color(fColor);
    p5.noStroke();
    p5.createCanvas(width, height);
    p5.frameRate(60);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        nbCircle: nbCircle,
        fromColor: fColor,
        alpha: alpha,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "nbCircle",5, 50, 1)
        .onChange(value => {
            nbCircle = value;
            reset();
        })
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "fromColor")
        .onChange(value => color = p5.color(value));
    guiVisual.add(params, "alpha", 0, 255, 1)
        .onChange(value => alpha = value);
    guiVisual.open();

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
