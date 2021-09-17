<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {height, halfWidth as hw, halfHeight as hh, p5Instance} from "@/components/P5.vue";
import {ArtVue, time, setLoopTime, menu, GUIType} from "@/arts/art";
import {range} from "@/arts/util";
// Implemented from https://medium.com/@r.l.bongers/visual-effect-analysis-animated-raindrops-682b83b87e09

let p5: p5Instance;

let precision = 200;
let nbPilar = 10;
let seed = 599889989; // 412424451
let waveAmp = .3;
let waveSpeed = 10;
let nbStar = 500;

function cmpWave(y: number): number {
    return p5.sin(p5.map(y + time * waveSpeed, 0, 20, 0, p5.TAU)) * waveAmp
        * p5.map(y, 0, hh, 3, 10); // Impact of distance
}

function randomPoint(min: number, max: number): [number, number, number, number] {
    const toBound: (number) => number = (v) => p5.map(v,  0, 1, min, max);
    let p1 = .025
    let p2 = p5.random(p1, 1 - p1);
    let p3 = p5.random(p2, 1 - p2);
    let p4 = .975
    return [toBound(p1), toBound(p2), toBound(p3), toBound(p4)];
}

function ellipseReflect(x: number, y: number, w: number, h: number): void {
    p5.stroke(180);
    p5.fill(180);
    p5.ellipse(x, y, w, h);
    p5.stroke(50);
    p5.fill(50);
    p5.beginShape();
    // Real wave
    if (w > 2 || h > 2) {
        for (let i = 0; i < p5.TAU; i += p5.TAU / 360) {
            let vx = x + p5.sin(i) * w / 2;
            let vy = -y + p5.cos(i) * h / 2;
            p5.vertex(vx, vy + cmpWave(vy));
        }
        p5.endShape(p5.CLOSE);
    }
    // Oscillation for simulate real wave for little element
    else {
        p5.ellipse(x, -y + cmpWave(y), w, h);
    }
}

function circleReflect(x: number, y: number, s: number,): void {
    ellipseReflect(x, y, s, s);
}

function rectReflect(x: number, y: number, w: number, h: number): void {
    p5.stroke(180);
    p5.fill(0);
    p5.rect(x, -y, w, h);
    p5.stroke(50);
    p5.rect(x, y - h, w, h + cmpWave(y));
}

function lineReflect(x1: number, y1: number, x2: number, y2: number, size=2): void {
    rectReflect(x1 - size, y1 - size, x2 - x1 + size, y2 - y1 + size);
}

function bridge(): void {
    let [x1, x2, x3, x4] = randomPoint(-hw, hw);
    let [y1, y2, y3, y4] = randomPoint(hh / 8, hh / 2);
    let [s1, s2, s3, s4] = randomPoint(hw / 8, hw / 4);

    for (let i = precision; i--;) {
        let t = i / precision;
        let x = -p5.bezierPoint(x1, x2, x3, x4, t);
        let y = p5.bezierPoint(y1, y2, y3, y4, t);
        let s = 20 + t * 150;

        if (i % Math.floor(precision / nbPilar) == 0)
            rectReflect(x, y - 5, 5 * t + 3, y - 5);

        lineReflect(x - s / 2, y, x + s / 2, y);
    }
}

function stars(): void {
    p5.randomSeed(seed);
    range(nbStar).forEach(() => {
        const [x, y] = [p5.random(-hw, hw), -p5.random(height)];
        circleReflect(x, y, 1.95);
    });
    const s = p5.random(hh * .2, hh * .5);
    ellipseReflect(p5.random(-hw * .9, hw * .9), -p5.random(hh * .25, hh * .8), s, s);
    p5.randomSeed(seed);
}

function draw(): void {
    p5.background("black");
    p5.randomSeed(seed);
    p5.push();
    p5.translate(hw, p5.random(hh, height));
    stars();
    bridge();
    p5.pop();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.noStroke();
    loop();
}

function loop(): void {
    setLoopTime(20 / waveSpeed);
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
                    menu("Number Star", nbStar, 0, 1000, 1, value => nbStar = value),
                    menu("Wave Speed", waveSpeed, 0, 20, .01, value => { waveSpeed = value; loop(); }),
                    menu("Wave Amplitude", waveAmp, 0, 5, .01, value => waveAmp = value),
                    menu("Precision", precision, 50, 300, 1, value => precision = value),
                    menu("Number Pilar", nbPilar, 10, 150, 1, value => nbPilar = value),
                    menu("Seed", seed, 0, 1000000000, 1, value => seed = value)
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>