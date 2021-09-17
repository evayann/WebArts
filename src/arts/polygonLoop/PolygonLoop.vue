<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth as hw, halfHeight as hh, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, time, setLoopTime, menu, GUIType, color} from "@/arts/art";

let p5: p5Instance;

let nbShape = 100;
let shapeSize = 7;
let nbSide = 4;
let sColor = "#debc84";
let stroke: P5.Color;
let fColor = "#668e5a";
let fill: P5.Color;

function polygon(width: number, height: number): void {
    p5.beginShape();
    let ang = p5.TAU / nbSide;
    for (let i = nbSide; i--;)
        p5.vertex(p5.cos(i * ang) * width, p5.sin(i * ang) * height);
    p5.endShape(p5.CLOSE);
}

function polygons(): void {
    p5.strokeWeight(p5.constrain(shapeSize / 2, 2, 5));
    for (let i = nbShape; i--;) {
        p5.rotate(p5.QUARTER_PI * (i + time / 10));
        polygon(i * shapeSize, i * shapeSize);
    }
}

function draw(): void {
    p5.background("black");
    p5.fill(fill);
    p5.stroke(stroke);
    p5.translate(hw, hh);
    polygons();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.rectMode(p5.CENTER);
    stroke = p5.color(sColor);
    fill = p5.color(fColor);
    setLoopTime(40);
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
                    menu("Number Polygon", nbShape, 0, 500, 1, value => nbShape = value),
                    menu("Number Side", nbSide, 2, 20, 1, value => nbSide = value),
                    menu("Polygon Size", shapeSize, 2, 40, .01, value => shapeSize = value),
                ],
                "Visual & Color": [
                    color("Stroke", sColor, value => stroke = p5.color(value)),
                    color("Fill", fColor, value => fill = p5.color(value))
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>