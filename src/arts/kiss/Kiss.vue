<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, halfWidth as centerX, halfHeight as centerY, p5Instance} from "@/components/P5.vue";
import {ArtVue, time, setLoopTime, GUIType} from "@/arts/art";

let p5: p5Instance;

let size: number;

const wave = (x: number) => 1 - p5.pow((p5.cos(x * p5.TAU) + 1) / 2, 2);
const radius = (percent: number) => percent * size / 6 + size / 32;
const circlePos = (percent: number) => {
    const rad = p5.map(percent, 0, 1, 0, p5.TAU);
    return [Math.cos(rad) * size / 4, Math.sin(rad) * size / 4];
};

function kiss(percent: number, cx: number, cy: number): void {
    p5.fill(340 + percent * 30, 250, 150 + percent * 115);
    p5.circle(cx, cy, 2 * radius(percent));
    p5.fill(320 + percent * 50, 250, 150 + percent * 115);
    p5.circle(cx, -cy, 2 * radius(percent));
}

function draw(): void {
    let percent: number = wave(time / 10);
    size = Math.min(width, height) - 50;
    p5.translate(centerX, centerY);

    const [cx, cy] = circlePos(percent);
    percent = 1 - p5.abs(((percent * 2) % 1) - .5) * 2;
    kiss(percent, cx, cy);
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.colorMode(p5.HSB);
    p5.noStroke();
    setLoopTime(10);
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
                "Misc": [this.pause()]
            }
        });
    }
}
</script>