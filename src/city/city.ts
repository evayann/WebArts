// Inspired from https://openprocessing.org/sketch/121526

import * as dat from 'dat.gui';
import * as P5 from 'p5';

// region Attributes
let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;

let colors: Colors;
let drawer: Drawer;

let pause: boolean = false;

/**
 * Parameter attributes
 */
let nbLinesToDraw: number = 5;
let useColor: boolean = true;

let offset: number = 5;
let skyLimit: number = .9;
let intersectPos: number = .63;
let groundOff: number = 0.05;

/**
 * Compute only
 */
let distance: number = 90;
let alpha: number = 30 * (Math.PI / 180);
let cAlpha: number = Math.cos(alpha);
let sAlpha: number = Math.sin(alpha);

/**
 * Useful little function
 */
const rdm: Function = (min, max?): number => p5.random(min, max);
const off: Function = (): number => rdm(-offset, offset);
const int: Function = (x): number => p5.floor(x);

/**
 * Direction principally for rect filling
 */
enum Direction {
    VERTICAL,
    HORIZONTAL,
    DIAG_UP,
    DIAG_DOWN
}

// region Utility
/**
 * Project the point in 2D space
 * x, z is the 2D plan, y is height
 * @param x axis (width)
 * @param y axis (depth)
 * @param z axis (height)
 * @param debug print value of projection in console
 */
function projection(x: number, z: number, y: number = 0, debug: boolean = false): [number, number] {
    let v: P5.Vector = projectionVector(vec(x, z, y), debug);
    return [v.x, v.y];
}

/**
 * Project the point in 2D space
 * x, z is the 2D plan, y is height
 * @param x axis (width)
 * @param y axis (depth)
 * @param z axis (height)
 * @param debug print value of projection in console
 */
function projectionGetV(x: number, z: number, y: number = 0, debug: boolean = false): P5.Vector {
    return projectionVector(vec(x, z, y), debug);
}

/**
 * Project the point in 2D space
 * x, z is the 2D plan, y is height
 * @param pt the 3D Vector to project on the screen
 * @param debug print value of projection in console
 */
function projectionVector(pt: P5.Vector, debug?: boolean): P5.Vector {
    let pj: P5.Vector = projectionFactor(pt);
    let scale: number = height / 90;
    let v = vec(intersectPos * width + scale * pj.x, 0, (skyLimit + groundOff) * height + scale * pj.y);
    if (debug) console.log(pt, " :: ", v);
    return v;
}

/**
 * Compute the factor of projection on screen (2D plan)
 * @param pt the 3D Vector to project on the screen
 */
function projectionFactor(pt: P5.Vector): P5.Vector {
    let camHeight: number = 1.5;
    let a: number = pt.x * sAlpha - pt.z * cAlpha;
    let b: number = pt.x * cAlpha + pt.z * sAlpha;
    return vec(distance * a / (b + distance), 0, -distance * (pt.y - camHeight) / (b + distance));
}

/**
 * Create a P5 Vector from 3 coordinates
 * @param x the X axis
 * @param z the Y axis
 * @param y the Z axis
 */
function vec(x: number, z: number, y: number = 0): P5.Vector {
    return p5.createVector(x, y, z);
}

/**
 * Unwrap xy values of a P5 Vector
 * @param v the P5 Vector to unwrap
 */
function xy(v: P5.Vector): [number, number] {
    return [v.x, v.y];
}

/**
 * Give a position near of pt in a radius of maxOffset / 2
 * @param pt the P5 Vector to find a near position
 * @param maxOffset the radius of near position
 */
function near(pt: P5.Vector, maxOffset: number): P5.Vector {
    let d: number = maxOffset / 2;
    return P5.Vector.add(pt, vec(rdm(-d, d), rdm(-d, d)));
}
// endregion Utility

// region Instruction
/**
 * Make a line from (x0, y0) to (x1, y1)
 * @param x0 the top left corner X
 * @param y0 the top left corner Y
 * @param x1 the bottom right corner X
 * @param y1 the bottom right corner Y
 */
function line(x0: number, y0: number, x1: number, y1: number): void {
    stroke(colors.get(Element.STROKE));
    x0 += off(); y0 += off();
    p5.line(x0, y0, x1, y1);
    resetColor();
}

/**
 * Make an ellipse of center (cx, cy) and radius (rx, ry)
 * @param cx the center X of ellipse
 * @param cy the center Y of ellipse
 * @param rx the radius X of ellipse
 * @param ry the radius X of ellipse
 * @param fillColor the filing color of circle
 * @param nbLoop the number of loop of ellipse stroke
 * @param border if we have ellipse stroke
 * @param fct a noise function for make non circular ellipse
 */
function ellipse(cx: number, cy: number, rx: number, ry: number, fillColor: P5.Color, nbLoop?: number, border: boolean = true, fct?: Function): void {
    if (border) stroke(colors.get(Element.STROKE));
    if (fillColor) fill(fillColor);

    p5.beginShape();
    let r: number = rdm(2.1, 2.5);
    let f: Function = (fct === undefined) ? (x) => 2.5 * offset * p5.sin(r * x) : fct;
    let min: number = p5.min(rx, ry);
    let v: number = f(0);
    let to: number = isNaN(nbLoop) ? p5.TAU * rdm([2, 3, 4]) : p5.TAU * nbLoop;
    for (let i = 0; i <= to; i += p5.TAU / (min * .5))
        p5.curveVertex(cx + p5.cos(i) * rx - (v = f(i)), cy + p5.sin(i) * ry - v);

    p5.endShape();
    resetColor();
}

/**
 * Make an ellipse of center (cx, cy) and radius (rx, ry)
 * @param cx the center X of ellipse
 * @param cy the center Y of ellipse
 * @param r the radius X of ellipse
 * @param fillColor the filing color of circle
 * @param nbLoop the number of loop of ellipse stroke
 * @param border if we have ellipse stroke
 */
function circle(cx: number, cy: number, r: number, fillColor: P5.Color, nbLoop?: number, border: boolean = true): void {
    ellipse(cx, cy, r, r, fillColor, nbLoop, border);
}

/**
 * Make a polygon with all vertices
 * @param vertices the array of vertices
 * @param fillColor the color to fill polygon
 * @param border the border color
 */
function polygon(vertices: P5.Vector[], fillColor?: P5.Color | string, border: boolean = true): void {
    if (fillColor) fill(fillColor);
    let borders: [number, number][] = [];
    p5.beginShape();
    for (let v of vertices) {
        v = P5.Vector.add(v, vec(off(), off())); // TODO Necessary to add noise here ???
        p5.vertex(v.x, v.y);
        borders.push(xy(v));
    }
    p5.endShape(p5.CLOSE);

    if (border) {
        stroke(colors.get(Element.STROKE));
        let [x1, y1] = xy(vertices[vertices.length - 1]);
        for (let [x2, y2] of borders) {
            line(x1, y1, x2, y2);
            [x1, y1] = [x2, y2];
        }
    }
    resetColor();
}

/**
 * Make a rectangle with the 4 points
 * @param p1 the first point of rectangle
 * @param p2 the second point of rectangle
 * @param p3 the third point of rectangle
 * @param p4 the last point of rectangle
 * @param color a function for coloring points
 */
function rectangle(p1: P5.Vector, p2: P5.Vector, p3: P5.Vector, p4: P5.Vector, color: P5.Color | string): void {
    add(action(polygon, [projectionVector(p1), projectionVector(p2),
        projectionVector(p3), projectionVector(p4)], color));
}

/**
 * Make a box from bottom visible point (p1) to top hidden point (p2). Hidden is in diagonal of visible point.
 * @param p1 bottom point
 * @param p2 top point
 * @param boxColor color of the box
 * @param underBoxColor color of the part under the box
 */
function box(p1: P5.Vector, p2: P5.Vector, boxColor?: P5.Color | string, underBoxColor?: P5.Color | string): void {
    let c1: P5.Vector = projectionGetV(p1.x, p2.z, p1.y),
        c2: P5.Vector = projectionGetV(p1.x, p2.z, p2.y),
        c3: P5.Vector = projectionGetV(p1.x, p1.z, p1.y),
        c4: P5.Vector = projectionGetV(p1.x, p1.z, p2.y),
        c5: P5.Vector = projectionGetV(p2.x, p1.z, p1.y),
        c6: P5.Vector = projectionGetV(p2.x, p1.z, p2.y),
        c7: P5.Vector = projectionGetV(p2.x, p2.z, p1.y);

    add(action(polygon, [c1, c2, c4, c6, c5, c7], boxColor));
    add(action(line, ...xy(c4), ...xy(c3)))
    if (c7.y > c1.y)
        add(action(polygon, [c1, c3, c5, c7], underBoxColor));

    // strip(c2.y - c1.y, c3, c4, c5, c6);
}
// endregion Instruction

// region Fill
/**
 * Fill area with upper diagonal lines
 * @param sx the X top left of area to fill
 * @param sy the Y top left of area to fill
 * @param ex the X bottom right of area to fill
 * @param ey the Y bottom right of area to fill
 */
function fill_up(sx: number, sy: number, ex: number, ey: number): void {
    let dx = ex - sx;
    let dy = ey - sy;

    for (let i = 0; i < p5.min(dx, dy); i += 6)
        add(action(line, sx, sy + i, sx + i, sy));

    if (dx > dy)
        for (let i = 0; i < dx - dy; i += 6)
            add(action(line, sx + i, ey, sx + dy + i, sy));
    else
        for (let i = 0; i < dy - dx; i += 6)
            add(action(line, sx, sy + dx + i, ex, sy + i));

    for (let i = p5.min(dx, dy); i >= 0; i -= 6)
        add(action(line, ex - i, ey, ex, ey - i));
}

/**
 * Fill area with lower diagonal lines
 * @param sx the X top left of area to fill
 * @param sy the Y top left of area to fill
 * @param ex the X bottom right of area to fill
 * @param ey the Y bottom right of area to fill
 */
function fill_down(sx: number, sy: number, ex: number, ey: number): void {
    let dx = ex - sx;
    let dy = ey - sy;

    for (let i = 0; i < p5.min(dx, dy); i += 6)
        add(action(line, sx + i, ey, sx, ey - i));

    if (dx > dy)
        for (let i = 0; i < dx - dy; i += 6)
            add(action(line, sx + i, sy, sx + dy + i, ey));
    else
        for (let i = 0; i < dy - dx; i += 6)
            add(action(line, ex, ey - i, sx, ey - dx - i));

    for (let i = p5.min(dx, dy); i >= 0; i -= 6)
        add(action(line, ex - i, sy, ex, sy + i));
}

/**
 * Fill area with horizontal lines
 * @param sx the X top left of area to fill
 * @param sy the Y top left of area to fill
 * @param ex the X bottom right of area to fill
 * @param ey the Y bottom right of area to fill
 */
function fill_hori(sx: number, sy: number, ex: number, ey: number): void {
    for (let i = 0; i < p5.abs(ey - sy); i += 6)
        add(action(line, sx, sy + i, ex, sy + i));
}

/**
 * Fill area with vertical lines
 * @param sx the X top left of area to fill
 * @param sy the Y top left of area to fill
 * @param ex the X bottom right of area to fill
 * @param ey the Y bottom right of area to fill
 */
function fill_vert(sx: number, sy: number, ex: number, ey: number): void {
    for (let i = 0; i < p5.abs(ex - sx); i += 6)
        add(action(line, sx + i, sy, sx + i, ey));
}

/**
 * Make a strip
 * @param del
 * @param p1
 * @param p2
 * @param p3
 * @param p4
 */
function strip(del: number, p1: P5.Vector, p2: P5.Vector, p3: P5.Vector, p4: P5.Vector): void {
    let r1 = (p1.y - p2.y) / del;
    let r2 = (p3.y - p4.y) / del;
    let pp = 0;
    while (pp < del) {
        add(action(line, p1.x, p2.y + pp * r1, p3.x, p4.y + pp * r2));
        pp += 0.5;
    }
}
// endregion Fill

/**
 * Make a rectangle from (sx, sy) to (ex, ey) and fill it if necessary
 * @param sx the X top left of area to fill
 * @param sy the Y top left of area to fill
 * @param ex the X bottom right of area to fill
 * @param ey the Y bottom right of area to fill
 * @param fillColor the color to fill rectangle
 * @param fillDirection if we need to fill rectangle with lines and the direction
 * @param border if we need to display border of rectangle
 */
function rect(sx: number, sy: number, ex: number, ey: number, fillColor: P5.Color, fillDirection?: Direction, border: boolean = false): void {
    add(action(polygon, [vec(sx, 0, sy), vec(ex, 0, sy), vec(ex, 0, ey), vec(sx, 0, ey)], fillColor, border));

    switch (fillDirection) {
        case Direction.DIAG_UP:
            fill_up(sx, sy, ex, ey);
            break;
        case Direction.DIAG_DOWN:
            fill_down(sx, sy, ex, ey);
            break;
        case Direction.HORIZONTAL:
            fill_hori(sx, sy, ex, ey);
            break;
        case Direction.VERTICAL:
            fill_vert(sx, sy, ex, ey);
            break;
        default:
            break; // Is None
    }
}

/**
 * Make the sky of city
 */
function sky(): void {
    rect(0, 0, width, height * skyLimit, colors.get(Element.SKY), rdm(Object.values(Direction)), false);
    add(action(circle, width * rdm(0.1, .9), rdm(height * .1, height * .5), height * .1, colors.get(Element.SUN)));
}

/**
 * Make the ground of city
 */
function ground(): void {
    // TODO Better ?
    rect(-offset, height * skyLimit - offset, width + offset, height + offset, colors.get(Element.GROUND));
    for (let i = 2; i--;) { // Ground lines
        add(
            action(line,
                ...projection(-10, 240),
                ...projection(-10, -60)
            ),
            action(line,
                ...projection(-20, 240),
                ...projection(-20, -60)
            ),
            action(line,
                ...projection(-40, -5),
                ...projection(240, -5)
            ),
            action(line,
                ...projection(-40, -15),
                ...projection(240, -15)
            )
        );
    }
}

/**
 * Make little tree at given position
 * @param pt
 */
function tree(pt: P5.Vector): void {
    let b: P5.Vector = projectionVector(pt);
    let c: P5.Vector = projectionVector(pt.copy().add(vec(0, 0, rdm(4, 8))));
    let hTree: number = b.y - c.y;
    let factor: number = p5.constrain(p5.abs(projectionFactor(pt).y), 0, .7);
    let rx: number = factor * rdm(hTree * .7, hTree * 1.2);
    let ry: number = factor * rdm(hTree * .7, hTree * 1.2);
    add(
        action(line, ...xy(b), ...xy(c)),
        action(ellipse, c.x + rdm(-1, 1), c.y, rx, ry, colors.get(Element.TREE), 2, true,
            (x) => p5.sq(p5.sin(x * p5.PI)) * offset)
    );
}

/**
 * Make little forest at given position
 * @param pt
 */
function forest(pt: P5.Vector): void {
    let nbTree: number = int(rdm(10, 15));
    for (let i = nbTree; i--;)
        tree(near(pt, 30));
}

/**
 * Make billboard on building, street...
 * @param pt
 */
function billboard(pt: P5.Vector, color?: P5.Color): void {
    // Left
    let ls: P5.Vector = P5.Vector.add(pt, vec(0, 5)),
        le: P5.Vector = vec(pt.x + 15, pt.z + 20, 10);
    rectangle(vec(ls.x, le.z, ls.y), vec(ls.x, le.z, le.y),
        vec(ls.x, ls.z, le.y), vec(ls.x, ls.z, ls.y), color);

    // Right
    let rs: P5.Vector = P5.Vector.add(pt, vec(10, 0)),
        re: P5.Vector = vec(pt.x + 20, pt.z - 5, 10);
    rectangle(vec(rs.x, re.z, rs.y), vec(rs.x, re.z, re.y),
        vec(rs.x, rs.z, re.y), vec(rs.x, rs.z, rs.y), color);
}

/**
 * Make a building at given position
 * @param pt
 */
function building(pt: P5.Vector): void {
    let h = int(rdm(50, 100));
    box(vec(pt.x + 20, pt.z + 10, h), vec(pt.x + 21, pt.z + 11, h + rdm(20, 30)), "white");
    box(vec(pt.x + 10, pt.z + 10, h), vec(pt.x + 11, pt.z + 11, h + rdm(20, 30)), "white");
    rectangle(vec(pt.x, pt.z, h), vec(pt.x + 30, pt.z, h), vec(pt.x + 30, pt.z + 30, h),
        vec(pt.x, pt.z + 30, h), "white");
    box(vec(pt.x, pt.z, 20), vec(pt.x + 30, pt.z + 30, h - 4), colors.get(Element.WINDOW), "black");
    for (let fi = 30 - 3; fi > 0; fi -= 3)
        add(action(line, ...projection(pt.x,pt.z + fi,20), ...projection(pt.x,pt.z + fi,h - 4)),
            action(line, ...projection(pt.x + fi, pt.z, 20), ...projection(pt.x + fi,pt.z,h - 4))
        );
    box(pt, vec(pt.x + 30, pt.z + 30, 19), colors.get(Element.STRUCTURE));
    if (rdm() < .5) billboard(pt, p5.color(0, 150));
}

function populate(): void {
    let elements: Function[] = [forest, building];
    for(let z = 9; z > 0; z--)
        rdm(elements)(vec(0, z * 40));
    for(let x = 6; x--; )
        rdm(elements)(vec(x * 40, 0));

    // forest(vec(0, 0))
}

function city(): void {
    sky();
    ground();
    populate();

    drawer.start();
}

// region Colors
enum Element {
    STROKE,
    SUN,
    SKY,
    GROUND,
    TREE,
    WINDOW,
    STRUCTURE
}

class Colors {
    private uColor: boolean;
    private colors: Map<Element, P5.Color[]>;

    constructor(useColor: boolean = true) {
        this.uColor = useColor;
        this.colors = new Map();
        this.colors.set(Element.STROKE, [p5.color("#000000")]);
        this.colors.set(Element.SUN, [p5.color("#ded40d")]);
        this.colors.set(Element.SKY, [p5.color("#327be9")]);
        this.colors.set(Element.GROUND, [p5.color("#282318")]);
        this.colors.set(Element.TREE, [p5.color("#3d720f"), p5.color("#3d720f"), p5.color("#74ba34")]);
        this.colors.set(Element.WINDOW, [p5.color("#84ace2"), p5.color("#57e6fa"), p5.color("#7fb7cb")]);
        this.colors.set(Element.STRUCTURE, [p5.color("#541c14"), p5.color("#173e3e"), p5.color("#396611")]);
    }

    useColor(value: boolean): void {
        this.uColor = value;
    }

    get(element: Element): P5.Color {
        if (this.uColor != true)
            return (element == Element.STROKE) ? p5.color("black") : p5.color("white");
        else
            return rdm(this.colors.get(element));
    }
}

function resetColor(): void {
    p5.noStroke();
    p5.noFill();
}

const fill: Function = (v): void => {p5.fill(v);};
const stroke: Function = (v): void => {p5.stroke(v);};
// endregion Colors

// region Draw Elements
class Action {
    private readonly action: Function;
    private readonly data: Array<any>;

    constructor(action: Function, ...data: any[]) {
        this.action = action;
        this.data = data;
    }

    do() {
        this.action(...this.data);
    }
}

function action(fct: Function, ...data: any[]): Action {
    return new Action(fct, ...data);
}

class Drawer extends Array<Action> {
    private curr: number;
    private iterOn: IterableIterator<Action>;
    private step: number;

    constructor(step: number) {
        super();
        this.curr = 0;
        this.setStep(step);
    }

    setStep(step: number): void {
        this.step = step;
    }

    start(): void {
        this.iterOn = this.values();
    }

    call(): void {
        if (this.curr == this.length)
            return;

        let startAt: number = this.curr.valueOf();
        while (this.curr < startAt + this.step && this.curr <= this.length) {
            this.curr++;
            let a: IteratorResult<Action, any> = this.iterOn.next();
            if (! a.done)
                a.value.do();
            else
                p5.noLoop(); // End
        }
    }
}

function add(...action: Action[]): void {
    drawer.push(...action);
}

function draw(): void {
    drawer.call();
}
// endregion Draw Elements

function reset(): void {
    p5.clear();
    p5.loop();
    drawer = new Drawer(nbLinesToDraw);
    resetColor();
    city();
}

function setupP5(p: P5): void {
    p5 = p;
    p5.createCanvas(width, height);
    p5.frameRate(30);
    p5.strokeWeight(2);
    colors = new Colors();
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        nbLinesToDraw: nbLinesToDraw,
        skyLimit: skyLimit,
        groundOff: groundOff,
        intersectPos: intersectPos,
        useColor: useColor,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "nbLinesToDraw",1, 100, 1)
        .onChange(value => drawer.setStep(value));
    guiEffect
        .add(params, "intersectPos",.05, .95, 0.01)
        .onChange(value => {
            intersectPos = value;
            reset();
        });
    guiEffect
        .add(params, "skyLimit",.5, .9, 0.1)
        .onChange(value => {
            skyLimit = value;
            reset();
        });
    guiEffect
        .add(params, "groundOff",0, .2, .01)
        .onChange(value => {
            groundOff = value;
            reset();
        });
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual
        .add(params, "useColor")
        .onChange(value => {
            colors.useColor(value);
            reset();
        });
    // guiVisual.addColor(params, "ptColor")
    //     .onChange(value => {
    //         ptColor = p5.color(value);
    //         p5.stroke(ptColor);
    //     });
    guiVisual.open();

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
