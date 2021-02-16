import * as dat from 'dat.gui';
import * as P5 from 'p5';
import validate = WebAssembly.validate;

// Inspired by https://twitter.com/concinnus/status/1360831157852635136?s=12

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;
let pColor: string = "#8738e1";
let ptColor: P5.Color;

let pause: boolean = false;
let speed: number = 1;
let time: number = 0;
let nbElements: number = 5;
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

function easeInOutElastic(x: number): number {
    const c5 = (2 * Math.PI) / 4.5;

    return x === 0
        ? 0
        : x === 1
            ? 1
            : x < 0.5
                ? -(p5.pow(2, 20 * x - 10) * p5.sin((20 * x - 11.125) * c5)) / 2
                : (p5.pow(2, -20 * x + 10) * p5.sin((20 * x - 11.125) * c5)) / 2 + 1;

}

function drawQuarter(x: number, y: number, rotate: number): void {
    p5.push();
    p5.translate(x, y);
    p5.arc(0, 0, size + 1, size + 1, p5.radians(rotate), p5.radians(rotate) + p5.HALF_PI, p5.PIE);
    p5.pop();
}

function drawHalf(x: number, y: number, rotate: number): void {
    drawQuarter(x, y, rotate);
    drawQuarter(x, y, rotate + 90);
}

function drawHorizontal(x: number, y: number, value: number): void {
    drawHalf(x - blockSize * value, y, 0);
    drawHalf(x + blockSize * value, y, 180);
}

function drawVertical(x: number, y: number, value: number): void {
    drawHalf(x, y - blockSize * value, 90);
    drawHalf(x, y + blockSize * value, 270);
}

function drawRotate(x: number, y: number, value: number): void {
    let rot: number = value * 180;
    let mvt: number = value * blockSize;
    drawQuarter(x + mvt, y + mvt, rot); // Bottom Right
    drawQuarter(x - mvt, y + mvt, 90 + rot); // Bottom Left
    drawQuarter(x - mvt, y - mvt, 180 + rot); // Top Left
    drawQuarter(x + mvt, y - mvt, 270 + rot); // Top Right
}

function drawCircle(x: number, y: number, value: number): void {
    if (value < 3)
        drawRotate(x, y, easeInOutExpo(p5.map(value, 0, 3, 0, 1)));
    else if (value < 4)
        drawVertical(x, y, easeInOutElastic(p5.map(value, 3, 4, 0, 1)));
    else
        drawHorizontal(x, y, easeInOutElastic(p5.map(value, 4, 5, 0, 1)));
}

function draw(): void {
    p5.background("black");
    time += 0.01 * speed;
    p5.stroke(ptColor);
    p5.fill(ptColor);
    let anim: number = time % 5;
    p5.translate(halfWidth, halfHeight);
    for (let y = -yEl * blockSize; y <= yEl * blockSize; y += blockSize)
        for (let x = -xEl * blockSize; x <= xEl * blockSize; x += blockSize)
            drawCircle(x, y, anim);
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
