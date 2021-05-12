<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5" @windowresized="this.resizeP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, time, resetTime, menu, color, GUIType} from "@/arts/util";
// Inspired by https://www.reddit.com/r/loadingicon/comments/mwalqy/straight_line_echoes_inside_deltoid_gif_loop_by/?utm_source=share&utm_medium=ios_app&utm_name=iossmf

let p5: p5Instance;
let nbSegment = 4;
let nbLines = 3;
let speed = 1;
let strokeSize = 3;

let vertices: Array<[number, number]>;
let size: number;

const bColor = "#bb5151";
let bgColor: P5.Color;
const lColor = "#8651bb";
let lineColor: P5.Color;
const cColor = "#51bba6";
let circleColor: P5.Color;
const hColor = "#8abb51";
let hypoColor: P5.Color;

const C = Math.cos;
const S = Math.sin;

function hypocycloid(k: number, R: number, theta: number): [number, number] {
    const r: number = R / k;
    return [r * (k - 1) * C(theta) + r * C((k - 1) * theta), r * (k - 1) * S(theta) - r * S((k - 1) * theta)]
}

function computeHypercycloid(size: number): Array<[number, number]> {
    const vertices = [];
    for (let i = 0; i < p5.TAU; i += p5.QUARTER_PI / 32)
        vertices.push(hypocycloid(nbSegment, size, i));
    return vertices;
}

function drawHypercycloid(): void {
    p5.stroke("black");
    p5.fill(hypoColor);
    p5.beginShape();
    for (let [x, y] of vertices)
        p5.curveVertex(x, y);
    p5.endShape();
}

function drawLine(): void {
    p5.stroke(lineColor);
    p5.strokeWeight(strokeSize);
    const t: number = ~~(time * 20 * speed);
    const from: number = t % vertices.length;
    const to: number = (t + ~~(vertices.length / 2)) % vertices.length;
    for (let i = nbLines; i--;)
        p5.line(...vertices[(from + i) % vertices.length], ...vertices[(to + i) % vertices.length]);
}

function draw(): void {
    p5.translate(centerX, centerY);
    p5.background(bgColor);
    p5.stroke("black");
    p5.fill(circleColor);
    p5.strokeWeight(strokeSize);
    p5.circle(0, 0, size);
    drawHypercycloid();
    drawLine();
}

function resize(): void {
    size = (Math.min(width, height) - 40);
    vertices = computeHypercycloid(size / 2);
}

function reset(): void {
    resize();
    resetTime();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.rectMode(p5.CENTER);
    bgColor = p5.color(bColor);
    lineColor = p5.color(lColor);
    hypoColor = p5.color(hColor);
    circleColor = p5.color(cColor);
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
        resize();
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Speed", speed, .1, 5, .1, value => speed = value),
                    menu("Number Segment", nbSegment, 3, 10, 1, value => { nbSegment = value; reset(); }),
                    menu("Number Lines", nbLines, 0, 50, 1, value => nbLines = value)
                ],
                "Visual & Color": [
                    color("Background", bColor, value => bgColor = p5.color(value)),
                    menu("Stroke Size", strokeSize, .1, 6, .1, value => strokeSize = value),
                    color("Line", lColor, value => lineColor = p5.color(value)),
                    color("Circle", cColor, value => circleColor = p5.color(value)),
                    color("Hypocycloid", hColor, value => hypoColor = p5.color(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
