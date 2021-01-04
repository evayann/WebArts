import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let centerX: number = width / 2;
let centerY: number = height / 2;

let p5: P5;
let eColor: string = "#9e9eca";
let fColor: string = "#ca5a5a";
let emptyColor: P5.Color;
let fillColor: P5.Color;
let alpha: number = 120;
let spaceOffset: number = 20;

let False: number = 0;
let True: number = 1;
let gridHeight: number = 10;
let gridWidth: number = 2 * gridHeight - 1;
let currentGrid: number[][];
let nextGrid: number[][];

let counter: number = 0;
let updateTime: number = 0.75;
let fps: number = 60;
let initSegment: number = 3;
let rounded: boolean = true;

let drawer: Function;
let rotateOffset: number = 0;

let pause: boolean = false;

function computePosition(theta, gen): number[] {
    return [centerX + p5.cos(theta) * gen * 25, centerY + p5.sin(theta) * gen * 25];
}

function setDrawer(round: boolean): void {
    if (round)
        drawer = (oldTheta: number, currTheta: number, spaceBetween: number, generation: number) => {
            p5.noFill();
            p5.arc(centerX, centerY, generation * 50, generation * 50, oldTheta + spaceBetween, currTheta - spaceBetween);
        };
    else
        drawer = (oldTheta: number, currTheta: number, spaceBetween: number, generation: number) => {
            let [ox, oy] = computePosition(oldTheta + spaceBetween, generation);
            let [x, y] = computePosition(currTheta - spaceBetween, generation);
            p5.line(ox, oy, x, y);
        };
    p5.fill("black");
    p5.background("black");
}

function rule(p: number, q: number, r: number): number {
    return p ^ (p && q || r);
}

function parents(x: number, y: number): number {
    let top: number = (y - 1) < 0 ? gridHeight + y - 1 : (y - 1) % gridHeight;
    let xm1: number = (x - 1) < 0 ? gridWidth + x - 1 : (x - 1) % gridWidth;
    let p: number = currentGrid[top][xm1];
    let q: number = currentGrid[top][x];
    let r: number = currentGrid[top][(x + 1) % gridWidth];
    return rule(p, q, r);
}

function computeGeneration(): void {
    currentGrid[0][0] = p5.random() > 0.5 ? True : False;
    for (let i = 0; i < gridHeight; i++)
        for (let j = 0; j < gridWidth; j++)
            nextGrid[i][j] = parents(j, i);

    // Update generation, Buffer Swap
    [currentGrid, nextGrid] = [nextGrid, currentGrid];
}

function drawAutomata(): void {
    let nbPartAtGen: number = initSegment - 2;
    p5.stroke((currentGrid[0][0] == True) ? fillColor : emptyColor);
    p5.circle(centerX, centerY, 10);
    let oldTheta: number = -1, initTheta = 0;
    for (let r = 1; r < currentGrid.length - 1; r++) {
        nbPartAtGen += 2;
        let spaceBetween: number = spaceOffset / r;
        let angle: number = 360 / nbPartAtGen;
        for (let j = 1; j <= nbPartAtGen; j++) {
            p5.stroke((currentGrid[r][j - 1] == True) ? fillColor : emptyColor);

            let theta: number = angle * j + rotateOffset;
            if (oldTheta == -1) {
                oldTheta = theta;
                initTheta = theta;
            } else {
                drawer(oldTheta, theta, spaceBetween, r);
                oldTheta = theta;
            }
        }
        p5.stroke((currentGrid[r][nbPartAtGen - 1] == True) ? fillColor : emptyColor);
        drawer(oldTheta, initTheta, spaceBetween, r);
        oldTheta = -1;
        rotateOffset += 25;
    }
    rotateOffset = 0;
}

function draw(): void {
    drawAutomata();
    counter++;
    if (counter / fps >= updateTime) {
        computeGeneration();
        counter = 0;
    }
}

function reset(): void {
    setDrawer(rounded);
    currentGrid = new Array(gridHeight).fill(False).map(() => new Array(gridWidth).fill(False));
    nextGrid = new Array(gridHeight).fill(False).map(() => new Array(gridWidth).fill(False));
    for (let i = 0; i < p5.random(200, 500); i++)
        computeGeneration();
    counter = 0;
    draw();
}

function setColor(): void {
    emptyColor = p5.color(eColor);
    fillColor = p5.color(fColor);
    emptyColor.setAlpha(alpha);
    fillColor.setAlpha(alpha);

    p5.fill("black");
    p5.background("black");
}

function setupP5(p: P5): void {
    p5 = p;
    p5.angleMode(p5.DEGREES);
    p5.createCanvas(width, height);
    p5.frameRate(fps);
    p5.strokeWeight(7);
    p5.strokeCap(p5.ROUND);
    setColor();
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        updateTime: updateTime,
        nbGeneration: gridHeight,
        spaceOffset: spaceOffset,
        rounded: rounded,
        alpha: alpha,
        strokeSize: 7,
        fillColor: fColor,
        emptyColor: eColor,
        initSegment: initSegment,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "updateTime",0.1, 5, 0.1)
        .onChange(value => updateTime = value)
        .name("Update Time (s)");
    guiEffect
        .add(params, "initSegment",3, 7, 1)
        .onChange(value => {
            initSegment = value;
            reset();
        });
    guiEffect
        .add(params, "nbGeneration", 5, 40, 1)
        .onChange(value => {
            gridHeight = value;
            reset();
        });
    guiEffect
        .add(params, "spaceOffset", 15, 25, 1)
        .onChange(value => {
            spaceOffset = value;
            setColor();
        });
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual
        .add(params, "rounded")
        .onChange(value => {
            rounded = value;
            setDrawer(rounded);
        });
    guiVisual.addColor(params, "fillColor")
        .onChange(value => fillColor = p5.color(value));
    guiVisual.addColor(params, "emptyColor")
        .onChange(value => emptyColor = p5.color(value));
    guiVisual.add(params, "alpha", 0, 255, 1)
        .onChange(value => {
            alpha = value;
            setColor();
        });
    guiVisual.add(params, "strokeSize", 1, 12, 0.1)
        .onChange(value => {
            p5.strokeWeight(value);
            setColor();
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
    centerX = width / 2;
    centerY = height / 2;
    p5.resizeCanvas(width, height);
    setColor();
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
    reset();
}
