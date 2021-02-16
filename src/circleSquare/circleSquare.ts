import * as dat from 'dat.gui';
import * as P5 from 'p5';
import validate = WebAssembly.validate;

// Inspired by https://www.reddit.com/r/generative/comments/ljiy5d/can_a_circle_rotate/?utm_source=share&utm_medium=ios_app&utm_name=iossmf

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;
let pColor: string = "#f26060";
let ptColor: P5.Color;

let pause: boolean = false;
let speed: number = 1;
let time: number = 0;
let nbElements: number = 25;


function drawCircle(x: number, y: number, size: number, value: number): void {
    let dist: number = p5.dist(x, y, halfWidth, halfHeight);
    let normDist: number = dist / p5.dist(0, 0, halfWidth, halfHeight);
    p5.push();
    p5.translate(x, y);
    p5.rotate(normDist * value);
    p5.fill(p5.color(p5.red(ptColor) * normDist, p5.green(ptColor) * normDist, p5.blue(ptColor) * normDist));
    p5.square(0, 0, p5.abs(.5 - value) * size * 2, value > .5 ? size : 0);
    p5.pop();
}

function draw(): void {
    p5.background("black");
    time += 0.01 * speed;
    p5.stroke("white");
    let anim: number = p5.map(p5.cos(time), -1, 1, 0, 1);
    let size: number = (p5.max(width, height) / nbElements) * 1.5;
    let yOffset: number = height / (nbElements * 2);
    let xOffset: number = width / (nbElements * 2);
    p5.translate(halfWidth, halfHeight);
    p5.rotate(time * 0.1 * speed);
    let maxSize: number = p5.max(halfWidth, halfHeight) * 1.5;
    for (let yi = 0; yi < nbElements; yi++) {
        let y: number = yOffset + height / (nbElements * 2) + p5.map(yi, 0, nbElements, -maxSize, maxSize);
        let xOff: number = ((yi % 2 == 0) ? xOffset : 0) + xOffset / 2;
        for (let xi = 0; xi <= nbElements; xi++) {
            let x: number = xOff + p5.map(xi, 0, nbElements, -maxSize, maxSize);
            drawCircle(x, y, size, anim);
        }
    }
}

function reset(): void {
    p5.clear();
    time = 0;
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    ptColor = p5.color(pColor);
    p5.createCanvas(width, height);
    p5.frameRate(60);
    p5.rectMode(p5.CENTER);
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
        .add(params, "nbElements",10, 100, 1)
        .onChange(value => nbElements = value);
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
