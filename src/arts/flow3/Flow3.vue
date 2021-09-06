<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth as hw, halfHeight as hh, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, setLoopTime, time, menu, GUIType, color} from "@/arts/art";
// Implement from https://twitter.com/ippsketch/status/1432716443389411340

let p5: p5Instance;
let speedFactor = 1.6;
let prctRadius = .75;
let sizeFactor = .65;
let density = 5000;
let cColor = "#e5e0ac";
let circleColor: P5.Color;

const C: (number) => number = Math.cos;
const S: (number) => number = Math.sin;

function draw(): void {
    p5.translate(hw, hh);
    p5.background("black");
    p5.fill(circleColor);
    let s = p5.min(hw, hh);
    for(let i = 0; i < density; i++) {
        let m = 2 * ((i + density * (time * (speedFactor / 10))) % density) / density - 1;
        let r = (s * prctRadius) * p5.sqrt(1 - m * m);
        let n = 2 * p5.TAU * p5.noise(i);
        p5.circle(r * C(n),r * S(n),
            n * sizeFactor * S(p5.PI * p5.map(1 - (m + 1) / 2,.5,1,0,1)));
    }
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.noStroke();
    circleColor = p5.color(cColor);
    loop();
}

function loop(): void {
    setLoopTime(10 / speedFactor);
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
                    menu("Speed", speedFactor, .1, 5, .1, value => {
                        speedFactor = value;
                        loop();
                    }),
                    menu("Size", sizeFactor, .2, 3, .1, value => sizeFactor = value),
                    menu("Radius Percent", prctRadius, .4, 1, .01, value => prctRadius = value),
                    menu("Density", density, 500, 5000, 10, value => density = value),
                ],
                "Visual & Color": [
                    color("Fill", cColor, value => circleColor = p5.color(value))
                ],
                "Misc": [this.pause()]
            }
        });
    }
}
</script>