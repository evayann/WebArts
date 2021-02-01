import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;

let p5: P5;
let fColor: string = "#fafafa";
let tColor: string = "#1e3c7c";
let fromColor: P5.Color;
let toColor: P5.Color;

let offset: number = 1;
let size: number = 20;
let scale: number = 10;
let speed: number = 1;
let pause: boolean = false;

let computeNoise: Function =
    (x: number, y: number) =>
        p5.noise((x / width) * scale + (offset * speed) / 100,
            (y / height) * scale + (offset * speed) / 100);

let computeGradient: Function =
    (x: number) => p5.lerpColor(fromColor, toColor, x);

let drawersFunction: {[id: string]: Function} = {gradient: drawNoiseGradient,
    coloredBlock1: drawNoiseColored, coloredBlock2: drawNoiseColored2};
let drawer: Function = drawersFunction["coloredBlock2"];

function drawBlock(x: number, y: number, color: P5.Color, opacity: number): void {
    color.setAlpha(opacity * 255);
    p5.fill(color);
    p5.rect(x, y, size, size);
}

function drawNoiseGradient(x: number, y: number, noise: number): void {
    drawBlock(x, y, computeGradient(noise), p5.map(p5.cos(noise), -1, 1, 0, 1));
}

function drawNoiseColored(x: number, y: number, noise: number) {
    if (noise < 0.45)
        drawBlock(x, y, computeGradient(0.45), noise);
    if (noise < 0.6)
        drawBlock(x, y, computeGradient(0.6), noise);
    if (noise < 0.8)
        drawBlock(x, y, computeGradient(0.8), noise);
    if (noise <= 1)
        drawBlock(x, y, computeGradient(1), noise);
}

function drawNoiseColored2(x: number, y: number, noise: number): void {
    if (noise < 0.6)
        drawBlock(x, y, computeGradient(0.6), 0.8);
    else if (noise < 0.8)
        drawBlock(x, y, computeGradient(0.8), 0.6);
    else
        drawBlock(x, y, computeGradient(1), 0.4);

    if (noise < 0.45)
        drawBlock(x, y, computeGradient(0.45), 1);
}

function draw(): void {
    for (let x = 0; x < width; x += size) {
        for (let y = 0; y < height; y += size) {
            let noise: number = computeNoise(x, y);
            drawer(x, y, noise);
        }
    }
    offset++;
}

function setupP5(p: P5): void {
    p5 = p;
    p5.disableFriendlyErrors = true;
    fromColor = p5.color(fColor);
    toColor = p5.color(tColor);
    p.noStroke();
    p.createCanvas(width, height);
    p5.frameRate(30);
    draw();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        offset: offset,
        speed: speed,
        size: size,
        scale: scale,
        fromColor: fColor,
        toColor: tColor,
        drawers: "coloredBlock2",
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speed",0.1, 10, 0.1)
        .onChange(value => speed = value);
    guiEffect
        .add(params, "drawers", ["gradient", "coloredBlock1", "coloredBlock2"])
        .onChange(value => drawer = drawersFunction[value])
        .name("Draw Method");
    guiEffect
        .add(params, "scale",1, 25, 1)
        .onChange(value => scale = value);
    guiEffect
        .add(params, "size",5, 50, 1)
        .onChange(value => {
            size = value;
            draw();
        });
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "toColor")
        .onChange(value => toColor = p5.color(value));
    guiVisual.addColor(params, "fromColor")
        .onChange(value => fromColor = p5.color(value));
    guiVisual.open();

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
