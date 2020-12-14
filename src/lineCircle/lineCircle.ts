import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let centerX: number = width / 2;
let centerY: number = height / 2;

let p5: P5;
let useColor: boolean = true;
let fColor: string = "#a21c1c";
let tColor: string = "#3166d4";
let fromColor: P5.Color;
let toColor: P5.Color;
let alpha: number = 255;

let counter: number = 0;
let angle: number = 0;
let fps: number = 60;
let cycle: number = 1;

let nbSegment: number = 4;
let xRadius: number = centerX;
let yRadius: number = centerY;
let circleSize: number = 20;

let pause: boolean = false;

function drawElement(lines: boolean) {

    let oldPos: number[] = [], initPos = [];
    for (let i = 1; i <= nbSegment; i++) {
        let theta = angle * i;
        let sizeX = p5.cos(theta) * (xRadius - circleSize * 2);
        let sizeY = p5.sin(theta) * (yRadius - circleSize * 2);

        let startX = centerX + sizeX, startY = centerY + sizeY;
        let endX = centerX - sizeX, endY = centerY - sizeY;

        let percent = p5.map(p5.cos(theta + (counter / fps) / cycle), -1, 1, 0, 1);
        let x = p5.lerp(startX, endX, percent);
        let y = p5.lerp(startY, endY, percent);

        useColor ? p5.fill(p5.lerpColor(fromColor, toColor, percent)) : p5.fill("white");
        p5.circle(x, y, circleSize);

        if (lines) {
            if (oldPos.length == 0) {
                oldPos = [x, y];
                initPos = [x, y];
            }
            else {
                let [ox, oy] = oldPos;
                p5.line(ox, oy, x, y);
                oldPos = [x, y];
            }
        }
    }

    if (lines) {
        let [ix, iy] = initPos, [ox, oy] = oldPos;
        p5.line(ix, iy, ox, oy);
    }
}

function draw(): void {
    p5.fill(0, alpha);
    p5.rect(0, 0, width, height);
    drawElement(false);
    counter++;
}

function reset(): void {
    angle = p5.PI / nbSegment;
    counter = 0;
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    fromColor = p5.color(fColor);
    toColor = p5.color(tColor);
    p.noStroke();
    p.createCanvas(width, height);
    p5.frameRate(fps);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        cycle: cycle,
        xRadius: xRadius,
        yRadius: yRadius,
        fromColor: fColor,
        alpha: alpha,
        toColor: tColor,
        useColor: useColor,
        nbSegment: nbSegment,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "cycle",0.1, 10, 0.1)
        .onChange(value => cycle = value)
        .name("Cycle Time (s)");
    guiEffect
        .add(params, "nbSegment",3, 32, 1)
        .onChange(value => {
            nbSegment = value;
            reset();
        });
    guiEffect
        .add(params, "xRadius", width / 8, centerX, 1)
        .onChange(value => xRadius = value);
    guiEffect
        .add(params, "yRadius",height / 8, centerY, 1)
        .onChange(value => yRadius = value);
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.add(params, "useColor")
        .onChange(value => useColor = value);
    guiVisual.addColor(params, "toColor")
        .onChange(value => toColor = p5.color(value));
    guiVisual.addColor(params, "fromColor")
        .onChange(value => fromColor = p5.color(value));
    guiVisual.add(params, "alpha", 0, 255, 1)
        .onChange(value => alpha = value);
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
