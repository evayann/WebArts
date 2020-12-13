// Inspiration of https://twitter.com/beesandbombs/status/1334573053053972485

import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let centerX: number = width / 2;
let centerY: number = height / 2;

let p5: P5;
let bColor: string = "#0a0e15";
let sColor: string = "#ffffff";
let backgroundColor: P5.Color;
let strokeColor: P5.Color;
let strokeSize: number = 1.7;

let counter: number = 0;
let cubeSize: number = 50;
let halfCube: number = cubeSize / 2;

let speedFactor: number = 1;
let waveFactor: number = 0.25;
let scaleBox: boolean = false;

let pause: boolean = false;

function computeScale(x: number, y: number): number {
    return p5.map(p5.cos(computeRotation(x, y) + counter * 0.1 * speedFactor), -1, 1, 0, 1);
}

function computeRotation(x: number, y: number): number {
    // radius * factor + theta
    return p5.dist(x, y, 0, 0) * waveFactor + p5.atan2(y, x);
}

function draw(): void {
    p5.clear();
    p5.background(backgroundColor);

    p5.ortho();
    p5.rotateX(-30);
    p5.stroke(strokeColor);
    p5.strokeWeight(strokeSize);
    p5.fill(0, 0, 0, 0);

    let offsetX = halfCube / 2;
    for (let j = -1 * cubeSize; j < height + cubeSize; j += cubeSize) {
        for (let i = 0; i < width; i += cubeSize) {
            p5.push();
            p5.translate(offsetX + i - centerX, j - centerY);
            p5.rotateY(computeRotation(-(offsetX + i - centerX), -(j - centerY)) + counter * speedFactor);
            p5.box((! scaleBox) ? halfCube : halfCube - computeScale(-(offsetX + i - centerX), -(j - centerY)) * halfCube);
            p5.pop();
        }
        offsetX = -offsetX;
    }
    counter += 100;
}

function reset(): void {
    counter = 0;
    halfCube = cubeSize / 2;
    p5.loop();
    draw();
    (pause) ? p5.noLoop() : p5.loop();
}

function setupP5(p: P5): void {
    p5 = p;
    backgroundColor = p5.color(bColor);
    strokeColor = p5.color(sColor);
    p.createCanvas(width, height, p.WEBGL);
    p.frameRate(60);
    p.angleMode(p.DEGREES);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {speed: speedFactor,
        wave: waveFactor,
        strokeSize: strokeSize,
        strokeColor: sColor,
        backgroundColor: bColor,
        scaleBox: scaleBox,
        cubeSize: cubeSize,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "cubeSize",30, 300, 1)
        .onChange(value => {
            cubeSize = value;
            reset();
        });
    guiEffect
        .add(params, "scaleBox")
        .onChange(value => scaleBox = value)
        .name("Active scale");
    guiEffect
        .add(params, "speed",0.7, 1.3, 0.01)
        .onChange(value => speedFactor = value)
        .name("SpeedFactor");
    guiEffect
        .add(params, "wave",0.01, 1, 0.01)
        .onChange(value => waveFactor = value)
        .name("WaveFactor");
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.add(params, "strokeSize", 0.1, 5, 0.1)
        .onChange(value => {
            strokeSize = value;
            draw();
        });
    guiVisual.addColor(params, "strokeColor")
        .onChange(value => {
            strokeColor = p5.color(value);
            draw();
        });
    guiVisual.addColor(params, "backgroundColor")
        .onChange(value => {
            backgroundColor = p5.color(value);
            draw();
        });
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
