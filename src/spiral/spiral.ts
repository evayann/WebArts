import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;

let useShader: boolean = true;
let shaderGraph: P5.Graphics;
let shader: P5.Shader;
let size: number = 10;

let pause: boolean = false;
let time: number = 0;
let zoom: number = 1;
let speed: number = 1;
let nbWave: number = 5;
let amplitude: number = 1.5;
let wColor: string = "#36caa4";
let bgColor: string = "#ca365c";
let waveColor: P5.Color;
let backgroundColor: P5.Color;

const parseColor: Function = (color) => [p5.red(color) / 255, p5.green(color) / 255, p5.blue(color) / 255];

function drawIteratif(): void {
    p5.translate(-halfWidth, -halfHeight);
    p5.background(backgroundColor);
    let computeTime: number = time / (10 * (1 / speed));
    for (let x = 0; x < width + size; x += size) {
        for (let y = 0; y < height + size; y += size) {
            let d: number = (p5.dist(x, y, halfWidth, halfHeight) / 32) * zoom;
            let theta: number = p5.atan2(y - halfHeight, x - halfWidth);
            let wave: number = p5.sin(p5.cos(d - computeTime) * amplitude + theta * nbWave);
            if (wave < 0.5)
                p5.square(x, y, size);
        }
    }
}

function drawShader(): void {
    shaderGraph.shader(shader);
    shader.setUniform("time", time / (10 * (1 / speed)));
    shader.setUniform("zoom", zoom);
    shader.setUniform("wColor", parseColor(wColor));
    shader.setUniform("bgColor", parseColor(bgColor));
    shader.setUniform("amplitude", amplitude);
    shader.setUniform("nbWave", nbWave);
    shaderGraph.plane(0, 0);
    p5.image(shaderGraph, 0, 0, width, height);
}

function draw(): void {
    useShader ? drawShader() : drawIteratif();
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
        
        varying vec2 vPos;
        attribute vec3 aPosition;
        
        void main() {
            vec4 pos = vec4(aPosition, 1.0);
            pos.xy = pos.xy * 4.0 - 1.0;
            vPos = (gl_Position = pos).xy;
        }`;
    let frag =
        `#ifdef GL_ES
        precision highp float;
        #endif
        
        varying vec2 vPos;
        uniform float time;
        uniform float zoom;
        uniform vec3 wColor;
        uniform vec3 bgColor;
        uniform float amplitude;
        uniform float nbWave;
        
        void main() {
            float d = distance(vPos.xy, vec2(0.0)) * (zoom * 16.0);
            float theta = atan(vPos.y, vPos.x);
            float wave = sin(cos(d - time) * amplitude + theta * nbWave);
            if (wave < 0.5)
                gl_FragColor = vec4(wColor, 1.0);
            else
                gl_FragColor = vec4(bgColor, 1.0);
        }`;
    shader = shaderGraph.createShader(vert, frag);
}

function setupP5(): void {
    p5.pixelDensity(1);
    p5.createCanvas(width, height, p5.WEBGL);
    setBackgroundColor(bgColor);
    setWaveColor(wColor);
    p5.rectMode(p5.CENTER);
    p5.imageMode(p5.CENTER);
    draw();
}

function setBackgroundColor(color: string) {
    bgColor = color;
    backgroundColor = p5.color(bgColor);
}

function setWaveColor(color: string) {
    wColor = color;
    waveColor = p5.color(wColor);
    p5.stroke(waveColor);
    p5.fill(waveColor);
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        size: size,
        zoom: zoom,
        speed: speed,
        nbWave: nbWave,
        wColor: wColor,
        bgColor: bgColor,
        amplitude: amplitude,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        useShader: useShader
    };

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speed",0.1, 10, 0.1)
        .onChange(value => speed = value);
    guiEffect
        .add(params, "zoom",0.1, 3, 0.1)
        .onChange(value => zoom = 1 / value);
    guiEffect
        .add(params, "nbWave",1, 7, 1)
        .onChange(value => nbWave = value);
    guiEffect
        .add(params, "amplitude",0.1, 2, 0.1)
        .onChange(value => amplitude = value);
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "wColor")
        .onChange(value => setWaveColor(value));
    guiVisual.addColor(params, "bgColor")
        .onChange(value => setBackgroundColor(value));
    guiVisual.open();

    const guiMisc = gui.addFolder("Misc");
    let ps = guiMisc
        .add(params, "pause")
        .name("Pause")
        .onChange(() => (! pause) ? ps.name("Play") : ps.name("Pause"));
    guiMisc
        .add(params, "size",1, 30, 1)
        .onChange(value => size = value);
    guiMisc
        .add(params, "useShader")
        .onChange(value => useShader = value);
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
