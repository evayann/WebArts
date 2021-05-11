<template>
    <P5Vue :canvas3D="true" @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, time, resetTime, menu, color, GUIType} from "@/arts/util";

let p5: p5Instance;

const fColor = "#08e5b9";
let fromColor: P5.Color;
const tColor = "#ec0c20";
let toColor: P5.Color;

let speed = .5;
let radius = 230;
let nbSegment = 50;
let nbStroke = 8;
let twistFactor = 0.5;
let inflate = 3;
let maxWeight = 2.5;
let minWeight = 2.5;

const ease = (p: number, g: number) =>
    (p < 0.5) ? 0.5 * p5.pow(2 * p, g) : 1 - 0.5 * p5.pow(2 * (1 - p), g);

function twister(rot: number): void {
    p5.push();
    p5.beginShape();
    for (let i = 0; i < nbSegment; i++) {
        const th: number = p5.TAU * i / nbSegment;
        const x_: number = radius * p5.cos(th);
        const y_: number = radius * p5.sin(th);
        const tw: number = twistFactor * Math.PI * p5.sin(th) + rot;
        const x: number = x_ * p5.cos(tw);
        const z: number = x_ * p5.sin(tw);
        p5.stroke(p5.lerpColor(fromColor, toColor,
            p5.map(x * p5.sin(speed * time), -radius, radius, 0, 1)));
        p5.vertex(x, y_, z);
    }
    p5.endShape(p5.CLOSE);
    p5.pop();
}

function draw(): void {
    p5.background("black");
    p5.translate(0, 0, radius);

    let scale: number = p5.map(p5.cos(p5.TAU * speed * time), 1, -1, 0, 1);
    scale = p5.lerp(0.5, inflate, ease(scale, 3));
    p5.scale(1, 1, scale);
    p5.strokeWeight(p5.map(p5.sin(scale + speed * time), -1, 1, minWeight, maxWeight));
    for (let a = 0; a < (nbStroke / 2); a++)
        twister(p5.TAU * (a + 2 * speed * time) / nbStroke);
}

function reset(): void {
    p5.clear();
    resetTime();
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    toColor = p5.color(tColor);
    fromColor = p5.color(fColor);
    // p5.smooth();
    p5.strokeWeight(3);
    p5.noFill();
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
                    menu("Speed", speed, .1, 3, .01, value => speed = value),
                    menu("Radius", radius, 75, 250, 1, value => radius = value),
                    menu("Precision", nbSegment, 50, 1500, 10, value => nbSegment = value),
                    menu("Number Straight", nbStroke, 1, 20, 2, value => nbStroke = value),
                    menu("Twist", twistFactor, 0, 5, .1, value => twistFactor = value),
                    menu("Inflate", inflate, 0, 5, .1, value => inflate = value),
                ],
                "Visual & Color" : [
                    color("From", fColor, value => fromColor = this.p5.color(value)),
                    color("To", tColor, value => toColor = this.p5.color(value)),
                    menu("Max Stroke", maxWeight, 2.5, 5, .1, value => maxWeight = value),
                    menu("Min Stroke", minWeight, .1, 2.5, .1, value => minWeight = value),
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>