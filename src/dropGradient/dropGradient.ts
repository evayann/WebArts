import * as dat from 'dat.gui';
import * as P5 from 'p5';

// Inspired by https://www.reddit.com/r/loadingicon/comments/lem7o7/tube_oc/?utm_source=share&utm_medium=ios_app&utm_name=iossmf

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let centerX: number = width / 2;
let centerY: number = height / 2;

let p5: P5;
let sfColor: string = "#3166d4";
let stColor: string = "#173364";//#3c1414
let strokeFromColor: P5.Color;
let strokeToColor: P5.Color;

let cycle: number = 2;
let angle: number = 0;
let nbSegment: number = 4;
let tilt: number = 315;

let pause: boolean = false;
let yCurrent: number = 0;
let limit: number = height / 3;

function drawShape(): void {
    p5.push();
    p5.translate(0, -centerY + limit + yCurrent);
    p5.beginShape();
    for (let i = 0; i > -p5.TAB; i -= angle) {
        let x: number = centerX + p5.cos(i) * 450;
        let y: number = centerY + p5.sin(i) * (tilt);
        p5.vertex(x, y);
    }
    p5.endShape();
    p5.pop();
}

function draw(): void {
    p5.background("black");
    p5.strokeWeight(2);
    yCurrent = limit;
    while (yCurrent > 0) {
        let offsetTime: number = (p5.millis() / (1000 * cycle)) % 1;
        p5.stroke(p5.lerpColor(strokeFromColor, strokeToColor, (yCurrent / limit + offsetTime) % 1));
        p5.noFill();
        drawShape();
        yCurrent--;
    }
}

function reset(): void {
    p5.clear();
    angle = p5.TAU / nbSegment;
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    strokeFromColor = p5.color(sfColor);
    strokeToColor = p5.color(stColor);
    p5.createCanvas(width, height);
    p5.frameRate(60);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        tilt: tilt,
        cycle: cycle,
        strokeColorFrom: sfColor,
        strokeColorTo: stColor,
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
        .add(params, "cycle",0.5, 5, 0.1)
        .onChange(value => cycle = value);
    guiEffect
        .add(params, "nbSegment",3, 50, 1)
        .onChange(value => {
            nbSegment = value;
            reset();
        });
    guiEffect
        .add(params, "tilt",200, 400, 1)
        .onChange(value => {
            tilt = value;
            reset();
        });
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "strokeColorFrom")
        .onChange(value => strokeFromColor = p5.color(value));
    guiVisual.addColor(params, "strokeColorTo")
        .onChange(value => strokeToColor = p5.color(value));
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
