<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {p5Instance, halfWidth as centerX, halfHeight as centerY} from "@/components/P5.vue";
import {ArtVue, resetTime, setLoopTime, menu, GUIType} from "@/arts/art";
import {BoxGrid, BoxDrawable, range, array, zip} from "@/arts/util";

let p5: p5Instance;
let nbElements = 3;
let pManager: Eggs;

class Egg implements BoxDrawable {
    private readonly vertices: [number, number][];
    private readonly white: number;
    private readonly yolkSize: number;
    private readonly yolkColor: number;
    private readonly yolkCX: number;
    private readonly yolkCY: number;

    constructor(nbPart: number, whiteColor: number, yolkSize: number) {
        this.white = whiteColor;
        this.yolkSize = yolkSize;
        this.yolkColor = p5.random();
        this.yolkCX = p5.random(-1, 1);
        this.yolkCY = p5.random(-1, 1);
        this.vertices = [];
        let alpha: number;
        const amplitudes: number[] = array(nbPart, () => p5.random(1 / (2 * nbPart)));
        const phases: number[] = array(nbPart, () => p5.random(p5.TAU));
        for (let i = nbPart; i--;)
            this.vertices.push([
                p5.cos((alpha = i / nbPart * p5.TAU)) * Egg.getRadius(alpha, amplitudes, phases),
                p5.sin(alpha) * Egg.getRadius(alpha, amplitudes, phases)
            ]);
    }

    private static getRadius(alpha: number, amplitudes: number[], phases: number[]): number {
        let results = 0, i = 0;
        for (const [amp, phase] of zip(amplitudes, phases))
            results += amp * p5.cos((++i * alpha) - phase);
        return 1 + results;
    }

    renderInBox(tlx: number, tly: number, size: number): void {
        p5.push();
        p5.translate(tlx, tly);

        // White
        p5.strokeWeight(3);
        p5.stroke(33, 70 + this.white * 30, 100);
        p5.fill(0, this.white * 10, 100);
        p5.beginShape();
        let [vx, vy] = this.vertices[this.vertices.length - 1];
        p5.curveVertex(vx * size, vy * size);
        for ([vx, vy] of this.vertices)
            p5.curveVertex(vx * size, vy * size);
        [vx, vy] = this.vertices[0];
        p5.curveVertex(vx * size, vy * size);
        p5.endShape(p5.CLOSE);

        // Yolk
        p5.noStroke();
        const s = p5.constrain(this.yolkSize, .75, 1) * size;
        p5.fill(50 + this.yolkColor * 10, 100, 100);
        p5.circle(this.yolkCX * (size / 3), this.yolkCY * (size / 3), s);
        p5.fill(50 + this.yolkColor * 10, 30 + this.yolkSize * 10, 100);
        p5.ellipse(this.yolkCX * (size / 2), this.yolkCY * (size / 2),
            s * p5.constrain(this.yolkSize, .3, .6),
            s * p5.constrain((1 - this.yolkSize) / 2, .3, .6));
        p5.pop();
    }
}

class Eggs extends BoxGrid {
    addDrawables(): void {
        range(this.nbElements * this.nbElements).forEach(() => {
            this.effects.push(new Egg(~~p5.random(15, 30), p5.random(), p5.random()));
        });
    }
}

function draw(): void {
    p5.clear();
    p5.translate(centerX, centerY);
    p5.colorMode(p5.HSB);
    pManager.render();
}

function reset(): void {
    pManager.reset(nbElements, 5/6);
    resetTime();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.noStroke();
    pManager = new Eggs();
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
                    menu("Grid Size", nbElements, 2, 10, 1, value => { nbElements = value; reset(); }),
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
