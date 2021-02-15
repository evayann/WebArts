import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;
let pColor: string = "#b98a5d";
let ptColor: P5.Color;

let pause: boolean = false;
let speed: number = 1;
let time: number = 0;
let conicShape: number = 0.26;
let inclination: number = 2;
let radius: number = 0;

function draw(): void {
    p5.background("black");
    time += 0.01 * speed;
    for (let i = 0; i < 1500; i++) {
        let j: number = p5.map(p5.cos(time), -1, 1, 0, 1) * i;
        p5.strokeWeight((0.5 + (i / 1500)) * 3);
        let rIncl: number = radius / inclination;
        let a: number = j * conicShape + time;
        let x: number = halfWidth + p5.sin(a) * radius;
        let y: number = height + p5.cos(a) * rIncl - j;
        radius = p5.pow(j, 3) / 1e5;
        p5.point(x, y);
    }
}

function reset(): void {
    p5.clear();
    time = 0;
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    ptColor = p5.color(pColor);
    p5.stroke(ptColor);
    p5.createCanvas(width, height);
    p5.frameRate(60);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        speed: speed,
        conicShape: conicShape,
        inclination: inclination,
        ptColor: pColor,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speed",0.1, 2, 0.1)
        .onChange(value => speed = value);
    guiEffect
        .add(params, "conicShape",0, 1, 0.01)
        .onChange(value => conicShape = value);
    guiEffect
        .add(params, "inclination",0.8, 5, 0.1)
        .onChange(value => inclination = value);
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "ptColor")
        .onChange(value => {
            ptColor = p5.color(value);
            p5.stroke(ptColor);
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
