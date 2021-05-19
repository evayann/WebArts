<template>
    <P5Vue @setup="this.setupP5" @windowResize="this.resizeP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, button, switchButton, GUIType} from "@/arts/art";
import {range} from "@/arts/util";
// Inspired by https://openprocessing.org/sketch/185737/

let p5: p5Instance;

let offset = 0;
let stroke = false;
let maxRec = 7;
let tolerance = 2;
let precision = 5;

let img: P5.Image = null;
let drawer: Drawer;

type Drawer = (p: p5Instance, x: number, y: number, w: number, h: number, color: P5.Color, depth: number) => void;
interface ToDraw {
    x: number,
    y: number,
    w: number,
    h: number,
    color: P5.Color,
    depth: number
}
const sizeOf = (td: ToDraw) => td.w * td.h;

let toDraws: Array<ToDraw>;

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
    const m: [number, number, number] = meanOn(x - offset, y - offset, w, h);
    const hw = Math.ceil(w / 2);
    const hh = Math.ceil(h / 2);
    if (maxRec > currRec && variationOn(x - offset, y - offset, w, h, m) > tolerance) {
        quadtree(x, y, hw, hh, currRec + 1);
        quadtree(x + hw, y, hw, hh, currRec + 1);
        quadtree(x, y + hh, hw, hh, currRec + 1);
        quadtree(x + hw, y + hh, hw, hh, currRec + 1);
    }
    else
        toDraws.push({x:x + hw, y:y + hh, w, h, color: p5.color(...m), depth: currRec} as ToDraw);
}

function toDraw(p: p5Instance, x: number, y: number, w: number, h: number, color: P5.Color): void {
    p.fill(color);
    p.rect(x, y, w, h);
}

function draw(image: P5.Image): void {
    if (image == null) return;
    img = image;
    p5.background(...meanOn(0, 0, width, height));
    stroke ? p5.stroke("black") : p5.noStroke();
    img.loadPixels();
    quadtree(offset, offset, width - 2 * offset, height - 2 * offset, 0);
    toDraws.sort((td1: ToDraw, td2: ToDraw): number => {
        const s1: number = sizeOf(td1), s2: number = sizeOf(td2);
        if (s1 > s2) return -1;
        else if (s2 < s1) return 1;
        else return 0;
    });
    toDraws.forEach(td => drawer(p5, td.x, td.y, td.w, td.h, td.color, td.depth));
    p5.image(img, 0, height * .85, width * .15, height * .15);
    p5.noLoop();
}

function reset(): void {
    p5.clear();
    toDraws = [];
    p5.textSize(25);
    p5.text("Generate Image", centerX - 60, centerY);
    p5.loadImage(`https://picsum.photos/${width - 2 * offset}/${height - 2 * offset}`, image => draw(image));
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.rectMode(p5.CENTER);
    reset();
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5(p);
        this.setDrawer(toDraw);
    }

    resizeP5(): void {
        reset();
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Precision", 22 - precision, 1, 20, 1, value => precision = 22 - value),
                    menu("Max Rec", maxRec, 2, 15, 1, value => maxRec = value),
                    menu("Tolerance", tolerance, 1, 20, 1, value => tolerance = value),
                    menu("Offset", offset, 0, 150, 1, value => offset = value),
                    switchButton("Stroke", "No Stroke", () => stroke = !stroke)
                ],
                "Misc": [button("Update", () => reset())]
            }
        });
    }

    setDrawer(draw: Drawer): void {
        drawer = draw;
    }
}
</script>