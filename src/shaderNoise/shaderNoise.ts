import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;

let perlinGraph: P5.Graphics;
let perlinShader: P5.Shader;

let pause: boolean = false;
let seed: number = 1;
let time: number = 0;
let speed: number = 1;
let dirX: number = 1;
let dirY: number = 1;
let lines: boolean = false;
let perlinScale: number = 200;

let color1: string = "#c8f8f6";
let color2: string = "#a5e06c";
let color3: string = "#58be2d";
let color4: string = "#00c4ff";
let color5: string = "#194796";
let colorStroke: string = "#191b26";

let p5Color1: P5.Color;
let p5Color2: P5.Color;
let p5Color3: P5.Color;
let p5Color4: P5.Color;
let p5Color5: P5.Color;
let p5ColorStroke: P5.Color;

const parseColor: Function = (color) => [p5.red(color) / 255, p5.green(color) / 255, p5.blue(color) / 255];

function drawShader(): void {
    perlinGraph.shader(perlinShader);
    perlinShader.setUniform("seed", seed);
    perlinShader.setUniform("time", time / (1 / speed));
    perlinShader.setUniform("dirX", dirX);
    perlinShader.setUniform("dirY", dirY);
    perlinShader.setUniform("lines", lines);
    perlinShader.setUniform("perlinScale", perlinScale);
    perlinShader.setUniform("color1", parseColor(p5Color1));
    perlinShader.setUniform("color2", parseColor(p5Color2));
    perlinShader.setUniform("color3", parseColor(p5Color3));
    perlinShader.setUniform("color4", parseColor(p5Color4));
    perlinShader.setUniform("color5", parseColor(p5Color5));
    perlinShader.setUniform("stroke", parseColor(p5ColorStroke));
    perlinGraph.plane(0, 0);
    p5.image(perlinGraph, 0, 0, width, height);
}

function draw(): void {
    p5.randomSeed(seed);
    drawShader();
    time++;
}

function preload(p: P5) {
    p5 = p;
    let vert = `
        #ifdef GL_ES
        precision highp float;
        precision highp int;
        #endif
        
        attribute vec3 aPosition;
        attribute vec2 aTexCoord;
        
        void main() {
            vec4 pos = vec4(aPosition, 1.0);
            pos.xy = pos.xy * 2.0;
            gl_Position = pos;
        }`;

    let frag = `
        precision highp float;

        #define PI 3.141592653589793
        
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform vec3 color4;
        uniform vec3 color5;
        uniform vec3 stroke;
        
        uniform float seed;
        uniform float time;
        uniform float dirX;
        uniform float dirY;
        uniform float lines;
        uniform float perlinScale;
                
        float rand2D(vec2 _p) {
            return fract(sin(dot(_p.xy ,vec2(12.9898,78.233))) * seed);
        }
        
        float rand(float _v) {
            return rand2D(vec2(_v));
        }
        
        float grad(vec2 _p1, vec2 _p2) {
            float theta = 2.0 * PI * rand2D(_p1);
            vec2 v1 = vec2(cos(theta), sin(theta)) / sqrt(2.0);
            vec2 v2 = _p2 - _p1;
            return dot(v1, v2);
        }
        
        float perlin(vec2 _p, float _size) {
            vec2 uv = _p / _size;
            float xf = smoothstep(0.0, 1.0, fract(uv.x));
            float yf = smoothstep(0.0, 1.0, fract(uv.y));
            float x0 = floor(uv.x);
            float x1 = x0 + 1.0;
            float y0 = floor(uv.y);
            float y1 = y0 + 1.0;
        
            float n1 = mix(grad(vec2(x0, y0), uv), grad(vec2(x1, y0), uv), xf);
            float n2 = mix(grad(vec2(x0, y1), uv), grad(vec2(x1, y1), uv), xf);
        
            return (mix(n1, n2, yf) + 1.0) / 2.0;
        }
        
        float strokeLines(float _v) {
            float rdm = rand2D(vec2(_v));
            if (rdm > 0.5) 
                return mod(floor((gl_FragCoord.x + gl_FragCoord.y) / 4.0), 9.0);
            else
                return mod(floor((gl_FragCoord.x - gl_FragCoord.y) / 4.0), 9.0);
        }
        
        void main() {    
            float amp = perlin(gl_FragCoord.xy + vec2(time * dirX, time * dirY), perlinScale);
        
            if (amp > 0.6) {
                gl_FragColor = vec4(color1, 1.0); 
            } 
            else if (amp > 0.59) {
                gl_FragColor = vec4(stroke, 1.0);
            } 
            else if (amp > 0.51) {
                gl_FragColor = vec4(color2, 1.0);
                if (lines == 1.0 && strokeLines(0.6) == 0.0) 
                    gl_FragColor = vec4(stroke, 1.0);
            } 
            else if (amp > 0.505) {
                gl_FragColor = vec4(stroke, 1.0);
            } 
            else if (amp > 0.42) {
                gl_FragColor = vec4(color3, 1.0);
                if (lines == 1.0 && 
                (strokeLines(0.3) == floor(rand(1.0) * 3.0) 
                || strokeLines(0.3) == floor(3.0 + rand(1.0) * 3.0)
                || strokeLines(0.3) == floor(6.0 + rand(1.0) * 3.0))) 
                    gl_FragColor = vec4(stroke, 1.0);
            } 
            else if (amp > 0.41) {
                gl_FragColor = vec4(stroke, 1.0);
            } 
            else if (amp > 0.4) {
                gl_FragColor = vec4(color4, 1.0);
            }
            else if (amp > 0.39) {
                gl_FragColor = vec4(stroke, 1.0);
            } 
            else {
                gl_FragColor = vec4(color5, 1.0);
                if (lines == 1.0 && (strokeLines(0.3) == floor(rand(1.0) * 3.0) 
                || strokeLines(0.3) == floor(3.0 + rand(1.0) * 3.0))) 
                    gl_FragColor = vec4(stroke, 1.0);
            }
        }`;
    perlinGraph = p5.createGraphics(width, height, p5.WEBGL);
    perlinGraph.noStroke();
    perlinShader = perlinGraph.createShader(vert, frag);
}

function reset(): void {
    time = 0;
}

function setupP5(): void {
    p5.pixelDensity(1);
    p5.createCanvas(width, height);
    p5Color1 = p5.color(color1);
    p5Color2 = p5.color(color2);
    p5Color3 = p5.color(color3);
    p5Color4 = p5.color(color4);
    p5Color5 = p5.color(color5);
    p5ColorStroke = p5.color(colorStroke);
    seed = p5.random(1, 1000000);
    draw();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        speed: speed,
        dirX: dirX,
        dirY: dirY,
        lines: lines,
        perlinScale: perlinScale,
        color1: color1,
        color2: color2,
        color3: color3,
        color4: color4,
        color5: color5,
        colorStroke: colorStroke,
        seed: seed,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }
    };

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speed",0.1, 5, 0.1)
        .onChange(value => speed = value);
    guiEffect
        .add(params, "dirX",-1, 1, 1)
        .onChange(value => dirX = value);
    guiEffect
        .add(params, "dirY",-1, 1, 1)
        .onChange(value => dirY = value);
    guiEffect
        .add(params, "lines")
        .onChange(value => lines = value);
    guiEffect
        .add(params, "perlinScale", 75, 1000, .1)
        .onChange(value => perlinScale = value);
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual
        .addColor(params, "color1")
        .onChange(value => p5Color1 = p5.color(value));
    guiVisual
        .addColor(params, "color2")
        .onChange(value => p5Color2 = p5.color(value));
    guiVisual
        .addColor(params, "color3")
        .onChange(value => p5Color3 = p5.color(value));
    guiVisual
        .addColor(params, "color4")
        .onChange(value => p5Color4 = p5.color(value));
    guiVisual
        .addColor(params, "color5")
        .onChange(value => p5Color5 = p5.color(value));
    guiVisual
        .addColor(params, "colorStroke")
        .onChange(value => p5ColorStroke = p5.color(value));
    guiVisual.open();

    const guiMisc = gui.addFolder("Misc");
    guiMisc
        .add(params, "seed", 1, 1000000)
        .onChange(value => seed = value);
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
