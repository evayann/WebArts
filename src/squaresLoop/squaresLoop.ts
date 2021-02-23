import * as dat from 'dat.gui';
import * as P5 from 'p5';
import validate = WebAssembly.validate;

// Inspired by https://twitter.com/cs_kaplan/status/1359695674862895105?s=12

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;
let pColor: string = "#dbec42";
let ptColor: P5.Color;

let pause: boolean = false;
let speed: number = 1;
let time: number = 0;
let nbElements: number = 5;
let blockSize: number = Math.min(width, height) / nbElements;
let hbSize: number = blockSize / 2;
let size: number = blockSize * .7;
let xEl: number = Math.floor((width / blockSize) / 2) + 2;
let yEl: number = Math.floor((height / blockSize) / 2) + 2;

function easeInOutExpo(x: number): number {
    return x === 0
        ? 0
        : x === 1
            ? 1
            : x < 0.5 ? p5.pow(2, 20 * x - 10) / 2
                : (2 - p5.pow(2, -20 * x + 10)) / 2;
}

function easeInQuart(x: number): number {
    return x * x * x * x;
}

function drawShape(h: number, reduce: number): void {
    p5.beginShape();
    p5.vertex(-h, 0);
    p5.vertex(-h + reduce,  h);
    p5.vertex(h - reduce, h);
    p5.vertex(h, 0);
    p5.endShape(p5.CLOSE);
}

function drawHalfSquare(x: number, y: number, w: number, h: number, value: number, rotate: number): void {
    p5.push();
    p5.translate(x, y);
    p5.rotate((1 - value) * (p5.HALF_PI / 2) + rotate);
    p5.scale(p5.map(easeInOutExpo(value), 0, 1, 1, 1.4));
    drawShape(h, value * (size / 2));
    p5.pop();
}

function drawHalf(x: number, y: number, rot: number, sign: number, value: number): void {
    p5.push();
    p5.translate(sign * blockSize * value, sign * blockSize * value);
    drawHalfSquare(x + hbSize, y + hbSize, size, size / 2, value, rot);
    p5.pop();
}

function drawSquare(x: number, y: number, value: number): void {
    drawHalf(x, y, 0, -1, value);
    drawHalf(x, y, p5.PI, 1, value);
}

function draw(): void {
    p5.background("black");
    time += 0.005 * speed;
    p5.stroke(ptColor);
    p5.fill(ptColor);
    let anim: number = easeInQuart(time % 1);
    p5.translate(halfWidth, halfHeight);
    for (let y = -yEl * blockSize; y <= yEl * blockSize; y += blockSize)
        for (let x = -xEl * blockSize; x <= xEl * blockSize; x += blockSize)
            drawSquare(x, y, anim);
}

function reset(): void {
    p5.clear();
    time = 0;
    blockSize = Math.min(width, height) / nbElements;
    hbSize = blockSize / 2;
    size = blockSize * .7;
    xEl = p5.int((width / blockSize) / 2) + 2;
    yEl = p5.int((height / blockSize) / 2) + 2;
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    ptColor = p5.color(pColor);
    p5.createCanvas(width, height);
    p5.frameRate(60);
    p5.strokeWeight(2);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        speed: speed,
        nbElements: nbElements,
        ptColor: pColor,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speed",0.1, 5, 0.1)
        .onChange(value => speed = value);
    guiEffect
        .add(params, "nbElements",5, 20, 1)
        .onChange(value => {
            nbElements = value;
            reset();
        });
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "ptColor")
        .onChange(value => {
            ptColor = p5.color(value);
            p5.stroke(ptColor);
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
    halfWidth = width / 2;
    halfHeight = height / 2;
    p5.resizeCanvas(width, height);
    reset();
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
