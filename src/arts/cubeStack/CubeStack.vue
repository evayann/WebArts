<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5" @windowresized="this.resizeP5"></P5Vue>
</template>

<script lang="ts">
import {width as w, height as h, halfWidth as hw, halfHeight as hh, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, menu, color, GUIType, switchButton} from "@/arts/art";

let p5: p5Instance;
const bColor = "#083de6";
let bgColor: P5.Color;
let opColor

let sideLength = 30;
let nbCube = 100;
let widthOffset = 0;
let heightOffset = 0.2;
let cubeManager: CubeManager;
let generationMethod = true;

class Cube {
    private ctr: P5.Vector;
    readonly xG: number;
    readonly yG: number;
    readonly zG: number;
    private pts: Array<P5.Vector>;

    constructor(xG: number, yG: number, zG: number) {
        this.xG = xG;
        this.yG = yG;
        this.zG = zG;
        this.compute();
    }

    compute(): void {
        this.ctr = p5.createVector(
            hw + (this.xG - this.yG) * sideLength * p5.sqrt(3) / 2,
            hh + (this.xG + this.yG) * sideLength / 2 - (sideLength * this.zG));

        this.pts = [];
        for (let angle = p5.PI / 6; angle < p5.TAU; angle += p5.PI / 3) {
            this.pts.push(
                p5.createVector(this.ctr.x + p5.cos(angle) * sideLength,
                    this.ctr.y + p5.sin(angle) * sideLength));
        }
    }

    draw(): void {
        p5.fill(bgColor);
        p5.quad(this.ctr.x, this.ctr.y,
            this.pts[5].x, this.pts[5].y,
            this.pts[0].x, this.pts[0].y,
            this.pts[1].x, this.pts[1].y);

        p5.quad(this.ctr.x, this.ctr.y,
            this.pts[1].x, this.pts[1].y,
            this.pts[2].x, this.pts[2].y,
            this.pts[3].x, this.pts[3].y);

        p5.fill(opColor);
        p5.quad(this.ctr.x, this.ctr.y,
            this.pts[3].x, this.pts[3].y,
            this.pts[4].x, this.pts[4].y,
            this.pts[5].x, this.pts[5].y);
    }

    getPos(): string {
        return this.zG + '.' + this.yG + '.' + this.xG;
    }
}

class CubeManager {
    private cubes: Array<Cube>;
    private readonly cubeAt;

    constructor(nbC: number) {
        this.cubeAt = (x, y, z) =>
            this.cubes.some((cube) => cube.xG == x && cube.yG == y && cube.zG == z);
        this.generateCube(nbC);
    }

    recomputeCubes(): void {
        for (const c of this.cubes)
            c.compute();
    }

    generateCube(nbC: number): void {
        this.cubes = [new Cube(0, 0, 0)];
        for (let i = nbC; i--;) {
            this.addCube();
        }
        this.cubes.sort((a, b) => a.getPos().localeCompare(b.getPos()));
    }

    addCube(): void {
        let counter = 0;
        while (counter < 20000) {
            const rdmC: Cube = p5.random(this.cubes);

            let nX, nY, nZ;
            if (generationMethod)
                [nX, nY, nZ] = this.genLikeStack(rdmC.xG, rdmC.yG, rdmC.zG);
            else
                [nX, nY, nZ] = this.genLikeBloc(rdmC.xG, rdmC.yG, rdmC.zG);

            if (!this.cubeAt(nX, nY, nZ)) {
                this.cubes.push(new Cube(nX, nY, nZ));
                return;
            }
            counter++;
        }
    }


    genLikeBloc(xC: number, yC: number, zC: number): Array<number> {
        const rdmV = p5.random();
        if (rdmV < .3) xC++; else if (rdmV < .6) yC++; else zC++;
        return [xC, yC, zC];
    }

    genLikeStack(xC: number, yC: number, zC: number): Array<number> {
        const rdmV = p5.random();
        if (rdmV < .15) {
            xC++;
            yC--;
        } else if (rdmV < .3) {
            yC++;
            xC--;
        } else zC++;
        return [xC, yC, zC];
    }

    draw(): void {
        p5.background("black");
        p5.stroke("white");
        p5.translate(widthOffset * w, heightOffset * h);
        for (const c of this.cubes)
            c.draw();
    }
}

function draw(): void {
    cubeManager.draw();
}

function reset(): void {
    cubeManager.generateCube(nbCube);
}

function computeColor(value): void {
    bgColor = p5.color(value);
    opColor = p5.color(255 - p5.red(bgColor), 255 - p5.green(bgColor), 255 - p5.blue(bgColor));
}

function setupP5(p: p5Instance): void {
    p5 = p;
    p5.frameRate(60);
    p5.noStroke();
    p5.strokeWeight(2);
    computeColor(bColor)
    cubeManager = new CubeManager(nbCube);
    reset();
}

export default class Art extends ArtVue {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        setupP5(p);
    }

    drawP5(): void {
        draw();
    }

    resizeP5(): void {
        reset();
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Cube length", sideLength, 10, 200, 1, value => {sideLength = value; cubeManager.recomputeCubes(); }),
                    menu("Number Cube", nbCube, 5, 200, 1, value => {nbCube = value; reset(); }),
                    switchButton("Stack", "Block", value => { generationMethod = value; reset(); }),
                ],
                "Visual & Color": [
                    color("Background", bColor, value => computeColor(value)),
                    menu("X Offset", widthOffset, -.5, .5, .01, value => widthOffset = value),
                    menu("Y Offset", heightOffset, -.5, .5, .01, value => heightOffset = value),
                ],
                "Misc": [this.reset(reset)]
            }
        });
    }
}
</script>