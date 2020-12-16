import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;

let p5: P5;
let fps: number = 30;
let nbColumn: number = 120;
let nbRow: number = 85;
let xOffset: number = 0.1;
let yOffset: number = 0.1;
let contrast: number = 1.15;

let bColor: string = "#000000";
let backgroundColor: P5.Color;
let invertColor: P5.Color;
let useColor: boolean = true;
let useText: boolean = true;
let characters: string = " |$@#!%"; // :*=+-.
let caracs: string[] = characters.split("");
let drawer: Function = null;

let pause: boolean = false;

let camLoad: boolean = false;
let cam = null;
let xSize: number, ySize: number;
const parsePos = (x, y) => (y * cam.width + x) * 4;

function iterOn(xStart: number, yStart: number,): number[] {
    let r: number = 0, g: number = 0, b: number = 0;
    let counter = 0;
    for (let x = xStart; x < xStart + xSize; x++) {
        for (let y = yStart; y < yStart + ySize && y < cam.height; y++) {
            let p = parsePos(x, y);
            r += cam.pixels[p] * contrast;
            g += cam.pixels[p + 1] * contrast;
            b += cam.pixels[p + 2] * contrast;
            counter++;
        }
    }
    return [r / counter, r / counter, b / counter];
}

function setDrawer() {
    if (useText)
        if (! useColor)
            drawer = (colors) => {
                p5.fill(invertColor);
                let val = colors.reduce((sum, curr) => sum + curr, 0);
                p5.text(caracs[Math.floor(p5.map(val / 3, 0, 255, 0, caracs.length - 1))], 0, 0);
            };
        else
            drawer = (colors) => {
                p5.fill(p5.color(colors));
                let val = colors.reduce((sum, curr) => sum + curr, 0);
                p5.text(caracs[Math.floor(p5.map(val / 3, 0, 255, 0, caracs.length - 1))], 0, 0);
            };
    else
            drawer = (colors) => {
                p5.fill(p5.color(colors));
                p5.ellipse(0, 0, xSize - xOffset * xSize, ySize - yOffset * ySize);
            }
}

function draw(): void {
    if (! camLoad)
        return;

    p5.clear();
    p5.background(backgroundColor);
    cam.loadPixels();
    p5.scale(width / cam.width, height / cam.height);
    p5.translate(xSize / 2, ySize / 2);
    for (let x = 0; x < cam.width; x += xSize) {
        let y: number;
        for (y = 0; y < cam.height; y += ySize) {
            drawer(iterOn(x, y));
            p5.translate(0, ySize);
        }
        p5.translate(xSize, -y);
    }
}

function resetParams(): void {
    xSize = Math.floor(cam.width / nbColumn);
    ySize = Math.floor(cam.height / nbRow);
    caracs = characters.split("");
    setDrawer();
}

function reset(): void {
    cam = p5.createCapture(p5.VIDEO, () => {
        camLoad = true;
        console.log("Cam loaded !");
    });
    cam.size(1920, 1080);
    cam.hide();
    resetParams();
}

function setupP5(p: P5): void {
    p5 = p;
    backgroundColor = p5.color(bColor);
    invertColor = p5.color(255 - p5.red(backgroundColor),
        255 - p5.green(backgroundColor), 255 - p5.blue(backgroundColor));
    p5.createCanvas(width, height);
    p5.frameRate(fps);
    p5.noStroke();
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        nbRow: nbRow,
        nbColumn: nbColumn,
        xOffset: xOffset,
        yOffset: yOffset,
        useText: useText,
        useColor: useColor,
        backgroundColor: bColor,
        characters: characters,
        cam: () => {
            if (camLoad) {
                cam.stop();
                camLoad = false;
            }
            else {
                reset();
            }
        },
        pause: () => {
            pause = ! pause;
            if (pause) {
                p5.noLoop();
                if (camLoad)
                    cam.pause();
            }
            else {
                p5.loop();
                if (camLoad)
                    cam.play();
            }
        }};
    const guiEffect = gui.addFolder("Effect");
    guiEffect
        .add(params, "nbRow",10, height / 8, 1)
        .onChange(value => {
            nbRow = value;
            resetParams();
        });
    guiEffect
        .add(params, "nbColumn",10, width / 8, 1)
        .onChange(value => {
            nbColumn = value;
            resetParams();
        });
    guiEffect
        .add(params, "xOffset",0, 1, 0.01)
        .onChange(value => xOffset = value);
    guiEffect
        .add(params, "yOffset",0, 1, 0.01)
        .onChange(value => yOffset = value);
    guiEffect
        .add(params, "useText")
        .onChange(value => {
            useText = value;
            resetParams();
        });
    guiEffect
        .add(params, "characters")
        .onChange(value => {
            characters = value;
            resetParams();
        });
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual
        .add(params, "useColor")
        .onChange(value => {
            useColor = value;
            resetParams();
        });
    guiVisual
        .addColor(params, "backgroundColor")
        .onChange(value => {
            backgroundColor = p5.color(value);
            invertColor = p5.color(255 - p5.red(backgroundColor),
                255 - p5.green(backgroundColor), 255 - p5.blue(backgroundColor));
        });
    guiVisual.open();

    const guiMisc = gui.addFolder("Misc");
    let ps = guiMisc
        .add(params, "pause")
        .name("Pause")
        .onChange(() => (! pause) ? ps.name("Play") : ps.name("Pause"));
    let camGui = guiMisc
        .add(params, "cam")
        .name("Stop Cam")
        .onChange(() => (! camLoad) ? camGui.name("Stop Cam") : camGui.name("Turn on Cam"));
    guiMisc.open();
}

function resize(): void {
    width = window.innerWidth;
    height = window.innerHeight;
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
