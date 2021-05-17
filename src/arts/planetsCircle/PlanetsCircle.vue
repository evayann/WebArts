<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, seed, fps, time as t, menu, switchButton, GUIType, setLoopTime} from "@/arts/art";
// From https://github.com/cmllngf/planet_1/blob/master/sketch.js by cmllngf


let p5: p5Instance;
const bColor = "#000000";
let backgroundColor: P5.Color;
let colorFactor = 1;
let alpha = 90;

let nbPlanets = 8;
let useBelt = true;
const beltProba = 0.5;
let useMoon = false;
const moonProba = 0.5;
let maxSize = 100;
let minSize = 20;
let rotateSpeedFactor = 1;

let planets: Array<Planet> = new Array<Planet>();

class Planet {

    private readonly centerX: number;
    private readonly centerY: number;
    private readonly precision: number;
    private readonly radius: number;
    private readonly rotateSpeed: number;
    private readonly beltYAxis: number;

    private readonly colored: number;
    private readonly computePosition: () => number;
    private readonly computePositions: () => Array<number>;

    constructor(center: number[], radius: number, precision: number, rotateSpeed: number, beltYAxis: number) {
        [this.centerX, this.centerY] = center;
        this.radius = radius;
        this.precision = precision;
        this.rotateSpeed = rotateSpeed;
        this.beltYAxis = beltYAxis;
        this.colored = p5.random(360);
        this.computePosition = () => p5.random(p5.TWO_PI) + t * this.rotateSpeed * rotateSpeedFactor;
        this.computePositions = () => {
            const y: number = p5.random(-1, 1);
            return [this.computePosition(), y, p5.sqrt(1 - y * y)];
        }
    }

    draw(): void {
        // Planet
        for (let i = 0; i < this.precision; i++) {
            const [a, y, r] = this.computePositions();
            const z: number = p5.sin(a);
            p5.stroke(p5.noise(y * colorFactor + this.colored) * 360, 255, 255);
            if (z > 0)
                p5.point(p5.cos(a) * this.radius * r + this.centerX, y * this.radius + z * r * 5 + this.centerY);
        }

        // Belt
        if (useBelt && p5.random() < beltProba) {
            for (let j = 0; j < p5.random(6); j++) {
                const beltColor: P5.Color = p5.color(p5.random(360), p5.random(20, 50), p5.random(30, 70));
                p5.stroke(beltColor);

                const nbBelts: number = p5.random(200, 500);
                const stepX = 60;
                const stepY = 5;

                for (let i = 0; i < nbBelts; i++) {
                    const rx: number = p5.random(-30 + stepX * j, -30 + stepX * j + stepX);
                    const ry: number = p5.random(-5 + stepY * j, -5 + stepY * j + stepY);
                    const a: number = this.computePosition();
                    const xpos: number = p5.cos(a) * (this.radius * 2 + rx) + this.centerX;
                    const ypos: number = p5.sin(a) * (this.radius + this.beltYAxis + ry) + this.centerY;
                    if (ypos > this.centerY || p5.dist(this.centerX, this.centerY, xpos, ypos) > this.radius + 5) {
                        p5.point(xpos, ypos);
                    }
                }
            }
        }

        // Moons
        if (!useMoon || p5.random() > moonProba)
            return;

        const halfSpeedRotate: number = (rotateSpeedFactor / 2);
        for (let i = 0; i < 1; i++) {
            const start: number = p5.random(p5.TWO_PI);
            const yoff: number = p5.random(-75, 75);
            const yAxis: number = p5.random(-10, 10);
            const size: number = p5.random(10, this.radius / 3);
            const speedFactor: number = p5.random(0.5, 1.5);
            p5.stroke(p5.color(p5.random(360), p5.random(70, 100), p5.random(40, 70)));
            for (let j = 0; j < p5.random(60, 160); j++) {
                const [a, y, r] = this.computePositions();
                const z: number = p5.sin(a);
                const zpos: number = p5.sin(t * speedFactor * halfSpeedRotate + start);
                const xpos: number = p5.cos(a) * size * r + p5.cos(t * speedFactor * halfSpeedRotate + start) * 250 + this.centerX;
                const ypos: number = y * size + z * r * 5 + (this.centerY + yoff) + zpos * 25 * yAxis;
                if (z > 0 && (zpos > 0 || p5.dist(this.centerX, this.centerY, xpos, ypos) > this.radius))
                    p5.point(xpos, ypos);
            }
        }
    }
}

function draw(): void {
    p5.stroke(backgroundColor);
    p5.fill(backgroundColor);
    p5.rect(0, 0, width, height);

    p5.randomSeed(seed);
    p5.strokeWeight(1);
    // Little stars
    for (let i = 0; i < 500; i++) {
        let x: number, y;
        do {
            x = p5.random(width);
            y = p5.random(height);
        } while (p5.dist(width / 2, height / 2, x, y) < 55);
        p5.stroke(p5.random(360), p5.random(0, 20), p5.random(60, 100));
        p5.point(x, y);
    }

    p5.strokeWeight(2);
    for (const p of planets)
        p.draw();
}

function reset(): void {
    p5.randomSeed(seed);
    p5.noiseSeed(seed);
    planets = new Array<Planet>();
    const space: number = width / (nbPlanets);
    const halfSpace: number = space / 2;
    for (let i = 0; i < nbPlanets; i++)
        planets.push(new Planet([space * i + halfSpace, p5.random(height / 4, 3 * (height / 4))], p5.random(minSize, maxSize),
            p5.random(150, 750), p5.random(0.1, 2), p5.random(-45, 45)));
    draw();
    updateTime();
}

function updateTime(): void {
    setLoopTime(p5.TAU / rotateSpeedFactor);
}

function setupP5(p: p5Instance): void {
    p5 = p;
    backgroundColor = p5.color(bColor);
    backgroundColor.setAlpha(alpha);
    p5.frameRate(fps);
    p5.colorMode(p5.HSB);
    reset();
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5(p);
    }

    drawP5(p: p5Instance): void {
        super.drawP5(p);
        draw();
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Number Planets", nbPlanets, 1, 20, 1, value => { nbPlanets = value; reset(); }),
                    menu("Max Planet Size", maxSize, 50, 100, 1, value => { maxSize = value; reset(); }),
                    menu("Min Planet Size", minSize, 10, 50, 1, value => { minSize = value; reset(); }),
                    switchButton("No Belt", "Belt", value => { useBelt = value; reset(); }, useBelt),
                    switchButton("Moon", "No Moon", value => { useMoon = value; reset(); }),
                    menu("Rotation Speed", rotateSpeedFactor, .1, 5, .1, value => {rotateSpeedFactor = value; updateTime();})
                ],
                "Visual & Color": [
                    menu("Alpha", alpha, 0, 255, 1, value => {
                        alpha = value;
                        backgroundColor.setAlpha(alpha);
                    }),
                    menu("Color Factor", colorFactor, 0, 50, 1, value => colorFactor = value)
                ],
                "Misc": [
                    this.seed(),
                    this.pause(),
                    this.reset(reset)
                ]
            }
        });
    }
}
</script>