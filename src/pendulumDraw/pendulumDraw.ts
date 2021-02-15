import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;
let armLength: number = Math.min(halfWidth, halfHeight) / 2;

let p5: P5;
let hColor: string = "#b98a5d";
let historyColor: P5.Color;

let pause: boolean = false;
let time: number = 0;
let damping: number = .99;
let histLength: number = 500;
let hidePendulum: boolean = true;

let m1 = 10;
let a1X = 0;
let a1XV = 0;
let a1Y = 0;
let a1YV = 0;
let g = 1;
let history: Array<number[]> = [];

function updateHistory(x: number, y: number): void {
    p5.strokeWeight(1);
    p5.stroke(historyColor);
    p5.noFill();

    p5.beginShape();
    for (let [xo, yo] of history)
        p5.vertex(xo, yo);
    p5.endShape();

    history.push([x, y]);
    if (history.length > histLength)
        history.splice(0, 1);
}

function update(): number[] {
    let grav: number = -g / armLength;

    let a1AX = grav * p5.sin(a1X);
    a1XV = (a1XV + a1AX) * damping;
    a1X += a1XV;

    let a1AY = grav * p5.sin(a1Y);
    a1YV = (a1YV + a1AY) * damping;
    a1Y += a1YV;

    return [halfWidth * 1.5 * p5.sin(a1X), halfHeight * 1.5 * p5.sin(a1Y)];
}

function display(xy: number[]): void {
    let [x, y] = xy;
    p5.translate(halfWidth, halfHeight);
    updateHistory(x, y);
    if (hidePendulum)
        return;
    p5.stroke(255);
    p5.line(0, 0, x, y);
    p5.strokeWeight(2);
    p5.fill(0);
    p5.circle(x, y, m1);
}

function draw() {
    p5.background("black");
    display(update());
}

function reset(): void {
    p5.clear();
    history = [];
    a1X = p5.random(0, p5.PI);
    a1Y = p5.random(0, p5.PI);
    time = 0;
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    historyColor = p5.color(hColor);
    p5.stroke(historyColor);
    p5.createCanvas(width, height);
    p5.frameRate(60);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        gravity: g,
        damping: damping,
        histLength: histLength,
        historyColor: hColor,
        hidePendulum: hidePendulum,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "gravity",0.01, 2, 0.01)
        .onChange(value => g = value)
        .name("Gravity");
    guiEffect
        .add(params, "damping",0, 1, 0.01)
        .onChange(value => damping = value);
    guiEffect
        .add(params, "histLength",0, 1000, 1)
        .onChange(value => histLength = value);
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "historyColor")
        .onChange(value => {
            historyColor = p5.color(value);
            p5.stroke(historyColor);
        });
    guiVisual
        .add(params, "hidePendulum")
        .onChange(value => {
            hidePendulum = value;
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
    halfWidth = width / 2;
    halfHeight = height / 2;
    armLength = Math.min(halfWidth, halfHeight) / 2;
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
