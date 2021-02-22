import * as dat from 'dat.gui';
import * as P5 from 'p5';
import validate = WebAssembly.validate;

// Inspired by https://twitter.com/beesandbombs/status/1361727805130760194?s=12

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;
let pColor: string = "#121341";
let ptColor: P5.Color;

let pause: boolean = false;
let speed: number = 1;
let time: number = 0;
let nbElements: number = 20;
let stroke: number = 2;
let blockSize: number = Math.min(width, height) / nbElements;
let size: number = blockSize / 2;
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

function drawLine(x: number, y: number, w: number, h: number): void {
    p5.line(x, y, x + w, y + h)
}

function drawCross(x: number, y: number, value: number): void {
    let _x: number = x * blockSize;
    let _y: number = y * blockSize + blockSize / 2;
    if (p5.abs(x % 2) == 1)
        drawLine(_x, _y + (blockSize / 2), blockSize, 0);
    drawLine(_x + (blockSize / 2) * value, _y, 0, blockSize);
}

function drawSquare(x: number, y: number, value: number): void {
    let _x: number = x * blockSize, _y: number = y * blockSize + (y % 2 == 0 ? 0 : blockSize / 2);
    if (x % 2 == 0) {
        drawLine(_x + (2 * value * blockSize), _y , blockSize, 0);
        drawLine(_x, _y + (-2 * value * blockSize), 0, blockSize);
        drawLine(_x + (2 * value * blockSize), _y + blockSize, blockSize, 0);
        drawLine(_x + blockSize, _y + (-2 * value * blockSize), 0, blockSize);

    }
    else {
        drawLine(_x, _y + blockSize / 2, blockSize, 0);
    }
}

function draw(): void {
    p5.background("black");
    time += 0.01 * speed;
    p5.stroke(ptColor);
    p5.fill(ptColor);
    let anim: number = easeInOutExpo(p5.map(p5.cos(time), -1, 1, 0, 1));
    p5.translate(halfWidth, halfHeight);
    for (let y = -yEl; y <= yEl; y++)
        for (let x = -xEl; x <= xEl; x++)
            if (y % 2 == 0)
                drawCross(x, y, anim);
            else
                drawSquare(x, y, anim);

}

function reset(): void {
    p5.clear();
    time = 0;
    blockSize = Math.min(width, height) / nbElements;
    size = blockSize / 2;
    xEl = p5.int((width / blockSize) / 2) + 2;
    yEl = p5.int((height / blockSize) / 2) + 2;
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    ptColor = p5.color(pColor);
    p5.createCanvas(width, height);
    p5.frameRate(60);
    p5.strokeWeight(stroke);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        speed: speed,
        nbElements: nbElements,
        ptColor: pColor,
        stroke: stroke,
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
        .add(params, "nbElements",10, 40, 1)
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
    guiVisual
        .add(params, "stroke", 0.1, 5, 0.1)
        .onChange(value => p5.strokeWeight(value))
        .name("strokeWeight");
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
