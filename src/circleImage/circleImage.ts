import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;

let p5: P5;
let contrast: number = 1;
let lColor: string = "#1e2830";
let lineColor: P5.Color;

let img: P5.Image = null;
let nbCircle: number = 120;
let nbIterByCircle: number = 100;
let strokeWeight: number = 3;
let imgFactor: number = 4;

function iterOn(i: P5.Image): number[] {
    let r: number = 0, g: number = 0, b: number = 0;
    let counter = 0;
    i.loadPixels();
    for (let x = 0; x < i.width; x++) {
        for (let y = 0; y < i.height; y++) {
            let p = (y * i.width + x) * 4;
            r += i.pixels[p] * contrast;
            g += i.pixels[p + 1] * contrast;
            b += i.pixels[p + 2] * contrast;
            counter++;
        }
    }
    return [r / counter, g / counter, b / counter];
}

function getSize(x: number, y: number): number {
    let colors: number[] = iterOn(img.get(Math.floor(x / imgFactor), Math.floor(y / imgFactor), 10, 10));
    return (.3 * colors[0] + .59 * colors[1] + .11 * colors[2]) / 255;
}

function draw(image: P5.Image): void {
    if (image== null) return;
    img = image
    p5.clear();
    p5.background("black");
    p5.image(img, 0, height * .85, width * .15, height * .15);
    p5.filter(p5.GRAY);
    p5.stroke(lineColor);
    p5.fill(lineColor);
    img.loadPixels();
    let prev: number[] = [width / 2, height / 2];
    let nbIter: number = nbCircle * nbIterByCircle;
    for (let i = 0; i < nbIter; i++) {
        let curr: number[] = [
            width / 2 + p5.cos(p5.TAU * (i / nbIterByCircle)) * (i / nbIter) * (width / 2),
            height / 2 + p5.sin(p5.TAU * (i / nbIterByCircle)) * (i / nbIter) * (height / 2)
        ];
        p5.strokeWeight(getSize(curr[0], curr[1]) * strokeWeight);
        p5.line(prev[0], prev[1], curr[0], curr[1]);
        prev = curr;
    }
    p5.noLoop();
}

function reset(): void {
    p5.clear();
    p5.background("black");
    p5.fill("white");
    p5.stroke("white");
    p5.text("Load image", width / 2 - 20, height / 2);
    p5.loadImage(`https://picsum.photos/${Math.floor(width / imgFactor)}/${Math.floor(height / imgFactor)}`,
            image => {draw(image)}
    );
}

function setupP5(p: P5): void {
    p5 = p;
    p5.createCanvas(width, height);
    lineColor = p5.color(lColor);
    p5.noStroke();
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        contrast: contrast,
        nbCircle: nbCircle,
        nbIterByCircle: nbIterByCircle,
        lineColor: lColor,
        strokeWeight: strokeWeight,
        update: () => {
            draw(img);
        }};
    const guiEffect = gui.addFolder("Effect");
    guiEffect
        .add(params, "contrast",0, 2, 0.01)
        .onChange(value => contrast = value);
    guiEffect
        .add(params, "nbCircle",50, 250, 1)
        .onChange(value => nbCircle = value);
    guiEffect
        .add(params, "nbIterByCircle",50, 500, 1)
        .onChange(value => nbIterByCircle = value);
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual
        .addColor(params, "lineColor")
        .onChange(value => lineColor = p5.color(value));
    guiVisual
        .add(params, "strokeWeight",1, 5, 0.01)
        .onChange(value => strokeWeight = value);
    guiVisual.open();

    const guiMisc = gui.addFolder("Misc");
    guiMisc
        .add(params, "update")
        .name("Update");
  guiMisc.open();
}

function resize(): void {
    width = window.innerWidth;
    height = window.innerHeight;
    p5.resizeCanvas(width, height);
    draw(img);
}

// window.onresize = resize;

window.onload = () => {
    let sketch = (p: P5) => {
        p.setup = () => {
            setupP5(p);
        }
    }
    p5 = new P5(sketch);
    resize();
    setupDatGUI();
}
