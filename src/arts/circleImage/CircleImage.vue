<template>
    <P5Vue @setup="this.setupP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, button, color, GUIType} from "@/arts/util";

let p5: p5Instance;
let contrast = 1;
const lColor = "#1e2830";
let lineColor: P5.Color;

let img: P5.Image = null;
let nbCircle = 120;
let nbIterByCircle = 100;
let strokeWeight = 3;
const imgFactor = 4;

function iterOn(i: P5.Image): number[] {
    let r = 0, g = 0, b = 0;
    let counter = 0;
    i.loadPixels();
    for (let x = 0; x < i.width; x++) {
        for (let y = 0; y < i.height; y++) {
            const p = (y * i.width + x) * 4;
            r += i.pixels[p] * contrast;
            g += i.pixels[p + 1] * contrast;
            b += i.pixels[p + 2] * contrast;
            counter++;
        }
    }
    return [r / counter, g / counter, b / counter];
}

function getSize(x: number, y: number): number {
    const colors: number[] = iterOn(img.get(Math.floor(x / imgFactor), Math.floor(y / imgFactor), 10, 10));
    return (.3 * colors[0] + .59 * colors[1] + .11 * colors[2]) / 255;
}

function draw(image: P5.Image): void {
    if (image == null) return;
    img = image
    p5.clear();
    p5.background("black");
    p5.image(img, 0, height * .85, width * .15, height * .15);
    p5.filter(p5.GRAY);
    p5.stroke(lineColor);
    p5.fill(lineColor);
    img.loadPixels();
    let prev: number[] = [width / 2, height / 2];
    const nbIter: number = nbCircle * nbIterByCircle;
    for (let i = 0; i < nbIter; i++) {
        const curr: number[] = [
            width / 2 + p5.cos(p5.TAU * (i / nbIterByCircle)) * (i / nbIter) * (width / 2),
            height / 2 + p5.sin(p5.TAU * (i / nbIterByCircle)) * (i / nbIter) * (height / 2)
        ];
        p5.strokeWeight(getSize(curr[0], curr[1]) * strokeWeight);
        p5.line(prev[0], prev[1], curr[0], curr[1]);
        prev = curr;
    }
    p5.noLoop();
}

function reset(): void {
    p5.clear();
    p5.background("black");
    p5.fill("white");
    p5.stroke("white");
    p5.text("Load image", width / 2 - 20, height / 2);
    p5.loadImage(`https://picsum.photos/${Math.floor(width / imgFactor)}/${Math.floor(height / imgFactor)}`,
        image => {
            draw(image)
        }
    );
}

function setupP5(p: p5Instance): void {
    p5 = p;
    lineColor = p5.color(lColor);
    p5.noStroke();
    reset();
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5(p);
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Contrast", contrast, 0, 2, .01, value => contrast = value),
                    menu("Number Circle", nbCircle, 50, 250, 1, value => nbCircle = value),
                    menu("Circle Precision", nbIterByCircle, 50, 500, 1, value => nbIterByCircle = value),
                ],
                "Visual & Color": [
                    color("Line", lineColor, value => lineColor = value),
                    menu("Stroke Size", strokeWeight, 1, 5, .01, value => strokeWeight = value),
                ],
                "Misc": [
                    button("update", () => draw(img))
                ]
            }
        });
    }
}
</script>