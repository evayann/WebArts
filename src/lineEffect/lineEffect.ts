import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;

let p5: P5;
let useColor: boolean = true;
let bColor: string = "#21304d";
let fColor: string = "#adf8e8";
let tColor: string = "#58c823";
let backgroundColor: P5.Color;
let fromColor: P5.Color;
let toColor: P5.Color;

let crossing: boolean = false;

let nbPts: number = 50;
let distToDraw: number = 250;
let strokeSize: number = 3;

let speedFactor: number = 1;
let pause: boolean = false;
let seed: number = 0;

let pm: PointManager;

class PointManager {
    private pts: Array<Point>;
    private readonly lines: Array<Line>;

    constructor () {
        this.pts = new Array<Point>();
        this.lines = new Array<Line>();
        for (let i: number = 0; i < nbPts; i++)
            this.pts.push(new Point(p5.random(width), p5.random(height)));
    }

    update(deltaTime: number): void {
        this.lines.length = 0; // Clear previous element

        // Move point
        this.pts.forEach(p => p.update(deltaTime));

        // Make lines
        this.pts.forEach(p1 => {
            this.pts.forEach(p2 => {
                let pos1: P5.Vector = p1.pos, pos2: P5.Vector = p2.pos;
                let distance: number = p5.dist(pos1.x, pos1.y, pos2.x, pos2.y);
                if (distance < distToDraw) {
                    let newLine: Line = new Line(pos1, pos2, (distance / distToDraw) * strokeSize, 1 - distance / distToDraw);

                    if (crossing) {
                        this.lines.push(newLine);
                    }
                    else {
                        // Test if make intersection
                        let intersect: boolean = false;
                        for (let i: number = 0; i < this.lines.length; i++) {
                            if (newLine.intersection(this.lines[i])) {
                                intersect = true;
                                break;
                            }
                        }

                        if (! intersect)
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

function transparentCompute(x: number): number {
    return 10 * p5.pow(x, 3);
}

class Line {
    private start: P5.Vector;
    private end: P5.Vector;
    private readonly size: number;
    private readonly alphaPercent: number;

    constructor (start: P5.Vector, end: P5.Vector, size: number, alphaPercent: number) {
        this.start = start;
        this.end = end;
        this.size = size;
        this.alphaPercent = alphaPercent;
    }

    static reduceLine(l: Line, percent: number): Line {
        let length: P5.Vector = p5.createVector(l.end.x - l.start.x, l.end.y - l.start.y);
        return new Line(P5.Vector.add(l.start, (P5.Vector.mult(length, percent))),
            P5.Vector.sub(l.end, (P5.Vector.mult(length, percent))), l.size, l.alphaPercent);
    }

    public draw(): void {
        p5.strokeWeight(this.size);
        let lineColor: P5.Color = (useColor) ? p5.lerpColor(fromColor, toColor, this.start.y / height) : p5.color("#a59d9d");
        lineColor.setAlpha(transparentCompute(this.alphaPercent) * 255);
        p5.stroke(lineColor);
        p5.line(this.start.x, this.start.y, this.end.x, this.end.y);
    }

    intersection(l: Line): boolean {
        // Don't take the extremity of each segment
        let l1: Line = Line.reduceLine(this, 0.01);
        let l2: Line = Line.reduceLine(l, 0.01);

        return orientation(l1.start, l1.end, l2.start) != orientation(l1.start, l1.end, l2.end)
            && orientation(l2.start, l2.end, l1.start) != orientation(l2.start, l2.end, l1.end);
    }
}

function draw(p: P5): void {
    p.clear();
    p.randomSeed(seed);
    p.background(backgroundColor);

    pm.update(speedFactor * 0.2);
    pm.draw();
}

function reset(): void {
    pm = new PointManager();
}

function setupP5(p: P5): void {
    p5 = p;
    backgroundColor = p5.color(bColor);
    fromColor = p5.color(fColor);
    toColor = p5.color(tColor);
    p.frameRate(60);
    reset();
    draw(p);
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {intersect: () => crossing = ! crossing,
        speed: speedFactor,
        nbPts: nbPts,
        distToDraw: distToDraw,
        strokeSize: strokeSize,
        useColor: useColor,
        fromColor: fColor, toColor: tColor,
        backgroundColor: bColor,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        seed: seed,
        reset: () => {
            reset();
            draw(p5);
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "nbPts",25, 300, 1)
        .onChange(value => {
            nbPts = value;
            reset();
        })
        .name("Nomber of Points");
    guiEffect
        .add(params, "distToDraw",0, 500, 1)
        .onChange(value => distToDraw = value)
        .name("Distance to draw Lines");
    guiEffect
        .add(params, "strokeSize",0.1, 5, 0.1)
        .onChange(value => strokeSize = value)
        .name("Stroke Size");
    guiEffect
        .add(params, "speed",0.1, 5, 0.1)
        .onChange(value => speedFactor = value)
        .name("SpeedFactor");
    let intersect = guiEffect
        .add(params, "intersect")
        .onChange(() => (crossing) ? intersect.name("Intersect") : intersect.name("Not Intersect"))
        .name("Not Intersect");
    guiEffect.open();

    const guiColor = gui.addFolder("Colors");
    guiColor.add(params, "useColor")
        .onChange(value => {
            useColor = value;
            pm.draw();
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
    guiColor.addColor(params, "backgroundColor")
        .onChange(value => {
            backgroundColor = p5.color(value);
            draw(p5);
        });
    guiColor.open();

    const guiMisc = gui.addFolder("Misc");
    let ps = guiMisc
        .add(params, "pause")
        .name("Pause")
        .onChange(() => (! pause) ? ps.name("Play") : ps.name("Pause"));
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
