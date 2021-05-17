<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5"></P5Vue>
</template>

<script lang="ts">
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, seed, menu, color, switchButton, GUIType} from "@/arts/art";
import {Particle, Particles} from "@/arts/particles";

let p5: p5Instance;
let useColor = true;
const bColor = "#21304d";
const fColor = "#adf8e8";
const tColor = "#58c823";
let backgroundColor: P5.Color;
let fromColor: P5.Color;
let toColor: P5.Color;

let crossing = true;

let nbPts = 50;
let distToDraw = 250;
let strokeSize = 3;

let speedFactor = 1;

let pm: PointManager;

class PointManager extends Particles {
    private readonly lines: Array<Line>;

    constructor() {
        super();
        this.lines = new Array<Line>();
        for (let i = 0; i < nbPts; i++)
            this.addParticle(new Point(p5.random(width), p5.random(height)));
        this.run();
    }

    update(deltaTime: number): void {
        this.lines.length = 0; // Clear previous element

        // Move point
        super.update(deltaTime);

        // Make lines
        this.getParticles().forEach(p1 => {
            this.getParticles().forEach(p2 => {
                const pos1: P5.Vector = p1.getPos(), pos2: P5.Vector = p2.getPos();
                const distance: number = p5.dist(pos1.x, pos1.y, pos2.x, pos2.y);
                if (distance < distToDraw) {
                    const newLine: Line = new Line(pos1, pos2, (distance / distToDraw) * strokeSize, 1 - distance / distToDraw);

                    if (crossing) {
                        this.lines.push(newLine);
                    } else {
                        // Test if make intersection
                        let intersect = false;
                        for (let i = 0; i < this.lines.length; i++) {
                            if (newLine.intersection(this.lines[i])) {
                                intersect = true;
                                break;
                            }
                        }

                        if (!intersect)
                            this.lines.push(newLine);
                    }
                }
            });
        });
    }

    draw(): void {
        this.lines.forEach(l => l.draw());
    }
}

class Point extends Particle {
    constructor(x: number, y: number) {
        super(Particle.INFINITY);
        this.pos = p5.createVector(x, y);
        this.acc = p5.createVector();
        this.vel = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
    }

    update(deltaTime: number) {
        this.acc.set(2, 2);

        if (this.pos.x < 0 || this.pos.x > width)
            this.vel.x *= -1;
        if (this.pos.y < 0 || this.pos.y > height)
            this.vel.y *= -1;

        this.acc.setMag(20);
        this.acc.x *= this.vel.x;
        this.acc.y *= this.vel.y;
        this.pos.add(P5.Vector.mult(this.acc, deltaTime));
        super.update(deltaTime);
    }
}

function orientation(p: P5.Vector, q: P5.Vector, r: P5.Vector) {
    const val: number = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val == 0.0)
        return 0; // colinear
    return (val > 0) ? 1 : 2; // clock or counterclock wise
}

function transparentCompute(x: number): number {
    return 10 * p5.pow(x, 3);
}

class Line {
    private start: P5.Vector;
    private end: P5.Vector;
    private readonly size: number;
    private readonly alphaPercent: number;

    constructor(start: P5.Vector, end: P5.Vector, size: number, alphaPercent: number) {
        this.start = start;
        this.end = end;
        this.size = size;
        this.alphaPercent = alphaPercent;
    }

    static reduceLine(l: Line, percent: number): Line {
        const length: P5.Vector = p5.createVector(l.end.x - l.start.x, l.end.y - l.start.y);
        return new Line(P5.Vector.add(l.start, (P5.Vector.mult(length, percent))),
            P5.Vector.sub(l.end, (P5.Vector.mult(length, percent))), l.size, l.alphaPercent);
    }

    public draw(): void {
        p5.strokeWeight(this.size);
        const lineColor: P5.Color = (useColor) ? p5.lerpColor(fromColor, toColor, this.start.y / height) : p5.color("#a59d9d");
        lineColor.setAlpha(transparentCompute(this.alphaPercent) * 255);
        p5.stroke(lineColor);
        p5.line(this.start.x, this.start.y, this.end.x, this.end.y);
    }

    intersection(l: Line): boolean {
        // Don't take the extremity of each segment
        const l1: Line = Line.reduceLine(this, 0.01);
        const l2: Line = Line.reduceLine(l, 0.01);

        return orientation(l1.start, l1.end, l2.start) != orientation(l1.start, l1.end, l2.end)
            && orientation(l2.start, l2.end, l1.start) != orientation(l2.start, l2.end, l1.end);
    }
}

function draw(p: p5Instance): void {
    p.clear();
    p.randomSeed(seed);
    p.background(backgroundColor);

    pm.update(speedFactor * 0.2);
    pm.draw();
}

function reset(): void {
    pm = new PointManager();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    backgroundColor = p5.color(bColor);
    fromColor = p5.color(fColor);
    toColor = p5.color(tColor);
    reset();
    draw(p);
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5(p);
    }

    drawP5(p: p5Instance): void {
        super.drawP5(p);
        draw(p);
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Speed", speedFactor, .1, 5, .1, value => speedFactor = value),
                    menu("Number Points", nbPts, 25, 300, 1, value => { nbPts = value; reset(); }),
                    menu("Stroke Size", strokeSize, .1, 5, .1, value => strokeSize = value),
                    menu("Distance to Draw", distToDraw, 0, 500, 1, value => distToDraw = value),
                    switchButton("Intersect", "Crossing", () => crossing = !crossing),
                ],
                "Visual & Color" : [
                    switchButton("Use Color", "White", value => useColor = value),
                    color("From", fColor, value => fromColor = this.p5.color(value)),
                    color("To", tColor, value => toColor = this.p5.color(value)),
                    color("Background", bColor, value => backgroundColor = this.p5.color(value)),
                ],
                "Misc": [this.pause(), this.seed(), this.reset(reset)]
            }
        });
    }
}
</script>