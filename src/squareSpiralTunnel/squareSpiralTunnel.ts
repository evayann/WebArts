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

let currentPosition: number[] = [1, 0];

function computeColor(depth: number, el: number): number {
    return (arrayEquals([depth, el], currentPosition)) ? 255 : 10;
}

function incrementCurrentPostion(): void {
    let d: number, el: number;
    [d, el] = currentPosition;
    if (el == 7)
        currentPosition = [d + 1, 0];
    else
        currentPosition = [d, el + 1];

}

function draw(): void {
    p5.clear();
    p5.background(backgroundColor);

    p5.stroke(strokeColor);
    p5.strokeWeight(strokeSize);
    p5.fill(255, 0, 0, 255);

    let depth: number = 20;
    let offset: number = 60;
    p5.translate(centerX, centerY);
    for (let i: number = offset; i <= depth * offset; i += offset) {
        for (let j = 0; j < 8; j += 2) {
            p5.fill(computeColor(i / offset, j))
            p5.rect(0, i + 25, i * 3, i);
            p5.rotate(90);
        }
        p5.rotate(45);
        for (let j = 1; j < 8; j += 2) {
            p5.fill(computeColor(i / offset, j))
            p5.rect(0, i + 25, i * 3, i);
            p5.rotate(90);
        }
        p5.rotate(-45)
        /*for (let j: number = 0; j < 8; j++) {
            p5.fill(computeColor(i / offset, j))
            p5.rect(0, i, i, i);
            p5.rotate(45);
        }*/
    }
    incrementCurrentPostion();
    counter += 100;
}

function reset(): void {
    counter = 0;
    halfCube = cubeSize / 2;
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    backgroundColor = p5.color(bColor);
    strokeColor = p5.color(sColor);
    p.createCanvas(width, height);
    p.frameRate(2);
    p.rectMode(p.CENTER);
    p.angleMode(p.DEGREES);
    reset();
}

function arrayEquals(a: Array<any>, b: Array<any>): boolean {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
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
        })
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
