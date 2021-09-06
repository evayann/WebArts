<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, halfWidth as centerX, halfHeight as centerY, P5} from "@/components/P5.vue";
import {ArtVue, time, setLoopTime, menu, list, GUIType} from "@/arts/art";
import {BoxGrid, BoxDrawable, range} from "@/arts/util";

let p5: p5Instance;
let alpha = 255;
let stroke = 20;
let nbElements = 5;
let sColor = "#b2ecec";
let strokeColor: P5.Color;
let prctRadius = .9;
let speedFactor = .1;
let cm: CompassManager;

type Target = () => [number, number];
const mouse: Target = (): [number, number] => [p5.mouseY - centerY, p5.mouseX - centerX];
const ellipse: Target = (): [number, number] => [
    p5.sin(p5.TAU * time * speedFactor) * (centerY * prctRadius),
    p5.cos(p5.TAU * time * speedFactor) * (centerX * prctRadius)];
const circle: Target = (): [number, number] => {
    const min = p5.min(centerX, centerY) * prctRadius;
    return [p5.sin(p5.TAU * time * speedFactor) * min, p5.cos(p5.TAU * time * speedFactor) * min];
}

const targets: { [id: string]: Target } = {
    mouse: mouse, ellipse: ellipse, circle: circle
};
let target: Target = circle;

class Compass implements BoxDrawable {
    private px = 0;
    private py = 0;
    private velocity: P5.Vector = p5.createVector();

    renderInBox(tlx: number, tly: number, size: number): void {
        p5.push();
        const off = size * .1;
        const ms = size / 2;
        const s2 = ms * 2;
        const [x, y] = [tlx, tly];
        const [ty, tx] = target();
        this.velocity.add(p5.createVector(
            p5.constrain(tx - this.px, -10, 10), p5.constrain(ty - this.py, -10, 10))
        ).mult(.9);
        const nx = tx + this.velocity.x;
        const ny = ty + this.velocity.y;
        [this.px, this.py] = [tx, ty];
        p5.translate(tlx, tly);
        p5.rotate(p5.atan2(ny - y, nx - x));
        p5.scale(p5.constrain(p5.dist(nx, ny, x, y) / p5.min(width / 20, height / 20), .25, 1));
        p5.fill("gray");
        p5.triangle(-off, -ms, -off, ms, -s2, -off);
        p5.fill("red");
        p5.triangle(off, -ms, off, ms, s2, off);

        p5.pop();
    }
}

class CompassManager extends BoxGrid {
    addDrawables(): void {
        range(this.nbElements * this.nbElements).forEach(() => this.effects.push(new Compass()));
    }
}

function draw(): void {
    p5.noStroke();
    p5.fill(0, alpha);
    p5.rect(0, 0, width, height);
    p5.translate(centerX, centerY);
    p5.stroke(strokeColor);
    p5.strokeWeight(stroke / nbElements);
    cm.render();
}

function reset(): void {
    cm = new CompassManager(nbElements, 1, false);
}

function setupP5(p: p5Instance): void {
    p5 = p;
    strokeColor = p5.color(sColor);
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
                    menu("Speed", 1, .1, 3, .1, value => {
                        speedFactor = value / 10;
                        setLoopTime(1 / speedFactor)
                    }),
                    menu("Grid Size", nbElements, 2, 50, 1, value => { nbElements = value; reset(); }),
                    list("Draw Function", "circle", Object.keys(targets), value => target = targets[value]),
                    menu("Percent Radius", prctRadius, .05, 1, .01, value => prctRadius = value)
                ],
                "Visual & Color": [
                    menu("Alpha", alpha, 0, 255, 1, value => alpha = value),
                    menu("Stroke Size", stroke, 0, 30, 1, value => stroke = value)
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>
