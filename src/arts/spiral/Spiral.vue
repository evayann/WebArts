<template>
    <P5Vue :canvas3D="true" @preload="this.preloadP5" @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth, halfHeight, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, button, color, GUIType} from "@/arts/util";

let p5: p5Instance;

let useShader = true;
let shaderGraph: P5.Graphics;
let shader: P5.Shader;
let size = 10;

let time = 0;
let zoom = 1;
let speed = 1;
let nbWave = 5;
let amplitude = 1.5;
let wColor = "#36caa4";
let bgColor = "#ca365c";
let waveColor: P5.Color;
let backgroundColor: P5.Color;

const parseColor = (color) => [p5.red(color) / 255, p5.green(color) / 255, p5.blue(color) / 255];

function drawIteratif(): void {
    p5.translate(-halfWidth, -halfHeight);
    p5.background(backgroundColor);
    const computeTime: number = time / (10 * (1 / speed));
    for (let x = 0; x < width + size; x += size) {
        for (let y = 0; y < height + size; y += size) {
            const d: number = (p5.dist(x, y, halfWidth, halfHeight) / 32) * zoom;
            const theta: number = p5.atan2(y - halfHeight, x - halfWidth);
            const wave: number = p5.sin(p5.cos(d - computeTime) * amplitude + theta * nbWave);
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

function preload(p: p5Instance) {
    p5 = p;
    shaderGraph = p5.createGraphics(width, height, p5.WEBGL);
    shaderGraph.noStroke();
    const vert =
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
    const frag =
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
        const params = {
            size: size,
            zoom: zoom,
            speed: speed,
            nbWave: nbWave,
            waveColor: wColor,
            backgroundColor: bgColor,
            amplitude: amplitude,
            useShader: useShader
        };
        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("speed", .1, 10, .1, value => speed = value),
                    menu("zoom", .1, 3, .1, value => zoom = value),
                    menu("nbWave", 1, 7, 1, value => nbWave = value),
                    menu("amplitude", .1, 2, .1, value => amplitude = value),
                ],
                "Visual & Color": [
                    color("waveColor", value => setWaveColor(value)),
                    color("backgroundColor", value => setBackgroundColor(value))
                ],
                "Misc": [
                    this.pause(),
                    menu("size", 1, 30, 1, value => size = value),
                    button("useShader", value => useShader = value)
                ]
            }
        });
    }
}
</script>