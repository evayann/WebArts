import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let centerX: number = width / 2;
let centerY: number = height / 2;

let p5: P5;
let bfColor: string = "#781818";
let boxFillColor: P5.Color;
let bsColor: string = "#627d7d";
let boxStrokeColor: P5.Color;

let pause: boolean = false;
let cycle: number = 1;
let time: number = 0;
let max: number = 5;
let amplitude: number = 10;
let chaos: boolean = false;
let boxs: Array<Box> = [];

class Box {
    private x: number;
    private y: number;
    private w: number;
    private h: number;
    private distCenterRatio: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.distCenterRatio = p5.dist(0, 0, x, y) / p5.dist(0, 0, centerX, centerY);
    }

    draw(): void {
        p5.push();
        p5.translate(this.x + this.w / 2, this.y + this.h / 2);
        p5.box(this.w, this.h,
            lerpTrigo(1, 500, p5.cos((time * cycle) + this.distCenterRatio * amplitude)));
        p5.pop();
    }
}

function lerpTrigo(from: number, to: number, t: number): number {
    return p5.lerp(from, to, p5.map(t, -1, 1, 0, 1));
}

function sphere(x, y) {
    p5.push();
    p5.translate(x, y);
    p5.sphere(25);
    p5.pop();
}

function splitSquare(x: number, y: number, w: number, h: number,
                     xOff: number, yOff: number, it: number): void {
    if (it >= max)
        boxs.push(new Box(x, y, w, h));
    else {
        splitSquare(x, y, w * xOff, h * yOff, p5.random(.2, .8), p5.random(.2, .8), it + 1);
        splitSquare(x + w * xOff, y, w * (1 - xOff), h * yOff, p5.random(.2, .8), p5.random(.2, .8), it + 1);
        splitSquare(x + w * xOff, y + h * yOff, w * (1 - xOff), h * (1 - yOff), p5.random(.2, .8), p5.random(.2, .8), it + 1);
        splitSquare(x, y + h * yOff, w * xOff, h * (1 - yOff), p5.random(.2, .8), p5.random(.2, .8), it + 1);
    }
}

function draw(): void {
    p5.background("black");
    p5.fill(boxFillColor);
    p5.stroke(boxStrokeColor);
    p5.scale(0.4);
    p5.rotateX(0.6);
    boxs.forEach(box => box.draw());
    time += .02;
}

function reset(): void {
    p5.clear();
    boxs = [];
    let size: number = Math.min(width, height);
    if (! chaos) {
        splitSquare(-size, -size, size, size, 0.75, 0.75, 1);
        splitSquare(0, -size, size, size, 0.25, 0.75, 1);
        splitSquare(0, 0, size, size, 0.25, 0.25, 1);
        splitSquare(-size, 0, size, size, 0.75, 0.25, 1);
    }
    else {
        splitSquare(-size, -size, size, size, p5.random(.2, .8), p5.random(.2, .8), 1);
        splitSquare(0, -size, size, size, p5.random(.2, .8), p5.random(.2, .8), 1);
        splitSquare(0, 0, size, size, p5.random(.2, .8), p5.random(.2, .8), 1);
        splitSquare(-size, 0, size, size, p5.random(.2, .8), p5.random(.2, .8), 1);
    }
    time = 0;
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    boxFillColor = p5.color(bfColor);
    boxStrokeColor = p5.color(bsColor);
    p5.createCanvas(width, height, p5.WEBGL);
    p5.strokeWeight(1);
    p5.normalMaterial();
    p5.frameRate(60);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        cycle: cycle,
        chaos: chaos,
        amplitude: amplitude,
        boxFillColor: bfColor,
        boxStrokeColor: bsColor,
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
        .add(params, "amplitude",0.1, 40, 0.1)
        .onChange(value => amplitude = value);
    guiEffect
        .add(params, "chaos")
        .onChange(value => {
            chaos = value;
            reset();
        });
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "boxFillColor")
        .onChange(value => boxFillColor = p5.color(value));
    guiVisual.addColor(params, "boxStrokeColor")
        .onChange(value => boxStrokeColor = p5.color(value));
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
