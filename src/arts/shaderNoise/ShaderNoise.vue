<template>
    <P5Vue @preload="this.preloadP5" @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, seed, menu, switchButton, color, GUIType} from "@/arts/util";
let p5: p5Instance;

let perlinGraph: P5.Graphics;
let perlinShader: P5.Shader;

let time = 0;
let speed = 1;
let dirX = 1;
let dirY = 1;
let lines = false;
let perlinScale = 200;

const color1 = "#c8f8f6";
const color2 = "#a5e06c";
const color3 = "#58be2d";
const color4 = "#00c4ff";
const color5 = "#194796";
const colorStroke = "#191b26";

let p5Color1: P5.Color;
let p5Color2: P5.Color;
let p5Color3: P5.Color;
let p5Color4: P5.Color;
let p5Color5: P5.Color;
let p5ColorStroke: P5.Color;

const parseColor = (color) => [p5.red(color) / 255, p5.green(color) / 255, p5.blue(color) / 255];

function drawShader(): void {
    perlinGraph.shader(perlinShader);
    console.log(seed);
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

function preload(p: p5Instance) {
    p5 = p;
    const vert = `
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

    const frag = `
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
    p5Color1 = p5.color(color1);
    p5Color2 = p5.color(color2);
    p5Color3 = p5.color(color3);
    p5Color4 = p5.color(color4);
    p5Color5 = p5.color(color5);
    p5ColorStroke = p5.color(colorStroke);
    draw();
}

export default class Art extends ArtVue {
    preloadP5(p: p5Instance): void {
        preload(p);
    }

    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5();
    }

    drawP5(): void {
        draw();
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Speed", speed, .1, 5, .1, value => speed = value),
                    menu("X Direction", dirX, -1, 1, 1, value => dirX = value),
                    menu("Y Direction", dirY, -1, 1, 1, value => dirY = value),
                    switchButton("Lines", "No lines", value => lines = value),
                    menu("Noise Scale", perlinScale, 75, 1000, .1, value => perlinScale = value)
                ],
                "Visual & Color": [
                    color("color1", color1, value => p5Color1 = p5.color(value)),
                    color("color2", color2, value => p5Color2 = p5.color(value)),
                    color("color3", color3, value => p5Color3 = p5.color(value)),
                    color("color4", color4, value => p5Color4 = p5.color(value)),
                    color("color5", color5, value => p5Color5 = p5.color(value)),
                    color("colorStroke", colorStroke, value => p5ColorStroke = p5.color(value))
                ],
                "Misc": [
                    this.seed(() => reset()),
                    this.pause(),
                    this.reset(reset)
                ]
            }
        });
    }
}
</script>