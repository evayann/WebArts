<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, halfWidth as centerX, halfHeight as centerY, P5} from "@/components/P5.vue";
import {ArtVue, time, setLoopTime, menu, color, GUIType} from "@/arts/art";
import {BoxGrid, BoxDrawable, range} from "@/arts/util";
import {easeOutCubic} from "@/arts/easecurve";

let p5: p5Instance;
let mnb = 3;
let alpha = 255;
let stroke = 8;
let nbArrow = 6;
let nbElements = 5;
let sColor = "#b2ecec";
let strokeColor: P5.Color;
let hexagonManager: HexagonManager;

const pos = (offset: number, nb: number, size: number): [number, number] =>
        [p5.cos(offset + nb * p5.PI / mnb) * (size * nb),
            p5.sin(offset + nb * p5.PI / mnb) * (size * nb)];

function lineCompute(cp: [number, number], offset: number, nb:number, size: number): [number, number] {
    const p: [number, number] = pos(offset, nb, size);
    p5.line(...cp, ...p);
    return p;
}

class LineHexagon implements BoxDrawable {
    renderInBox(tlx: number, tly: number, size: number): void {
        p5.push();
        p5.translate(tlx - (tlx / size) * (size / 8), tly - size / 2);
        p5.rotate(p5.HALF_PI + easeOutCubic(time / 2 % 1) * p5.PI);
        const smnb: number = size / mnb;
        for (let i = 0; i < p5.TAU; i += p5.TAU / nbArrow) {
            let cp: [number, number] = pos(i, mnb, 0);
            cp = lineCompute(cp, i, 0, smnb)
            for (let j = 1; j <= mnb; j++)
                cp = lineCompute(cp, i, j, smnb);
        }
        p5.pop();
    }
}

class HexagonManager extends BoxGrid {
    addDrawables(): void {
        range(this.nbElements * this.nbElements).forEach(() => this.effects.push(new LineHexagon()));
    }
}

function draw(): void {
    p5.noStroke();
    p5.fill(0, alpha);
    p5.rect(0, 0, width, height);
    p5.translate(centerX, centerY);
    p5.stroke(strokeColor);
    p5.strokeWeight(stroke);
    hexagonManager.render();
}

function reset(): void {
    hexagonManager.reset(nbElements, 1, true);
}

function setupP5(p: p5Instance): void {
    p5 = p;
    strokeColor = p5.color(sColor);
    hexagonManager = new HexagonManager();
    setLoopTime(2);
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
                    menu("Grid Size", nbElements, 2, 10, 1, value => { nbElements = value; reset(); }),
                    menu("Number size", mnb, 2, 10, 1, value => mnb = value),
                ],
                "Visual & Color": [
                    menu("Alpha", alpha, 0, 255, 1, value => alpha = value),
                    menu("Stroke size", stroke, 2, 15, .1, value => stroke = value),
                    color("Stroke", sColor, value => strokeColor = p5.color(value))
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
