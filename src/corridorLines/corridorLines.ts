import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;

let pause: boolean = false;
let time: number = 0;
let speed: number = 1;

class Point {
    x: number;
    y: number;
    constructor(x: number, y:number) {
        this.setPosition(x, y);
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public set(values: number[]): boolean {
        if (values.length < 2) return false;
        this.setPosition(values[0], values[1]);
        return true;
    }
}

class Equation {
    private readonly eqA: number;
    private readonly eqB: number;

    constructor(pt1: Point, pt2: Point) {
        p5.line(pt1.x, pt1.y, pt2.x, pt2.y);
        // Compute point to equation
        this.eqA = (pt2.y - pt1.y) / (pt2.x - pt1.x);
        this.eqB = pt1.y - this.eqA * pt1.x;
    }

    public computeX(y: number): number {
        return (y - this.eqB) / this.eqA;
    }

    public computeY(x: number): number {
        return this.eqA * x + this.eqB;
    }
}

let point: Point = new Point(0, 0);
let opacity: number = 1;
let spaceOffset: number = 1.075;
let xOffset: number = 0.5;
let yOffset: number = 100;

function lines(eq1: Equation, eq2: Equation, eq3: Equation, eq4: Equation): void {
    let iX: number = point.x, space: number = 1;
    while (iX < halfWidth) {
        let y1: number = eq1.computeY(iX);
        let y2: number = eq2.computeY(iX);
        let x3: number = eq3.computeX(y2);
        let y4: number = eq4.computeY(x3);
        p5.line(iX, y1, iX, y2);
        p5.line(iX, y2, x3, y2);
        p5.line(x3, y2, x3, y4);
        p5.line(x3, y4, iX, y1);
        space *= spaceOffset;
        iX += space;
    }
}

function getPointPosition(time: number): number[] {
    let pos: number = time % (2 * width);
    if (pos < width)
        return [xOffset * (pos - halfWidth), p5.cos(time / 2) * yOffset]
    else
        return [xOffset * (halfWidth - (pos - width)), p5.cos(time / 2 - p5.HALF_PI) * yOffset]
}

function draw(): void {
    p5.fill(0, opacity * 255);
    p5.rect(0, 0, width, height);
    p5.translate(halfWidth, halfHeight);
    p5.stroke("white");
    point.set(getPointPosition(time));
    lines(new Equation(point, new Point(halfWidth, halfHeight)),
        new Equation(point, new Point(halfWidth, -halfHeight)),
        new Equation(point, new Point(-halfWidth, -halfHeight)),
        new Equation(point, new Point(-halfWidth, halfHeight)));
    time+= speed * 10;
}

function reset(): void {
    p5.clear();
    time = 0;
    p5.translate(-halfWidth, -halfHeight);
    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    p.createCanvas(width, height);
    p5.frameRate(30);
    p5.angleMode(p5.DEGREES);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        speed: speed,
        opacity: opacity,
        xOffset: xOffset,
        yOffset: yOffset,
        spaceOffset: spaceOffset,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speed",0.1, 10, 0.1)
        .onChange(value => speed = value);
    guiEffect
        .add(params, "spaceOffset",1.005, 2, 0.005)
        .onChange(value => spaceOffset = value);
    guiEffect
        .add(params, "xOffset",0, 2, 0.1)
        .onChange(value => xOffset = value);
    guiEffect
        .add(params, "yOffset",0, 500, 1)
        .onChange(value => yOffset = value);
    guiEffect
        .add(params, "opacity",0.3, 1, 0.05)
        .onChange(value => opacity = value);
    guiEffect.open();

    const guiMisc = gui.addFolder("Misc");
    let ps = guiMisc
        .add(params, "pause")
        .name("Pause")
        .onChange(() => (! pause) ? ps.name("Play") : ps.name("Pause"));
    guiMisc
        .add(params, "reset")
        .name("Reset");
    guiMisc.open();
}

function resize(): void {
    width = window.innerWidth;
    height = window.innerHeight;
    halfWidth = width / 2;
    halfHeight = height / 2;
    p5.resizeCanvas(width, height);
    reset();
}

window.onresize = resize;

window.onload = () => {
    let sketch = (p: P5) => {
        p.setup = () => {
            setupP5(p);
        }

        p.draw = () => {
            draw();
        };
    }
    p5 = new P5(sketch);
    resize();
    setupDatGUI();
}
