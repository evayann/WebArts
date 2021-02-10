import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;

let shaderGraph: P5.Graphics;
let shader: P5.Shader;

let pause: boolean = false;
let seed: number = 0;
let time: number = 0;
let speed: number = 1;
let nbWave: number = 2;
let offset: number = 20;
let recursion: number = 2;
let squares: P5.Graphics;

let flagsFunction: {[id: string]: Function} = {drawFlagFrench: drawFlagFrench,
    drawFlagItalian: drawFlagItalian, drawFlagIreland: drawFlagIreland, drawFlagBelgium: drawFlagBelgium,
    drawFlagDeutsch: drawFlagDeutsch, drawFlagLuxembourg: drawFlagLuxembourg,
    drawFlagNetherlands: drawFlagNetherlands, drawFlagRussia: drawFlagRussia,
    drawFlagSweden: drawFlagSweden, randomFlag: randomFlag};
let currentFlag: Function = drawFlagFrench;

function drawFlagFrench(x: number, y: number, w: number, h: number): void {
    drawTricolorVerticalFlag(x, y, w, h, "#115dc8", "#fdfdfd", "#e5131a");
}

function drawFlagItalian(x: number, y: number, w: number, h: number): void {
    drawTricolorVerticalFlag(x, y, w, h, "#33c811", "#fdfdfd", "#e5131a");
}

function drawFlagIreland(x: number, y: number, w: number, h: number): void {
    drawTricolorVerticalFlag(x, y, w, h, "#33c811", "#fdfdfd", "#e59113");
}

function drawFlagBelgium(x: number, y: number, w: number, h: number): void {
    drawTricolorVerticalFlag(x, y, w, h, "#000000", "#f3d510", "#e5131a");
}

function drawTricolorVerticalFlag(x: number, y: number, w: number, h: number, c1: string, c2: string, c3: string): void {
    squares.stroke("black");
    squares.rect(x, y, w, h);
    squares.noStroke();
    squares.fill(c1);
    squares.rect(x - w / 3, y, w / 3, h);
    squares.fill(c2);
    squares.rect(x, y, w / 3, h);
    squares.fill(c3);
    squares.rect(x + w / 3, y, w / 3, h);
}

function drawFlagDeutsch(x: number, y: number, w: number, h: number): void {
    drawTricolorHorizontalFlag(x, y, w, h, "#000000", "#e5131a", "#f3d510");
}

function drawFlagLuxembourg(x: number, y: number, w: number, h: number): void {
    drawTricolorHorizontalFlag(x, y, w, h, "#e5131a", "#ffffff", "#0e96bf");
}

function drawFlagNetherlands(x: number, y: number, w: number, h: number): void {
    drawTricolorHorizontalFlag(x, y, w, h, "#e5131a", "#ffffff", "#115dc8");
}

function drawFlagRussia(x: number, y: number, w: number, h: number): void {
    drawTricolorHorizontalFlag(x, y, w, h, "#ffffff", "#115dc8", "#e5131a");
}

function drawTricolorHorizontalFlag(x: number, y: number, w: number, h: number, c1: string, c2: string, c3: string): void {
    squares.stroke("black");
    squares.rect(x, y, w, h);
    squares.noStroke();
    squares.fill(c1);
    squares.rect(x, y - h / 3, w, h / 3);
    squares.fill(c2);
    squares.rect(x, y, w, h / 3);
    squares.fill(c3);
    squares.rect(x, y + h / 3, w, h / 3);
}

function drawFlagSweden(x: number, y: number, w: number, h: number): void {
    squares.stroke("black");
    squares.fill("#115dc8");
    squares.rect(x, y, w, h);
    squares.noStroke();
    squares.fill("#e5b813");
    squares.rect(x - w / 4, y, w / 8, h);
    squares.rect(x, y, w, h / 6);
}

function randomFlag(x: number, y: number, w: number, h: number): void {
    let keys: string[] = Object.keys(flagsFunction);
    flagsFunction[keys[p5.floor(p5.random(0, keys.length - 1))]](x, y, w, h);
}

function drawFlags(x: number, y: number, w: number, h: number, i: number): void {
    if (i > recursion) {
        currentFlag(x, y, w, h);
        return;
    }

    let ox: number = w / 4, oy: number = h / 4;
    let ow: number = w / 2 - offset / i, oh: number = h / 2 - offset / i;
    drawFlags(x - ox, y - oy, ow, oh, ++i);
    drawFlags(x + ox, y - oy, ow, oh, i);
    drawFlags(x + ox, y + oy, ow, oh, i);
    drawFlags(x - ox, y + oy, ow, oh, i);
}

function drawBackground(): void {
    squares.stroke("gray");
    squares.fill("gray");
    squares.rect(halfWidth, halfHeight, width - offset, height - offset);
}

function drawShader(): void {
    shaderGraph.shader(shader);
    shader.setUniform("time", time / (10 * (1 / speed)));
    shader.setUniform("nbWave", nbWave);
    shader.setUniform("texSquares", squares);
    shaderGraph.plane(0, 0);
    p5.image(shaderGraph, 0, 0, width, height);
}

function draw(): void {
    squares.clear();
    squares.background("black");
    p5.randomSeed(seed);
    drawBackground();
    drawFlags(halfWidth, halfHeight, width - offset, height - offset, 1);
    drawShader();
    time++;
}

function preload(p: P5) {
    p5 = p;
    shaderGraph = p5.createGraphics(width, height, p5.WEBGL);
    shaderGraph.noStroke();
    let vert =
        `#ifdef GL_ES
        precision highp float;
        precision highp int;
        #endif
        
        varying vec2 vTexPos;
        attribute vec3 aPosition;
        attribute vec2 aTexCoord;
        
        void main() {
            vTexPos = aTexCoord;
            vec4 pos = vec4(aPosition, 1.0);
            pos.xy = pos.xy * 2.0;
            gl_Position = pos;
        }`;
    let frag =
        `#ifdef GL_ES
        precision highp float;
        #endif
        #define PI 3.14
        #define MAX_AMP 0.05
        
        varying vec2 vTexPos;
        uniform float time;
        uniform float nbWave;
        uniform sampler2D texSquares;
        
        void main() {
            vec2 uv = vTexPos;
            uv.y = 1.0 - uv.y;
            uv.x += sin(uv.y + time) * 0.025;
            uv.y += cos(uv.x * PI * nbWave * 2.0 + time) * clamp(MAX_AMP, 0.0, 0.15);
            gl_FragColor = texture2D(texSquares, uv);
        }`;
    shader = shaderGraph.createShader(vert, frag);
}

function setupP5(): void {
    p5.pixelDensity(1);
    p5.createCanvas(width, height);
    squares = p5.createGraphics(width, height);
    squares.rectMode(p5.CENTER);
    draw();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        flags: "drawFlagFrench",
        speed: speed,
        nbWave: nbWave,
        offset: offset,
        nbSquareInside: recursion,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        }
    };

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speed",0.1, 5, 0.1)
        .onChange(value => speed = value);
    guiEffect
        .add(params, "flags", Object.keys(flagsFunction))
        .onChange(value => {
            currentFlag = flagsFunction[value];
            seed = p5.floor(p5.random() * 1500);
        });
    guiEffect
        .add(params, "offset",0, 40, 0.1)
        .onChange(value => offset = value);
    guiEffect
        .add(params, "nbSquareInside",0, 4, 1)
        .onChange(value => recursion = value);
    guiEffect
        .add(params, "nbWave",0, 5, 1)
        .onChange(value => nbWave = value);
    guiEffect.open();

    const guiMisc = gui.addFolder("Misc");
    let ps = guiMisc
        .add(params, "pause")
        .name("Pause")
        .onChange(() => (! pause) ? ps.name("Play") : ps.name("Pause"));
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
        p.preload = () => {
            preload(p);
        }

        p.setup = () => {
            setupP5();
        }

        p.draw = () => {
            draw();
        };
    }
    p5 = new P5(sketch);
    setupDatGUI();
    resize();
}
