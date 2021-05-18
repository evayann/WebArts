<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, P5, p5Instance} from "@/components/P5.vue";
import {ArtVue, GUIType, menu, text, color, switchButton} from "@/arts/art";

const fps = 30;
let nbColumn = 120;
let nbRow = 85;
let xOffset = 0.1;
let yOffset = 0.1;
const contrast = 1.15;

const bColor = "#000000";
let backgroundColor: P5.Color;
let invertColor: P5.Color;
let useColor = true;
let useText = true;
let characters = " |$@#!%"; // :*=+-.
let caracs: string[] = characters.split("");
let drawer = null;

let camLoad = false;
let cam = null;
let xSize: number, ySize: number;
const parsePos = (x, y) => (y * cam.width + x) * 4;

function meanOn(xStart: number, yStart: number,): number[] {
    let r = 0, g = 0, b = 0;
    let counter = 0;
    for (let x = xStart; x < xStart + xSize; x++) {
        for (let y = yStart; y < yStart + ySize && y < cam.height; y++) {
            const p = parsePos(x, y);
            r += cam.pixels[p] * contrast;
            g += cam.pixels[p + 1] * contrast;
            b += cam.pixels[p + 2] * contrast;
            counter++;
        }
    }
    return [r / counter, g / counter, b / counter];
}

function setDrawer(p: p5Instance) {
    if (useText)
        if (!useColor)
            drawer = (colors) => {
                p.fill(invertColor);
                const val = colors.reduce((sum, curr) => sum + curr, 0);
                p.text(caracs[Math.floor(p.map(val / 3, 0, 255, 0, caracs.length - 1))], 0, 0);
            };
        else
            drawer = (colors) => {
                p.fill(p.color(colors));
                const val = colors.reduce((sum, curr) => sum + curr, 0);
                p.text(caracs[Math.floor(p.map(val / 3, 0, 255, 0, caracs.length - 1))], 0, 0);
            };
    else
        drawer = (colors) => {
            p.fill(p.color(colors));
            p.ellipse(0, 0, xSize - xOffset * xSize, ySize - yOffset * ySize);
        }
}

function drawP5(p: p5Instance): void {
    if (!camLoad)
        return;

    p.clear();
    p.background(backgroundColor);
    cam.loadPixels();
    p.scale(p.width / cam.width, p.height / cam.height);
    p.translate(xSize / 2, ySize / 2);
    for (let x = 0; x < cam.width; x += xSize) {
        let y: number;
        for (y = 0; y < cam.height; y += ySize) {
            drawer(meanOn(x, y));
            p.translate(0, ySize);
        }
        p.translate(xSize, -y);
    }
}

function resetParams(p5: p5Instance): void {
    xSize = Math.floor(cam.width / nbColumn);
    ySize = Math.floor(cam.height / nbRow);
    caracs = characters.split("");
    setDrawer(p5);
}

function reset(p: p5Instance): void {
    cam = p.createCapture(p.VIDEO, () => {
        camLoad = true;
        console.log("Cam loaded !");
    });
    cam.size(1920, 1080);
    cam.hide();
    resetParams(p);
}

function setupP5(p: p5Instance): void {
    backgroundColor = p.color(bColor);
    invertColor = p.color(255 - p.red(backgroundColor),
        255 - p.green(backgroundColor), 255 - p.blue(backgroundColor));
    p.frameRate(fps);
    p.noStroke();
    reset(p);
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5(p);
    }

    drawP5(p: p5Instance): void {
        super.drawP5(p);
        drawP5(p);
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Number Row", nbRow, 10, width / 8, 1, (value) => { nbRow = value; resetParams(this.p5); }),
                    menu("Number Column", nbColumn, 10, height / 8, 1, (value) => { nbColumn = value; resetParams(this.p5); }),
                    menu("xOffset", xOffset, 0, 1, .01, (value) => xOffset = value),
                    menu("yOffset", yOffset, 0, 1, .01, (value) => yOffset = value),
                    switchButton("Use Text", "Use Circle", (value) => { useText = value; resetParams(this.p5); }),
                    text("Characters", characters, (value) => { characters = value; resetParams(this.p5); })
                ],
                "Visual & Color": [
                    switchButton("Color", "Black & White", (value) => { useColor = value; resetParams(this.p5); }),
                    color("backgroundColor", bColor, (value) => {
                            backgroundColor = this.p5.color(value);
                            invertColor = this.p5.color(255 - this.p5.red(backgroundColor),
                                255 - this.p5.green(backgroundColor), 255 - this.p5.blue(backgroundColor));
                        }
                    ),
                ],
                "Misc" : [
                    switchButton("pause", "play", value => {
                        if (value) { cam.stop(); camLoad = false; }
                        else { reset(this.p5) }
                    }),
                    switchButton("camOn", "noCam", value => {
                        if (value) { this.p5.noLoop(); if (camLoad) cam.pause(); }
                        else { this.p5.loop(); if (camLoad) cam.play(); }
                    })
                ]
            }
        });
    }
}
</script>
