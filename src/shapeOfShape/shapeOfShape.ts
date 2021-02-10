import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let centerX: number = width / 2;
let centerY: number = height / 2;

let p5: P5;
let partA: P5.Graphics;
let partB: P5.Graphics;
let fColor: string = "#ffffff";
let sColor: string = "#3166d4";
let fillColor: P5.Color;
let strokeColor: P5.Color;

let counter: number = 0;
let angle: number = 0;
let fps: number = 60;
let cycle: number = 1;
let amplitude: number = 1;

let nbSegment: number = 3;
let elements: number = 60;
let xRadius: number = 450;
let yRadius: number = 385;
let size: number = 160;

let pause: boolean = false;

function generatePoints(): {index: number, point: number[]}[] {
    let points: {index: number, point: number[]}[] = [];
    let offset: number = (nbSegment == 3) ? p5.HALF_PI / 3 : 0;
    for (let i = 0; i < nbSegment; i++) {
        let theta = angle * i + offset;
        points[i] = {index: i, point: [centerX + p5.cos(theta) * xRadius, centerY + p5.sin(theta) * yRadius]};
    }
    return points;
}

function drawSquare(part: P5.Graphics, x: number, y: number, i: number): void {
    part.push();
    part.translate(x, y);
    part.rotate(i);
    part.rect(0, 0, size, size);
    part.pop();
}

function drawSens(pts: {index: number, point: number[]}[], previous: number[], part: P5.Graphics): void {
    for (let pt of pts) {
        let [x1, y1] = previous;
        let [x2, y2] = pt.point;
        for (let j = 0; j < elements; j++) {
            let x: number = p5.lerp(x1, x2, j / elements);
            let y: number = p5.lerp(y1, y2, j / elements);
            drawSquare(part, x, y,
                (((j + pt.index * elements) / (elements * nbSegment)) * (p5.TAU * (1 / amplitude))
                    + (p5.millis() / 500) * (1 / cycle)));
        }
        previous = pt.point;
    }
}

function drawSquareLoop(): void {
    let pts: {index: number, point: number[]}[] = generatePoints();
    let previous: number[] = pts[pts.length - 1].point;
    drawSens(pts, previous, partA);

    let len: number = pts.length - 1;
    let half: number = ~~(pts.length / 2);
    pts = pts.slice(half, len + 1).concat(pts.slice(0, half));
    previous = pts[pts.length - 1].point;
    drawSens(pts, previous, partB);

    // p5.image(partA.get(0, 0, width, height), 0, 0);
    // p5.image(partB.get(0, 0, width, height), 0, 0);

    p5.image(partA.get(0, height / 2 - 50, width, height / 2 + 50), 0, height / 2 - 50);
    p5.image(partB.get(0, 0, width, height / 2), 0, 0);
}

function draw(): void {
    partA.clear();
    partB.clear();
    p5.background("black");
    partA.stroke(strokeColor);
    partB.stroke(strokeColor);
    partA.fill(fillColor);
    partB.fill(fillColor);
    drawSquareLoop();
    counter++;
}

function reset(): void {
    angle = p5.TAU / nbSegment;
    counter = 0;
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    fillColor = p5.color(fColor);
    strokeColor = p5.color(sColor);
    p5.createCanvas(width, height);
    partA = p5.createGraphics(width, height);
    partB = p5.createGraphics(width, height);
    p5.frameRate(fps);
    p5.rectMode(p5.CENTER);
    partA.rectMode(p5.CENTER);
    partB.rectMode(p5.CENTER);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        size: size,
        cycle: cycle,
        xRadius: xRadius,
        yRadius: yRadius,
        amplitude: amplitude,
        fillColor: fColor,
        elements: elements,
        strokeColor: sColor,
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
        .add(params, "cycle",0.1, 5, 0.1)
        .onChange(value => cycle = value)
        .name("Cycle Time (s)");
    guiEffect
        .add(params, "amplitude",0.1, 5, 0.1)
        .onChange(value => cycle = value);
    guiEffect
        .add(params, "nbSegment",3, 20, 1)
        .onChange(value => {
            nbSegment = value;
            reset();
        });
    guiEffect
        .add(params, "elements",3, 60, 1)
        .onChange(value => {
            elements = value;
            reset();
        });
    guiEffect
        .add(params, "xRadius", width / 8, centerX, 1)
        .onChange(value => xRadius = value);
    guiEffect
        .add(params, "yRadius",height / 8, centerY, 1)
        .onChange(value => yRadius = value);
    guiEffect
        .add(params, "size",size / 4, size * 2, 1)
        .onChange(value => size = value);
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "strokeColor")
        .onChange(value => strokeColor = p5.color(value));
    guiVisual.addColor(params, "fillColor")
        .onChange(value => fillColor = p5.color(value));
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
