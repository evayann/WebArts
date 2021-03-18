// Inspired from https://www.reddit.com/r/loadingicon/comments/m4yept/overlapping_waves_oc/?utm_source=share&utm_medium=ios_app&utm_name=iossmf

import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;

let pause: boolean = false;
let speed: number = 1;
let time: number = 0;
let nbLoop: number = 5;
let nbPoint: number = 1000;
let makeWave: Function;

function flatWave(value: number, from: number, to: number): void {
    p5.beginShape();
    for (let i = nbPoint; i--;) {
        let prct: number = i / nbPoint;
        let y: number = (prct > from && prct < to) ? 0 : p5.cos(value + prct * 3 * p5.TAU) * (halfHeight * 0.5);
        p5.curveVertex(p5.map(i, 0, nbPoint, -halfWidth, halfWidth), y);
    }
    p5.endShape();
}

function circleWave(value: number, from: number, to: number): void {
    let size: number = Math.min(halfWidth / 2, halfHeight / 2);
    p5.beginShape();
    for (let i = nbPoint; i--;) {
        let prct: number = i / nbPoint;
        let v: number = value + prct * nbLoop * p5.TAU;
        let x: number = p5.cos(prct * p5.TAU) * size;
        let y: number = p5.sin(prct * p5.TAU) * size;
        if (prct >= from && prct <= to) {
            let s: number = p5.map(Math.min(to - prct, prct - from), 0, 0.5, 0, 1) * size / 2;
            p5.vertex(x + p5.cos(v) * s, y + p5.sin(v) * s);
        }
        else
            p5.vertex(x, y);
    }
    p5.endShape();
}

function waves(): void {
    let p: number = p5.abs(p5.cos(time / 10)) / 2;

    p5.stroke("yellow");
    makeWave(time, .5 - p, .5 + p);
    p5.stroke("blue");
    makeWave(time + p5.TAU * .33, .5 - p, .5 + p);
    p5.stroke("red");
    makeWave(time + p5.TAU * .66, .5 - p, .5 + p);
}

function draw(): void {
    p5.clear();
    p5.background("black");
    p5.translate(halfWidth, halfHeight);
    waves();
    time += 0.05 * speed;
}

function reset(): void {
    p5.clear();
    time = 0;
    draw();
}

function setWaver(value: boolean): void {
    makeWave = value ? circleWave : flatWave;
}

function setupP5(p: P5): void {
    p5 = p;
    p5.createCanvas(width, height);
    p5.frameRate(60);
    p5.blendMode(p5.ADD);
    p5.noFill();
    p5.strokeWeight(5);
    setWaver(true);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        speed: speed,
        nbLoop: nbLoop,
        nbPoint: nbPoint,
        circleWave: true,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speed",0.1, 2, 0.1)
        .onChange(value => speed = value);
    guiEffect
        .add(params, "nbLoop",0, 10, 1)
        .onChange(value => nbLoop = value);
    guiEffect
        .add(params, "nbPoint",10, 1000, 1)
        .onChange(value => nbPoint = value);
    guiEffect
        .add(params, "circleWave")
        .onChange(value => setWaver(value));
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
    halfWidth = width / 2;
    halfHeight = height / 2;
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
