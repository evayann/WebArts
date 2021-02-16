import * as dat from 'dat.gui';
import * as P5 from 'p5';
import validate = WebAssembly.validate;

// Inspired by https://twitter.com/concinnus/status/1360423475631058950?s=12

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;
let sColor: string = "#f26060";
let tColor: string = "#60f273";
let stColor: P5.Color;
let toColor: P5.Color;

let pause: boolean = false;
let speed: number = 1;
let time: number = 0;
let nbElements: number = 1;
let inc: boolean = true;

let toDraw: Array<Circle> = [];

class Circle {
    private readonly x: number;
    private readonly y: number;
    private readonly s: number;
    private readonly hs: number;
    private readonly start: number;
    private life: number;

    constructor(x: number, y: number, size: number) {
        this.s = size;
        this.hs = this.s / 2;
        this.x = x + this.hs;
        this.y = y + this.hs;
        this.start = time;
        this.life = 0;
        toDraw.unshift(this);
    }

    display(): void {
        this.life = time - this.start;
        p5.fill(p5.lerpColor(stColor, toColor, this.life));
        p5.square(this.x, this.y, p5.abs(this.s - this.life * this.s), this.life * this.s / 2);
        if (this.life > 1)
            toDraw.splice(toDraw.indexOf(this), 1);
    }
}

let generate = (x: number): boolean => p5.sq(x) % 1 < .95;

function draw(): void {
    p5.background("black");
    time += 0.01 * speed;
    p5.stroke("white");
    let xOffset: number = 0, yOffset: number = 0;
    (width > height) ? xOffset = (width - height) / 2 : yOffset = (height - width) / 2;
    let gSize: number = p5.min(width, height);
    let size: number = gSize / nbElements;

    if (generate(time)) {
        inc = true;
        for (let yi = 0; yi < nbElements; yi++)
            for (let xi = 0; xi < nbElements; xi++)
                new Circle(xOffset + xi * size, yOffset + yi * size, size);
    }
    else {
        if (inc) {
            nbElements = (nbElements + 1) % 5;
            inc = false;
        }
    }

    for (let c of toDraw)
        c.display();
}

function reset(): void {
    p5.clear();
    time = 0;
    nbElements = 1;
    toDraw = [];
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    stColor = p5.color(sColor);
    toColor = p5.color(tColor);
    p5.createCanvas(width, height);
    p5.rectMode(p5.CENTER);
    p5.frameRate(60);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        speed: speed,
        nbElements: nbElements,
        stColor: sColor,
        toColor: tColor,
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
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "stColor")
        .onChange(value => stColor = p5.color(value));
    guiVisual.addColor(params, "toColor")
        .onChange(value => toColor = p5.color(value));
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
