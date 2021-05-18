<template>
    <P5Vue @setup="this.setupP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, button, switchButton, GUIType} from "@/arts/art";
import {range} from "@/arts/util";
// Inspired by https://openprocessing.org/sketch/185737/

let p5: p5Instance;

let stroke = false;
let maxRec = 7;
let tolerance = 2;
let precision = 5;

let img: P5.Image = null;

const parsePos = (x, y) => (y * img.width + x) * 4;

function meanOn(xStart: number, yStart: number, w: number, h: number): [number, number, number] {
    let rgb: [number, number, number] = [0, 0, 0];
    let counter = 0;
    for (let x = xStart; x < xStart + w; x += precision)
        for (let y = yStart; y < yStart + h && y < img.height; y += precision, counter++)
            range(3).forEach(i => rgb[i] += img.pixels[parsePos(x, y) + i]);
    return [rgb[0] / counter, rgb[1] / counter, rgb[2] / counter];
}

function variationOn(xStart: number, yStart: number, w: number, h: number, mean: [number, number, number]): number {
    const variation: [number, number, number] = [0, 0, 0];
    for (let x = xStart; x < xStart + w; x += precision)
        for (let y = yStart; y < yStart + h && y < img.height; y += precision)
            range(3).forEach(i => variation[i] += p5.sq(img.pixels[parsePos(x, y) + i] - mean[i]));
    range(3).forEach(i => variation[i] = p5.sqrt(variation[i] / (w * h)));
    return p5.dist(0, 0, 0, ...variation);
}

function quadtree(x: number, y: number, w: number, h: number, currRec: number): void {
    const m: [number, number, number] = meanOn(x, y, w, h);
    if (maxRec > currRec && variationOn(x, y, w, h, m) > tolerance) {
        w = ~~(w / 2);
        h = ~~(h / 2);

        quadtree(x, y, w, h, currRec + 1);
        quadtree(x + w, y, w, h, currRec + 1);
        quadtree(x, y + h, w, h, currRec + 1);
        quadtree(x + w, y + h, w, h, currRec + 1);
    }
    else {
        p5.fill(...m);
        p5.rect(x - 5, y - 5, w + 5, h + 5);
    }
}

function draw(image: P5.Image): void {
    if (image == null) return;
    img = image;
    p5.background("black");
    stroke ? p5.stroke("black") : p5.noStroke();
    img.loadPixels();
    quadtree(0, 0, width, height, 0);
    p5.image(img, 0, height * .85, width * .15, height * .15);
    p5.noLoop();
}

function reset(): void {
    p5.clear();
    p5.text("Generate Image", centerX - 20, centerY);
    p5.loadImage(`https://picsum.photos/${width}/${height}`, image => draw(image));
}

function setupP5(p: p5Instance): void {
    p5 = p;
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
                    menu("Precision", 22 - precision, 1, 20, 1, value => precision = 22 - value),
                    menu("Max Rec", maxRec, 3, 15, 1, value => maxRec = value),
                    menu("Tolerance", tolerance, 1, 150, 1, value => tolerance = value),
                    switchButton("Stroke", "No Stroke", () => stroke = !stroke)
                ],
                "Misc": [button("Update", () => reset())]
            }
        });
    }
}
</script>