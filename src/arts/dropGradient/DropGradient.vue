<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5" @windowresized="this.resizeP5"></P5Vue>
</template>

<script lang="ts">
import {height, halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, setLoopTime, resetTime, time, menu, color, GUIType} from "@/arts/util";

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
let limit: number = height / 3;

function drawShape(): void {
    p5.push();
    p5.translate(0, -centerY + limit + yCurrent);
    p5.beginShape();
    for (let i = 0; i > -p5.TAB; i -= angle) {
        const x: number = centerX + p5.cos(i) * p5.min(400, centerX * .75);
        const y: number = centerY + p5.sin(i) * (centerY - tilt);
        p5.vertex(x, y);
    }
    p5.endShape();
    p5.pop();
}

function draw(): void {
    p5.background("black");
    p5.strokeWeight(2);
    p5.noFill()
    limit = height / 3;
    yCurrent = limit;
    while (yCurrent > 0) {
        const offsetTime: number = (time / cycle) % 1;
        p5.stroke(p5.lerpColor(strokeFromColor, strokeToColor, (yCurrent / limit + offsetTime) % 1));
        drawShape();
        yCurrent--;
    }
}

function reset(): void {
    p5.clear();
    angle = p5.TAU / nbSegment;
    resetTime();
    setLoopTime(cycle);
    draw();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    strokeFromColor = p5.color(sfColor);
    strokeToColor = p5.color(stColor);
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

    resizeP5(): void {
        reset();
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Cycle", cycle, .5, 5, .1, value => cycle = value),
                    menu("Number Segment", nbSegment, 3, 50, 1, value => { nbSegment = value; reset(); }),
                    menu("Tilt", tilt, 200, 400, 1, value => { tilt = value; reset(); }),
                ],
                "Visual & Color": [
                    color("From", sfColor, value => strokeFromColor = this.p5.color(value)),
                    color("To", stColor, value => strokeToColor = this.p5.color(value)),
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>