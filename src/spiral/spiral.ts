import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;

let pause: boolean = false;
let time: number = 0;
let speed: number = 1;
let size: number = 10;
let nbWave: number = 5;
let amplitude: number = 1.5;
let wColor: string = "#36caa4";
let bgColor: string = "#ca365c";
let waveColor: P5.Color;
let backgroundColor: P5.Color;

function draw(): void {
    p5.background(backgroundColor);
    let computeTime: number = time / (10 * (1 / speed));
    for (let x = 0; x < width + size; x += size) {
        for (let y = 0; y < height + size; y += size) {
            let d: number = p5.dist(x, y, halfWidth, halfHeight) / 32;
            let theta: number = p5.atan2(y - halfHeight, x - halfWidth);
            let wave: number = p5.sin(p5.cos(d - computeTime) * amplitude + theta * nbWave);
            if (wave < 0.5)
                p5.square(x, y, size);
        }
    }
    time++;
}

function setupP5(p: P5): void {
    p5 = p;
    backgroundColor = p5.color(bgColor);
    p5.createCanvas(width, height);
    waveColor = p5.color(wColor);
    p5.rectMode(p5.CENTER);
    p5.stroke(waveColor);
    p5.fill(waveColor);
    draw();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        size: size,
        speed: speed,
        nbWave: nbWave,
        wColor: wColor,
        bgColor: bgColor,
        amplitude: amplitude,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speed",0.1, 10, 0.1)
        .onChange(value => speed = value);
    guiEffect
        .add(params, "size",1, 30, 1)
        .onChange(value => size = value);
    guiEffect
        .add(params, "nbWave",1, 7, 1)
        .onChange(value => nbWave = value);
    guiEffect
        .add(params, "amplitude",0.1, 2, 0.1)
        .onChange(value => amplitude = value);
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "wColor")
        .onChange(value => {
            waveColor = p5.color(value);
            p5.stroke(waveColor);
            p5.fill(waveColor);
        });
    guiVisual.addColor(params, "bgColor")
        .onChange(value => backgroundColor = p5.color(value));
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
