import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number;
let height: number;
let widthGrid: number = 80;
let heightGrid: number = 80;

let p: P5;
let useColor: boolean = true;
let fColor: string = "#4e7de0";
let tColor: string = "#886400";
let fromColor: P5.Color;
let toColor: P5.Color;

let nbLines: number = 1;
let spaceBetweenLine: number = 2;
let seed: number = 0;

function drawLine(p: P5, x: number, y: number): void {
    let left: boolean = false;
    if (p.random(0, 1) < 0.5)
        left = true;

    for (let i = - nbLines / 2; i <= nbLines / 2; i++) {
        let incX: number = x, incY = (left) ? y - i * spaceBetweenLine : y + i * spaceBetweenLine;

        if (useColor)
            p.stroke(p.lerpColor(fromColor, toColor, ((incX + widthGrid) / width + (incY + heightGrid) / height) / 2.0));
        else
            p.stroke(0);

        if (left)
            p.line(incX, incY, incX + widthGrid, incY + heightGrid);
        else
            p.line(incX, incY + heightGrid, incX + widthGrid, incY);
    }
}

function draw(p: P5): void {
    p.clear();
    p.randomSeed(seed);
    for (let i = 0; i < width; i += widthGrid)
        for (let j = 0; j < height; j += heightGrid)
            drawLine(p, i, j);
}

function setupP5(p: P5): void {
    fromColor = p.color(fColor);
    toColor = p.color(tColor);
    p.resizeCanvas(800, 800);
    draw(p);
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {width: widthGrid, height: heightGrid, useColor: useColor,
        fromColor: fColor, toColor: tColor,
        spaceBetweenLine: spaceBetweenLine,
        nbLines: nbLines,
        seed: seed,
        reset: () => draw(p)};

    const guiCanvas = gui.addFolder("Canvas");
    guiCanvas
        .add(params, "width",10, 500, 1)
        .onChange(value => {
            widthGrid = value;
            draw(p);
        });
    guiCanvas
        .add(params, "height", 10, 500, 1)
        .onChange(value => {
            heightGrid = value;
            draw(p);
        });
    guiCanvas.open();

    const guiColor = gui.addFolder("Colors");
    guiColor.add(params, "useColor")
        .onChange(value => {
            useColor = value;
            draw(p);
        });
    guiColor.addColor(params, "fromColor")
        .onChange(value => {
            fromColor = p.color(value);
            draw(p);
        });
    guiColor.addColor(params, "toColor")
        .onChange(value => {
            toColor = p.color(value);
            draw(p);
        });
    guiColor.open();

    const guiMisc = gui.addFolder("Misc");
    guiMisc
        .add(params, "nbLines", 1, 5, 1)
        .onChange(value => {
            nbLines = value;
            draw(p);
        });
    guiMisc
        .add(params, "spaceBetweenLine", 1, 10, 1)
        .onChange(value => {
            spaceBetweenLine = value;
            draw(p);
        });
    guiMisc
        .add(params, "seed", 0, Number.MAX_SAFE_INTEGER, 1)
        .onChange(value => {
            seed = value;
            draw(p);
        });
    guiMisc
        .add(params, "reset")
        .name("Reset");
    guiMisc.open();
}

function resize(): void {
    width = window.innerWidth;
    height = window.innerHeight;
    p.resizeCanvas(width, height);
    draw(p);
}

window.onresize = resize;

window.onload = () => {
    let sketch = (p5: P5) => {
        p5.setup = () => {
            setupP5(p5);
        }
    }
    p = new P5(sketch);
    resize();
    setupDatGUI();
}
