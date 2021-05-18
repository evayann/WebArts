<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, halfWidth as centerX, halfHeight as centerY} from "@/components/P5.vue";
import {ArtVue, time, resetTime, setLoopTime, menu, GUIType} from "@/arts/art";
import {BoxGrid, BoxDrawable, shuffle, range} from "@/arts/util";

let p5: p5Instance;
let alpha = 25;
let nbCircle = 10;
let nbElements = 3;
let pManager: ParticlesManager;

type Periodic = (x: number) => number;
const cosBase: Array<Periodic> = [
    Math.cos,
    (x) => (1 - Math.cos(x)) / 2,
    (x) => (1 + Math.cos(x)) / 2,
    (x) => 1 / (2 + Math.cos(x)),
    (x) => Math.cos(x) * Math.cos(x),
    (x) => Math.cos(x) * Math.sin(x),
    (x) => p5.map(Math.cos(x) + Math.sin(x), 0, 2, 0, 1),
];

const sinBase: Array<Periodic> = [
    Math.sin,
    (x) => (1 - Math.sin(x)) / 2,
    (x) => (1 + Math.sin(x)) / 2,
    (x) => 1 / (2 + Math.sin(x)),
    (x) => Math.sin(x) * Math.sin(x),
];

function getPeriodicFunction(array: Array<Periodic>): Periodic {
    return shuffle([...array])[0];
}

const getCos: () => Periodic = () => getPeriodicFunction(cosBase);
const getSin: () => Periodic = () => getPeriodicFunction(sinBase);

class ExtendedParticles implements BoxDrawable {
    private readonly xFunc: Periodic;
    private readonly yFunc: Periodic;
    private readonly nbPart: number;
    private readonly sizeOffset: number;
    private color: number;
    private readonly colorIncrement: number;

    constructor(nbPart: number, colorStart: number, colorIncrement: number, sizeOffset: number) {
        if (Math.random() < .5) {
            this.xFunc = getCos();
            this.yFunc = getSin();
        }
        else {
            this.xFunc = getSin();
            this.yFunc = getCos();
        }
        this.nbPart = nbPart;
        this.sizeOffset = sizeOffset;
        this.color = colorStart;
        this.colorIncrement = colorIncrement;
    }

    renderInBox(tlx: number, tly: number, size: number): void {
        this.color = (this.color + this.colorIncrement) % 360;
        p5.fill(this.color, 200, 255);
        p5.push();
        p5.translate(tlx, tly);
        for (let i = this.nbPart; i--;) {
            p5.push();
            p5.rotate(-(i / this.nbPart) * p5.TAU);
            this.drawParticle(size);
            p5.pop();
        }
        p5.pop();
    }

    drawParticle(size: number): void {
        p5.circle(this.xFunc(time) * size, this.yFunc(time) * size,
            Math.abs(10 + this.sizeOffset * this.yFunc(time)));
    }
}

class ParticlesManager extends BoxGrid {
    addDrawables(): void {
        range(this.nbElements * this.nbElements).forEach(() => {
            this.effects.push(new ExtendedParticles(~~p5.random(5, nbCircle),
                ~~p5.random(360), p5.random([-2, -1, 0, 1, 2]), p5.random(8)));
        });
    }
}

function draw(): void {
    p5.colorMode(p5.RGB);
    p5.fill(0, alpha);
    p5.rect(0, 0, width, height);
    p5.translate(centerX, centerY);
    p5.colorMode(p5.HSB);
    pManager.render();
}

function reset(): void {
    pManager.reset(nbElements, 2/3);
    resetTime();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.noStroke();
    pManager = new ParticlesManager();
    setLoopTime(p5.TAU);
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
                    menu("Max Circle per element", nbCircle, 5, 25, 1, value => { nbCircle = value; reset(); }),
                    menu("Grid Size", nbElements, 2, 10, 1, value => { nbElements = value; reset(); }),
                ],
                "Visual & Color": [
                    menu("Alpha", alpha, 0, 255, 1, value => alpha = value)
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
