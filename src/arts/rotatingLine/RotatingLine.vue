<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth as centerX, halfHeight as centerY, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, time, setLoopTime, resetTime, menu, color, GUIType} from "@/arts/art";

let p5: p5Instance;
let speed = 1;
let nbSegment = 16;
let strokeSize = 3;
let ptSize = 0;

const sColor = "#bb5151";
let strokeColor: P5.Color;

function draw(): void {
    p5.clear();
    p5.background("black");
    p5.translate(centerX, centerY);
    p5.stroke(strokeColor);
    p5.strokeWeight(strokeSize);
    const size = (Math.min(centerX, centerY) - 20);
    p5.circle(0, 0, 2 * size);
    let [px, py]: [number, number] = [0, 0];
    for (let i = 0; i <= size; i += size / nbSegment) {
        const factor: number = (2 + speed) * time * (1 + p5.dist(0, 0, px, py) / size);
        const [x, y] = [p5.cos(factor) * i, p5.sin(factor) * i];
        p5.line(px, py, x, y);
        p5.circle(px, py, ptSize);
        [px, py] = [x, y];
    }
    p5.circle(px, py, ptSize);
}

function loop(): void {
    setLoopTime(58 / speed);
}

function reset(): void {
    resetTime();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    strokeColor = p5.color(sColor);
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
                    menu("Speed", speed, .1, 5, .1, value => { speed = value; loop(); }),
                    menu("Number Segment", nbSegment, 1, 50, 1, value => nbSegment = value)
                ],
                "Visual & Color": [
                    menu("Point Size", ptSize, 0, 6, .1, value => ptSize = value),
                    color("Stroke", sColor, value => strokeColor = p5.color(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
