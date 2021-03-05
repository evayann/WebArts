// Implemented from https://medium.com/@r.l.bongers/visual-effect-analysis-animated-raindrops-682b83b87e09

import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;

let p5: P5;
let speedFactor: number = 1;
let nbDropWater: number = 35;
let nbWater: number = 100;

let pause: boolean = false;

function draw(): void {
    p5.background("black");
    let effect_size = height / 3;
    let time: number = p5.millis() / (1000 * (1 / speedFactor));
    p5.fill(((time / 10) % 1) * 255, 255, 255);
    for (let i = 0; i < nbDropWater; i++) {
        let timing_variation = (time + Math.cos(i)) % 2;
        for (let j = timing_variation; j < nbWater; j++) {
            let burst_trigger = ~~timing_variation;
            let drop_size = timing_variation * effect_size - effect_size;
            let y_pos = (burst_trigger ? effect_size : timing_variation * effect_size) * (Math.cos(i) + 2);
            let x_coord = width * p5.map(Math.cos(i * i * i), -1, 1, 0, 1)
                + burst_trigger * drop_size * Math.cos(j);
            let y_coord = y_pos + drop_size * (Math.sin(j) / 5);
            p5.rect(x_coord, y_coord, 3, 3);
        }
    }
}

function setupP5(p: P5): void {
    p5 = p;
    p5.angleMode(p5.DEGREES);
    p5.createCanvas(width, height);
    p5.frameRate(60);
    p5.noStroke();
    p5.colorMode(p5.HSB);
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        speedFactor: speedFactor,
        nbWater: nbWater,
        nbDropWater: nbDropWater,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speedFactor",0.1, 5, .1)
        .onChange(value => speedFactor = value);
    guiEffect
        .add(params, "nbDropWater",20, 400, 1)
        .onChange(value => nbDropWater = value);
    guiEffect
        .add(params, "nbWater", 10, 200, 1)
        .onChange(value => nbWater = value);
    guiEffect.open();

    const guiMisc = gui.addFolder("Misc");
    let ps = guiMisc
        .add(params, "pause")
        .name("Pause")
        .onChange(() => (! pause) ? ps.name("Play") : ps.name("Pause"));
    guiMisc.open();
}

function resize(): void {
    width = window.innerWidth;
    height = window.innerHeight;
    p5.resizeCanvas(width, height);
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
