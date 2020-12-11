import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number;
let height: number;
let widthGrid: number = 80;
let heightGrid: number = 80;

let p5: P5;
let useColor: boolean = true;
let fColor: string = "#4e7de0";
let tColor: string = "#886400";
let fromColor: P5.Color;
let toColor: P5.Color;

let nbLines: number = 1;
let spaceBetweenLine: number = 2;
let seed: number = 0;

let pm: PointManager;

class PointManager {
    private nbPoints: number;
    private distanceToDraw: number;
    private strokeSize: number;
    private pts: Array<Point>;
    private lines: Array<Line>;

    constructor (nbPts: number, distToDraw: number, ss: number) {
        this.nbPoints = nbPts;
        this.distanceToDraw = distToDraw;
        this.strokeSize = ss;
        this.pts = new Array<Point>();
        this.lines = new Array<Line>();
        for (let i: number = 0; i < this.nbPoints; i++)
            this.pts.push(new Point(p5.random(width), p5.random(height)));
    }

    update(deltaTime: number): void {
        this.lines.length = 0; // Clear previous element

        // Move point
        this.pts.forEach(p => p.update(deltaTime));

        // Make lines
        this.pts.forEach(p1 => {
            this.pts.forEach(p2 => {
                let pos1: P5.Vector = p1.pos;
                let pos2: P5.Vector = p2.pos;
                let distance: number = p5.dist(pos1.x, pos1.y, pos2.x, pos2.y);
                if (distance < this.distanceToDraw) {
                    let newLine: Line = new Line(pos1, pos2, (distance / this.distanceToDraw) * this.strokeSize, 1 - distance / this.distanceToDraw);

                    if (crossing) {
                        this.lines.push(newLine);
                    } else {
                        // Test if make intersection
                        let intersect: boolean = false;
                        this.lines.forEach(l => {
                            if (newLine.intersection(l)) {
                                intersect = true;
                                // break;
                            }
                        });

                        if (!intersect)
                            this.lines.push(newLine);
                    }
                }
            });
        });
    }

    draw(): void {
        this.lines.forEach(l => {
            p5.stroke(255, 0, 255);
            l.draw();
        });
    }

}

class Point {
    pos: P5.Vector;
    acc: P5.Vector;
    dir: P5.Vector;

    constructor (x: number, y: number) {
        this.pos = p5.createVector(x, y);
        this.acc = p5.createVector();
        this.dir = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
    }

    update(deltaTime: number): void {
        this.acc.set(2, 2);

        if (this.pos.x < 0 || this.pos.x > width)
            this.dir.x *= -1;
        if (this.pos.y < 0 || this.pos.y > height)
            this.dir.y *= -1;

        this.acc.setMag(20);
        this.acc.x *= this.dir.x;
        this.acc.y *= this.dir.y;
        this.pos.add(P5.Vector.mult(this.acc, deltaTime));
    }
}

function orientation(p: P5.Vector, q: P5.Vector, r: P5.Vector) {
    let val: number = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val == 0.0)
        return 0; // colinear
    return (val > 0) ? 1 : 2; // clock or counterclock wise
}

function transparentCompute(x: number): number{
    return 10 * p5.pow(x, 3);
}

class Line {
    private start: P5.Vector;
    private end: P5.Vector;
    private size: number;
    private alphaPercent: number;

    constructor (start: P5.Vector, end: P5.Vector, size: number, alphaPercent: number) {
        this.start = start;
        this.end = end;
        this.size = size;
        this.alphaPercent = alphaPercent;
    }

    draw(): void {
        p5.strokeWeight(this.size);
        let lineColor: P5.Color = p5.lerpColor(startColor, endColor, this.start.y / height);
        p5.stroke(p5.red(lineColor), p5.green(lineColor), p5.blue(lineColor), transparentCompute(this.alphaPercent) * 255);
        p5.line(this.start.x, this.start.y, this.end.x, this.end.y);
    }

    intersection(l: Line): boolean {
        // Don't take the extremeity of each segment
        let s1: P5.Vector = this.start.copy(), e1 = this.end.copy();
        let xLength: number = (this.end.x - this.start.x);
        let yLength: number = (this.end.y - this.start.y);
        s1 = p5.createVector(this.start.x + xLength * 0.01, this.start.y + yLength * 0.01);
        e1 = p5.createVector(this.start.x + xLength * 0.99, this.start.y + yLength * 0.99);

        let s2: P5.Vector = l.start.copy(), e2 = l.end.copy();
        xLength = (l.end.x - l.start.x);
        yLength = (l.end.y - l.start.y);
        s2 = p5.createVector(l.start.x + xLength * 0.01, l.start.y + yLength * 0.01);
        e2 = p5.createVector(l.start.x + xLength * 0.99, l.start.y + yLength * 0.99);

        let o1: number = orientation(s1, e1, s2);
        let o2: number = orientation(s1, e1, e2);
        let o3: number = orientation(s2, e2, s1);
        let o4: number = orientation(s2, e2, e1);

        if (o1 != o2 && o3 != o4)
            return true;

        return false;
    }
}

let previousMillis: number = 0;
let crossing: boolean = false;
let startColor: P5.Color;
let endColor: P5.Color;

function draw(p: P5): void {
    p.clear();
    p.randomSeed(seed);
    p.background(20);
    startColor = p.color("#A3F5A7");
    endColor = p.color("#003C00");
    let millis: number = p.millis();
    let millisElapsed: number = millis - previousMillis;
    previousMillis = millis;

    let speed: number = 1;
    pm.update(speed * (millisElapsed / 100));
    pm.draw();
}

function setupP5(p: P5): void {
    p5 = p;
    pm = new PointManager(40, 250, 3);
    p.frameRate(60);
    p.resizeCanvas(800, 800);
    draw(p);
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {width: widthGrid, height: heightGrid, useColor: useColor,
        fromColor: fColor, toColor: tColor,
        spaceBetweenLine: spaceBetweenLine,
        nbLines: nbLines,
        seed: seed,
        reset: () => draw(p5)};

    const guiCanvas = gui.addFolder("Canvas");
    guiCanvas
        .add(params, "width",10, 500, 1)
        .onChange(value => {
            widthGrid = value;
            draw(p5);
        });
    guiCanvas
        .add(params, "height", 10, 500, 1)
        .onChange(value => {
            heightGrid = value;
            draw(p5);
        });
    guiCanvas.open();

    const guiColor = gui.addFolder("Colors");
    guiColor.add(params, "useColor")
        .onChange(value => {
            useColor = value;
            draw(p5);
        });
    guiColor.addColor(params, "fromColor")
        .onChange(value => {
            fromColor = p5.color(value);
            draw(p5);
        });
    guiColor.addColor(params, "toColor")
        .onChange(value => {
            toColor = p5.color(value);
            draw(p5);
        });
    guiColor.open();

    const guiMisc = gui.addFolder("Misc");
    guiMisc
        .add(params, "nbLines", 1, 5, 1)
        .onChange(value => {
            nbLines = value;
            draw(p5);
        });
    guiMisc
        .add(params, "spaceBetweenLine", 1, 10, 1)
        .onChange(value => {
            spaceBetweenLine = value;
            draw(p5);
        });
    guiMisc
        .add(params, "seed", 0, Number.MAX_SAFE_INTEGER, 1)
        .onChange(value => {
            seed = value;
            draw(p5);
        });
    guiMisc
        .add(params, "reset")
        .name("Reset");
    guiMisc.open();
}

function resize(): void {
    width = window.innerWidth;
    height = window.innerHeight;
    p5.resizeCanvas(width, height);
    draw(p5);
}

window.onresize = resize;

window.onload = () => {
    let sketch = (p: P5) => {
        p.setup = () => {
            setupP5(p);
        }

        p.draw = () => {
            draw(p);
        };
    }
    p5 = new P5(sketch);
    resize();
    setupDatGUI();
}
