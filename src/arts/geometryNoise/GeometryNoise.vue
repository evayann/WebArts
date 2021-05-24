<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {p5Instance, halfWidth as hw, halfHeight as hh} from "@/components/P5.vue";
import {ArtVue, menu, GUIType} from "@/arts/art";
import {parseColor, range, randomAveragePixel} from "@/arts/util";

let p5: p5Instance;
let noiseScale = 30;

const colors: Array<string> = parseColor("dd614a-f48668-f4a698-c5c392-73a580-0f7173-4464ad", "-");
let shapes: Array<unknown>;

function generateShape(): void {
    range(50).forEach(() => {
        p5.fill(p5.random(colors));
        p5.push();
        p5.translate(p5.random(-hw, hw),p5.random(-hh, hh));
        p5.rotate(p5.random(-p5.PI, p5.PI));
        const w: number = p5.random(10, 500);
        const h: number = p5.random() < .5 ? w : p5.random(100, 500);
        p5.random(shapes)(w, h);
        p5.pop();
    });
}

function draw(): void {
    p5.translate(hw, hh);
    generateShape();
    randomAveragePixel(p5, noiseScale);
    p5.noLoop();
}

function reset(): void {
    p5.clear();
    p5.background("black");
    p5.loop();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    shapes = [
        (w, h) => p5.ellipse(0, 0, w, h),
        (w, h) => p5.rect(0, 0, w, h, p5.random(360), p5.random(360), p5.random(360), p5.random(360)),
        (w, h) => p5.triangle(-w/2, -h/2, w/2, -h/2, 0, h/2),
        (w, h) => p5.arc(0, 0, w, h, p5.random(p5.TAU), p5.random(p5.TAU), p5.random([p5.CHORD, p5.PIE]))
    ];
    p5.blendMode(p5.EXCLUSION);
    p5.stroke("red");
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
                    menu("Noise Scale", noiseScale, 1, 255, 1, value => { noiseScale = value; reset(); }),
                ],
                "Misc": [this.reset(reset)]
            }
        });
    }
}
</script>
