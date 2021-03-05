import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let centerX: number = width / 2;
let centerY: number = height / 2;

let p5: P5;
let sColor: string = "#35d492";
let squareColor: P5.Color;

let pause: boolean = false;
let cycle: number = 1;
let time: number = 0;
let offset: number = 1.7;
let max = 3;
let rotate: boolean = true;

function easeInOutElastic(x: number): number {
    const c5 = (2 * Math.PI) / 4.5;
    return x === 0 ? 0
        : x === 1
            ? 1
            : x < 0.5
                ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
                : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}

function easeInOutCirc(x: number): number {
    return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

function cmpPos(from: number, to: number, t: number, rot: boolean): number {
    let val = easeInOutElastic(p5.map(t, -1, 1, 0, 1));
    if (rot) p5.rotate(val * p5.PI);
    return p5.lerp(from, to, val);
}

function drawSquare(ix: number, iy: number, w: number, h: number): void {
    p5.push();
    let x: number = cmpPos(ix * 2, ix, p5.cos(time * cycle), rotate);
    let y: number = cmpPos(iy * 2, iy, p5.sin(offset + time * cycle), rotate);
    p5.translate(x, y);
    p5.rect(0, 0, w + 2, h + 2,
        easeInOutCirc(p5.map(p5.cos(time * cycle), -1, 1, 1, 0)) * w / 2);
    p5.pop();
}

function splitSquare(x: number, y: number, w: number, h: number,
                     xOff: number, yOff: number, xInc:number, yInc: number,
                     it: number): void {
    if (it >= max)
        drawSquare(x, y, w, h);
    else {
        let nXOff: number = xOff + xInc, nYOff: number = yOff + yInc;
        splitSquare(x, y, w * xOff, h * yOff, nXOff, nYOff, xInc, yInc, it + 1);
        splitSquare(x + w * xOff, y, w * (1 - xOff), h * yOff, nXOff, nYOff, xInc, yInc, it + 1);
        splitSquare(x + w * xOff, y + h * yOff, w * (1 - xOff), h * (1 - yOff), nXOff, nYOff, xInc, yInc, it + 1);
        splitSquare(x, y + h * yOff, w * xOff, h * (1 - yOff), nXOff, nYOff, xInc, yInc, it + 1);
    }
}

function center(size): void {
    let xOff: number = cmpPos(size, 0, p5.cos(time * cycle), false);
    let yOff: number = cmpPos(size, 0, p5.sin(offset + time * cycle), false);
    p5.translate(width / 2 + xOff, height / 2 + yOff);
}

function draw(): void {
    p5.background("black");
    p5.fill(squareColor);
    p5.noStroke();
    let size: number = Math.min(width, height);
    center(size / 32);
    p5.scale(.5);
    let qSize: number = size / 2;
    let off: number = 1 / (max * 2);
    splitSquare(-qSize, -qSize, qSize, qSize, 0.1, 0.1, off, off, 0);
    splitSquare(0, -qSize, qSize, qSize, 0.9, 0.1, -off, off, 0);
    splitSquare(0, 0, qSize, qSize, 0.9, 0.9, -off, -off, 0);
    splitSquare(-qSize, 0, qSize, qSize, 0.1, 0.9, off, -off, 0);
    time += .02;
}

function reset(): void {
    p5.clear();
    time = 0;
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    squareColor = p5.color(sColor);
    p5.createCanvas(width, height);
    p5.frameRate(60);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        cycle: cycle,
        offset: offset,
        squareColor: sColor,
        rotate: rotate,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "cycle",0.1, 2, 0.1)
        .onChange(value => cycle = value)
        .name("Speed");
    guiEffect
        .add(params, "offset",0, Math.PI * 2, .1)
        .onChange(value => offset = value);
    guiEffect
        .add(params, "rotate", true)
        .onChange(value => {
            rotate = value;
            reset();
        });
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "squareColor")
        .onChange(value => squareColor = p5.color(value));
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
    centerX = width / 2;
    centerY = height / 2;
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
