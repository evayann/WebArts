<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5" @windowresized="this.resizeP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, color, GUIType} from "@/arts/util";

// Inspired by https://www.reddit.com/r/loadingicon/comments/lem7o7/tube_oc/?utm_source=share&utm_medium=ios_app&utm_name=iossmf

let p5: p5Instance;
const sfColor = "#3166d4";
const stColor = "#173364";
let strokeFromColor: P5.Color;
let strokeToColor: P5.Color;

let cycle = 2;
let angle = 0;
let nbSegment = 4;
let tilt = 315;

let yCurrent = 0;
const limit: number = height / 3;

function drawShape(): void {
    p5.push();
    p5.translate(0, -centerY + limit + yCurrent);
    p5.beginShape();
    for (let i = 0; i > -p5.TAB; i -= angle) {
        const x: number = centerX + p5.cos(i) * 450;
        const y: number = centerY + p5.sin(i) * (tilt);
        p5.vertex(x, y);
    }
    p5.endShape();
    p5.pop();
}

function draw(): void {
    p5.background("black");
    p5.strokeWeight(2);
    yCurrent = limit;
    while (yCurrent > 0) {
        const offsetTime: number = (p5.millis() / (1000 * cycle)) % 1;
        p5.stroke(p5.lerpColor(strokeFromColor, strokeToColor, (yCurrent / limit + offsetTime) % 1));
        p5.noFill();
        drawShape();
        yCurrent--;
    }
}

function reset(): void {
    p5.clear();
    angle = p5.TAU / nbSegment;
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    strokeFromColor = p5.color(sfColor);
    strokeToColor = p5.color(stColor);
    p5.frameRate(60);
    reset();
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5(p);
    }

    drawP5(): void {
        draw();
    }

    resizeP5(): void {
        reset();
    }

    generateUI(): GUIType {
        const params = {
            tilt: tilt,
            cycle: cycle,
            strokeColorFrom: sfColor,
            strokeColorTo: stColor,
            nbSegment: nbSegment,
        };
        return this.setupDatGUI({
            params: params,
            properties: {
                "Effect": [
                    menu("cycle", .5, 5, .1, value => cycle = value),
                    menu("nbSegment", 3, 50, 1, value => { nbSegment = value; reset(); }),
                    menu("tilt", 200, 400, 1, value => { tilt = value; reset(); }),
                ],
                "Visual & Color": [
                    color("strokeColorFrom", value => strokeFromColor = this.p5.color(value)),
                    color("strokeColorTo", value => strokeToColor = this.p5.color(value)),
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>