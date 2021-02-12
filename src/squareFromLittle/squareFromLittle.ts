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
let size: number = 20;
let time: number = 0;
let offset: number = 1.7;
let nbSquares: number = 20;
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

function cmpPos(from: number, to: number, time: number): number {
    let val = easeInOutElastic(p5.map(time, -1, 1, 0, 1));
    if (rotate) p5.rotate(val * p5.HALF_PI * .5);
    return p5.lerp(from, to, val);
}

function drawSquares(): void {
    let halfNbSquares = nbSquares / 2;
    p5.translate(centerX, centerY);
    p5.randomSeed(3);
    let minLength: number = centerX / 64;
    let maxLength: number = centerX / 16;
    for (let iy = -halfNbSquares; iy < halfNbSquares; iy++) {
        let free = nbSquares * size;
        while (free > 0) {
            p5.push();
            let rdm: number = p5.min(free, p5.random(minLength, maxLength));
            let ix: number = -halfNbSquares * size + (nbSquares * size - free);
            let x: number = cmpPos(ix * 2, ix, p5.cos(time * cycle));
            let y: number = cmpPos(iy * 2 * size, iy * size, p5.sin(offset + time * cycle));
            p5.translate(x, y);
            p5.rect(0, 0, rdm + 1, size + 1);
            p5.pop();
            free -= rdm;
        }
    }
    time += 0.02;
}

function draw(): void {
    p5.background("black");
    p5.fill(squareColor);
    p5.noStroke();
    drawSquares();
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
        nbSquares: nbSquares,
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
        .add(params, "nbSquares",5, 40, 1)
        .onChange(value => nbSquares = value)
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
