<template>
    <P5Vue :canvas3D="true" @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {halfWidth as hw, halfHeight as hh, p5Instance} from "@/components/P5.vue";
import {ArtVue, setLoopTime, time, menu, switchButton, GUIType} from "@/arts/art";

let p5: p5Instance;

let rotate = false;
let sphere = true;
let twist = false;
let center = false;

let speedFactor = 1;
let rectSize = 50;
let nbPart = 250;
let seed = 0;

/**
 * Return size, theta
 */
function getData(): [number, number] {
    return [
      p5.random(.5, 1), // Size
      p5.random(p5.TAU) // Theta
    ];
}

function draw(): void {
    p5.clear();
    p5.randomSeed(seed);
    for (let i = nbPart; i--;) {
        const [size, theta] = getData();
        const alpha = (i / nbPart) * p5.TAU + time * speedFactor;
        const sz = p5.map(p5.sin(p5.TAU + time * speedFactor), -1, 1, size * .1, size * .9);

        p5.push();

        if (sphere) p5.translate(0, (center ? 0 : -hh) + hh * p5.cos(alpha), hw * p5.sin(alpha));

        if (twist) p5.rotateY(time);
        p5.rotateX(alpha);
        p5.rotateZ(theta);
        p5.rotateX(p5.HALF_PI);
        if (rotate) p5.rotateY(time);
        p5.translate(0, 0,  hw / 2.5);

        p5.fill(22);
        p5.stroke(255);
        p5.rect(0, 0, rectSize * sz, rectSize * sz);

        p5.translate(0, 0, 5);

        p5.fill(130, 28, 50);
        p5.stroke(0);
        p5.rect(0, 0, rectSize * size, rectSize * size);

        p5.pop();
    }
}

function reset(): void {
    seed = p5.random(10000);
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.rectMode(p5.CENTER);
    setLoopTime(p5.TAU / speedFactor);
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
                    menu("Speed", speedFactor, .1, 3, .1, value => {
                        speedFactor = value; setLoopTime(p5.TAU / speedFactor);
                    }),
                    menu("Size", rectSize, 10, 200, .1, value => rectSize = value),
                    menu("Nb particule", nbPart, 100, 1000, 1, value => nbPart = value),
                    switchButton("Sphere", "Donut", () => sphere = !sphere),
                    switchButton("Rotate", "No rotate", () => rotate = !rotate),
                    switchButton("Twist", "No twist", () => twist = !twist),
                    switchButton("Center", "Not center", () => center = !center)
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>