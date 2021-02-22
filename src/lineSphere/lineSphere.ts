import * as dat from 'dat.gui';
import * as P5 from 'p5';
import validate = WebAssembly.validate;

// Inspired by https://twitter.com/beesandbombs/status/1361727805130760194?s=12

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;
let fColor: string = "#08e5b9";
let fromColor: P5.Color;
let tColor: string = "#ec0c20";
let toColor: P5.Color;

let pause: boolean = false;
let speed: number = 1;
let time: number = 0;
let radius: number = 230;
let nbSegment: number = 50;
let nbStroke: number = 8;
let twistFactor: number = 0.5;
let inflate: number = 3;
let maxWeight: number = 2.5;
let minWeight: number = 2.5;

let ease: Function = (p: number, g: number) =>
    (p < 0.5) ? 0.5 * p5.pow(2 * p, g) : 1 - 0.5 * p5.pow(2 * (1 - p), g);

function twister(rot: number): void {
    p5.push();
    p5.beginShape();
    for (let i = 0; i < nbSegment; i++) {
        let th: number = p5.TAU * i / nbSegment;
        let x_: number = radius * p5.cos(th);
        let y_: number = radius * p5.sin(th);
        let tw: number = twistFactor * Math.PI * p5.sin(th) + rot;
        let x: number = x_ * p5.cos(tw);
        let z: number = x_ * p5.sin(tw);
        p5.stroke(p5.lerpColor(fromColor, toColor,
            p5.map(x * p5.sin(time), -radius, radius, 0, 1)));
        p5.vertex(x, y_, z);
    }
    p5.endShape(p5.CLOSE);
    p5.pop();
}

function draw(): void {
    p5.background("black");
    time += 0.005 * speed;
    p5.translate(0, 0, radius);

    let scale: number = p5.map(p5.cos(p5.TAU * time), 1, -1, 0, 1);
    scale = p5.lerp(0.5, inflate, ease(scale, 3));
    p5.scale(1, 1, scale);
    p5.strokeWeight(p5.map(p5.sin(scale + time), -1, 1, minWeight, maxWeight));
    for (let a = 0; a < (nbStroke / 2); a++)
        twister(p5.TAU * (a + 2 * time) / nbStroke);
}

function reset(): void {
    p5.clear();
    time = 0;
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    toColor = p5.color(tColor);
    fromColor = p5.color(fColor);
    p5.createCanvas(width, height, p5.WEBGL);
    p5.smooth();
    p5.frameRate(60);
    p5.strokeWeight(3);
    p5.noFill();
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        speed: speed,
        radius: radius,
        nbSegment: nbSegment,
        twistFactor: twistFactor,
        nbStroke: nbStroke,
        inflate: inflate,
        tColor: tColor,
        fColor: fColor,
        minWeight: minWeight,
        maxWeight: maxWeight,
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
    guiEffect
        .add(params, "radius",75, 250, 1)
        .onChange(value => radius = value);
    guiEffect
        .add(params, "nbSegment",50, 1500, 10)
        .onChange(value => nbSegment = value);
    guiEffect
        .add(params, "nbStroke",1, 20, 2)
        .onChange(value => nbStroke = value);
    guiEffect
        .add(params, "twistFactor",0, 5, 0.1)
        .onChange(value => twistFactor = value);
    guiEffect
        .add(params, "inflate",0, 5, 0.1)
        .onChange(value => inflate = value);
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "tColor")
        .onChange(value => toColor = p5.color(value));
    guiVisual.addColor(params, "fColor")
        .onChange(value => fromColor = p5.color(value));
    guiVisual
        .add(params, "maxWeight",2.5, 5, 0.1)
        .onChange(value => maxWeight = value);
    guiVisual
        .add(params, "minWeight",0.1, 2.5, 0.1)
        .onChange(value => minWeight = value);
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
