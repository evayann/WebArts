import * as P5 from 'p5';
import {Drawer, Action, Colors, Element,
    action, fill, stroke, resetColor, rdm} from './drawer';

// region Attributes
let p5: P5;
let cp: CityParameters;

/**
 * Compute only
 */
let distance: number = 90;
let alpha: number = 30 * (Math.PI / 180);
let cAlpha: number = Math.cos(alpha);
let sAlpha: number = Math.sin(alpha);
// endregion Attributes

// region Update Utility Attributes
export class CityParameters {
    width: number;
    height: number;
    colors: Colors;
    drawer: Drawer;
    offset: number;
    skyLimit: number;
    groundOff: number;
    intersectPos: number;
    constructor(w: number, h: number, c: Colors, o: number,
                sl: number, ip: number, go: number) {
        this.width = w;
        this.height = h;
        this.colors = c;
        this.offset = o;
        this.skyLimit = sl;
        this.groundOff = go;
        this.intersectPos = ip;
    }
}

export function setGeometryParameters(p: P5, c: CityParameters): void {
    p5 = p;
    cp = c;
}
// endregion Update Utility Attributes

/**
 * Useful little function
 */
const off: Function = (): number => rdm(-cp.offset, cp.offset);
const int: Function = (x): number => p5.floor(x);

/**
 * Direction principally for rect filling
 */
export enum Direction {
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
export function projection(x: number, z: number, y: number = 0, debug: boolean = false): [number, number] {
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
export function projectionGetV(x: number, z: number, y: number = 0, debug: boolean = false): P5.Vector {
    return projectionVector(vec(x, z, y), debug);
}

/**
 * Project the point in 2D space
 * x, z is the 2D plan, y is height
 * @param pt the 3D Vector to project on the screen
 * @param debug print value of projection in console
 */
export function projectionVector(pt: P5.Vector, debug?: boolean): P5.Vector {
    let pj: P5.Vector = projectionFactor(pt);
    let scale: number = cp.height / 90;
    let v = vec(cp.intersectPos * cp.width + scale * pj.x, 0, (cp.skyLimit + cp.groundOff) * cp.height + scale * pj.y);
    if (debug) console.log(pt, " :: ", v);
    return v;
}

/**
 * Compute the factor of projection on screen (2D plan)
 * @param pt the 3D Vector to project on the screen
 */
export function projectionFactor(pt: P5.Vector): P5.Vector {
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
export function vec(x: number, z: number, y: number = 0): P5.Vector {
    return p5.createVector(x, y, z);
}

/**
 * Unwrap xy values of a P5 Vector
 * @param v the P5 Vector to unwrap
 */
export function xy(v: P5.Vector): [number, number] {
    return [v.x, v.y];
}

/**
 * Give a position near of pt in a radius of maxOffset / 2
 * @param pt the P5 Vector to find a near position
 * @param maxOffset the radius of near position
 */
export function near(pt: P5.Vector, maxOffset: number): P5.Vector {
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
export function line(x0: number, y0: number, x1: number, y1: number): void {
    stroke(cp.colors.get(Element.STROKE));
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
export function ellipse(cx: number, cy: number, rx: number, ry: number, fillColor: P5.Color, nbLoop?: number, border: boolean = true, fct?: Function): void {
    if (border) stroke(cp.colors.get(Element.STROKE));
    if (fillColor) fill(fillColor);

    p5.beginShape();
    let r: number = rdm(2.1, 2.5), v: number;
    let f: Function = (fct === undefined) ? (x) => 2.5 * cp.offset * p5.sin(r * x) : fct;
    let min: number = p5.min(rx, ry);
    let to: number = isNaN(nbLoop) ? p5.TAU * rdm([2, 3, 4]) : p5.TAU * nbLoop;
    for (let i = 0; i <= to; i += p5.TAU / (min * .5))
        p5.curveVertex(cx + p5.cos(i) * rx - (v = f(i)), cy + p5.sin(i) * ry - v);
    p5.endShape();
    resetColor();
}


export function computeArc(pt: P5.Vector, rx: number, ry: number, from: number, to: number, precision: number = 25): Array<P5.Vector> {
    let vertices: Array<P5.Vector> = [];
    for (let i = from; i <= to; i += (to - from) / precision)
        vertices.push(projectionGetV(pt.x + p5.cos(i) * rx, pt.z - p5.sin(i) * ry, pt.y));
    vertices.push(projectionGetV(pt.x + p5.cos(to) * rx, pt.z - p5.sin(to) * ry, pt.y));
    return vertices;
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
export function circle(cx: number, cy: number, r: number, fillColor: P5.Color, nbLoop?: number, border: boolean = true): void {
    ellipse(cx, cy, r, r, fillColor, nbLoop, border);
}

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
export function rect(sx: number, sy: number, ex: number, ey: number, fillColor: P5.Color, fillDirection?: Direction, border: boolean = false): void {
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
 * Make a polygon with all vertices
 * @param vertices the array of vertices
 * @param fillColor the color to fill polygon
 * @param border the border color
 */
export function polygon(vertices: P5.Vector[], fillColor?: P5.Color | string, border: boolean = true): void {
    if (fillColor) fill(fillColor);
    let borders: [number, number][] = [];
    p5.beginShape();
    for (let v of vertices) {
        p5.vertex(v.x, v.y);
        borders.push(xy(v));
    }
    p5.endShape(p5.CLOSE);

    if (border) {
        stroke(cp.colors.get(Element.STROKE));
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
 * @param color to fill rectangle
 */
export function rectangle(p1: P5.Vector, p2: P5.Vector, p3: P5.Vector, p4: P5.Vector, color?: P5.Color | string): void {
    add(action(polygon, [projectionVector(p1), projectionVector(p2),
        projectionVector(p3), projectionVector(p4)], color));
}

/**
 * Make a rectangle with the 4 points and add strip on it
 * @param p1 the first point of rectangle
 * @param p2 the second point of rectangle
 * @param p3 the third point of rectangle
 * @param p4 the last point of rectangle
 * @param color to fill rectangle
 */
export function rectangle_strip(p1: P5.Vector, p2: P5.Vector, p3: P5.Vector, p4: P5.Vector, color?: P5.Color | string): void {
    rectangle(p1, p2, p3, p4, color);
    strip(p2.y - p1.y, projectionVector(p1), projectionVector(p2), projectionVector(p4), projectionVector(p3))
}

/**
 * Make a box from bottom visible point (p1) to top hidden point (p2). Hidden is in diagonal of visible point.
 * @param p1 bottom point
 * @param p2 top point
 * @param boxColor color of the box
 * @param underBoxColor color of the part under the box
 */
export function box(p1: P5.Vector, p2: P5.Vector, boxColor?: P5.Color | string, underBoxColor?: P5.Color | string): void {
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

    strip(c1.y - c2.y, c3, c4, c5, c6);
}

/**
 * Make a cylinder at point (pt) of height (h) and radius (r) with precision facet
 * @param pt the point at the bottom of cylinder
 * @param h the height of cylinder
 * @param r the radius of cylinder
 * @param precision the number of facet of cylinder
 * @param color the color to fill cylinder
 * @param border if we draw border of cylinder
 * @param shadow the number of facet who have shadow strip
 */
export function cylinder(pt: P5.Vector, h: number, r: number, precision?: number,
                         color?: P5.Color | string, border: boolean = true, shadow: number = 3) {
    let bottoms: Array<P5.Vector> = computeArc(P5.Vector.add(pt, vec(15, 15)), r, r, 0, p5.TAU, precision);
    let tops: Array<P5.Vector> = computeArc(P5.Vector.add(pt, vec(15, 15, h)), r, r, 0, p5.TAU, precision);

    let zip: Function = (x, y) => x.map((vx, i) => [vx, y[i]]);
    let pts: Array<[P5.Vector, P5.Vector]> = zip(tops, bottoms);
    let [prevTop, prevBottom] = pts[pts.length - 1];
    let shCounter: number = 0;

    add(action(polygon, tops, color, border));
    for (let [ti, bi] of pts) {
        if (bi.x < prevBottom.x) {
            add(action(polygon, [prevTop, ti, bi, prevBottom], color, border));
            if (++shCounter <= shadow) strip(bi.y - ti.y, ti, bi, prevTop, prevBottom);
        }
        [prevTop, prevBottom] = [ti, bi];
    }
    add(action(polygon, bottoms, "black", border));
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
 * Make a strip lines to simulate shadow
 * @param distToDo the distance to do with strip
 * @param p1 the first point of rectangle to fill of strip
 * @param p2 the second point of rectangle to fill of strip
 * @param p3 the third point of rectangle to fill of strip
 * @param p4 the last point of rectangle to fill of strip
 * @param stripOff the offset between two strip
 */
export function strip(distToDo: number, p1: P5.Vector, p2: P5.Vector, p3: P5.Vector, p4: P5.Vector, stripOff: number = 6): void {
    let r1 = (p1.y - p2.y) / distToDo;
    let r2 = (p3.y - p4.y) / distToDo;
    let pp = 0;
    while (pp < distToDo) {
        add(action(line, p1.x, p2.y + pp * r1, p3.x, p4.y + pp * r2));
        pp += stripOff;
    }
}
// endregion Fill

/**
 * Easy insertion of new actions on drawer
 * @param action the different action to add
 */
export function add(...action: Action[]): void {
    cp.drawer.push(...action);
}
