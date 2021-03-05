import * as dat from 'dat.gui';
import * as P5 from 'p5';

let w: number = window.innerWidth;
let h: number = window.innerHeight;

let p5: P5;
let speedFactor: number = 1;
let sizeFactor: number = 1;
let density: number = 5000;
let pause: boolean = false;

let s: number = 0, v: number = 0, u: number = 0;
let x: number = 0, y: number = 0, z: number = 1;
let C: Function = Math.cos;
let T: Function = Math.tan;
let S: Function = Math.sin;

function draw(): void {
    p5.background("black");
    p5.scale(0.5);
    p5.translate(w, h * .75);
    let t: number = p5.millis() / (1000 + 1000 * (1 / speedFactor));
    for(let i = density; i--; p5.rect((w / 2) * x / z, h * 1.25 - h * y / z,s = (500 * sizeFactor) / (z * z * z), s)) {
        x = S(u = t + density - i) + .5 * T(v = t + i / density);
        y = 4 * S(v) - 5;
        z = C(u) * S(u) - 5;
    }
}

function setupP5(p: P5): void {
    p5 = p;
    p5.createCanvas(w, h);
    p5.frameRate(60);
    p5.noStroke();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        speedFactor: speedFactor,
        sizeFactor: sizeFactor,
        density: density,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speedFactor",0.1, 5, .1)
        .onChange(value => speedFactor = value);
    guiEffect
        .add(params, "sizeFactor",0.1, 3, .1)
        .onChange(value => sizeFactor = value);
    guiEffect
        .add(params, "density",100, 7000, 10)
        .onChange(value => density = value);
    guiEffect.open();

    const guiMisc = gui.addFolder("Misc");
    let ps = guiMisc
        .add(params, "pause")
        .name("Pause")
        .onChange(() => (! pause) ? ps.name("Play") : ps.name("Pause"));
    guiMisc.open();
}

function resize(): void {
    w = window.innerWidth;
    h = window.innerHeight;
    p5.resizeCanvas(w, h);
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
