<template>
    <P5Vue @setup="this.setupP5" @draw="this.drawP5" @windowresized="this.resizeP5"></P5Vue>
</template>

<script lang="ts">
// Inspired from https://openprocessing.org/sketch/121526
import {width, height, p5Instance, P5} from "@/components/P5.vue";
import {ArtVue, pause, menu, button, GUIType} from "@/arts/art";
import {action, Colors, Drawer, Element, rdm, resetColor, setP5} from './drawer';
import {
add, box, circle, CityParameters, cylinder, Direction, ellipse, line,
near, projection, projectionFactor, projectionVector,
rect, rectangle, rectangle_strip,
setGeometryParameters, vec, xy
} from './geometry';

// region Attributes

let p5: p5Instance;

/**
* Parameter attributes
*/
let nbLinesToDraw = 5;
let useColor = true;

let cp: CityParameters = new CityParameters(width, height);
// endregion Attributes

/**
* Useful little function
*/
const int: (number) => number = (x: number): number => p5.floor(x);
const darker = (c: P5.Color, off = 10): P5.Color => {
    p5.colorMode(p5.HSB);
    return p5.color(p5.hue(c), p5.saturation(c), p5.constrain(p5.brightness(c) - off, 0, 255));
};
const lighter = (c: P5.Color, off = 10): P5.Color => {
    p5.colorMode(p5.HSB);
    return p5.color(p5.hue(c), p5.saturation(c), p5.constrain(p5.brightness(c) + off, 0, 255));
};

/**
* Make the sky of city
*/
function sky(): void {
    rect(0, 0, width, height * cp.skyLimit, cp.colors.get(Element.SKY), rdm(Object.values(Direction)), false);
    add(action(circle, width * rdm(0.1, .9), rdm(height * .1, height * .5), height * .1, cp.colors.get(Element.SUN)));
}

/**
* Make the ground of city
*/
function ground(): void {
    rect(-cp.offset, height * cp.skyLimit - cp.offset,
    width + cp.offset, height + cp.offset, cp.colors.get(Element.GROUND));
    for (let i = 2; i--;) { // Ground lines
        add(action(line, ...projection(-10, 240), ...projection(-10, -60)),
            action(line, ...projection(-20, 240), ...projection(-20, -60)),
            action(line, ...projection(-40, -5), ...projection(240, -5)),
            action(line, ...projection(-40, -15), ...projection(240, -15))
            );
    }
}

/**
* Make little tree at given position
* @param pt
*/
function tree(pt: P5.Vector): void {
    const b: P5.Vector = projectionVector(pt);
    const c: P5.Vector = projectionVector(pt.copy().add(vec(0, 0, rdm(4, 8))));
    const hTree: number = b.y - c.y;
    const factor: number = p5.constrain(p5.abs(projectionFactor(pt).y), 0, .7);
    const rx: number = factor * rdm(hTree * .7, hTree * 1.2);
    const ry: number = factor * rdm(hTree * .7, hTree * 1.2);
    add(action(line, ...xy(b), ...xy(c)),
        action(ellipse, c.x + rdm(-1, 1), c.y, rx, ry, cp.colors.get(Element.TREE), 2, true,
        (x) => p5.sq(p5.sin(x * p5.PI)) * cp.offset)
        );
}

/**
* Make little forest at given position
* @param pt
*/
function forest(pt: P5.Vector): void {
    const nbTree: number = int(rdm(10, 15));
    for (let i = nbTree; i--;)
        tree(near(pt, 30));
}

/**
* Make rectangle near position with a color
* Usefull to make door
* @param pt
* @param color
*/
function doorLike(pt: P5.Vector, color?: P5.Color): void {
    // Left
    const ls: P5.Vector = P5.Vector.add(pt, vec(0, 5)),
    le: P5.Vector = vec(pt.x + 15, pt.z + 20, 10);
    rectangle(vec(ls.x, le.z, ls.y), vec(ls.x, le.z, le.y),
    vec(ls.x, ls.z, le.y), vec(ls.x, ls.z, ls.y), color);

    // Right
    const rs: P5.Vector = P5.Vector.add(pt, vec(10, 0)),
    re: P5.Vector = vec(pt.x + 20, pt.z - 5, 10);
    rectangle(vec(rs.x, re.z, rs.y), vec(rs.x, re.z, re.y),
    vec(rs.x, rs.z, re.y), vec(rs.x, rs.z, rs.y), color);
}

/**
* Make stilts at position (pt) of height (h) woth distance between stilt of dx, dy and fill it with color
* @param pt initial position
* @param dx the delta x position between stilts on x axis
* @param dz the delta z position between stilts on x axis
* @param h the height of all stilts
* @param color the color to fill stilts
*/
function onStilts(pt: P5.Vector, dx: number, dz: number, h: number, color?: P5.Color | string): void {
    const nrx: number = int((dx - 1) / 6), nrz: number = int((dz - 1) / 6),
    delx: number = (dx - 1) / nrx, delz: number = (dz - 1) / nrz;

    for (let i = nrz; i > 0; i--)
        box(vec(pt.x, pt.z + i * delz, 0), vec(pt.x + 1, pt.z + i * delz + 1, h), color);

    for (let i = nrx; i >= 0; i--)
        box(vec(pt.x + i * delx, pt.z, 0), vec(pt.x + i * delx + 1, pt.z + 1, h), color);
}

/**
* Make a base at given position (pt) of height (h)
* @param pt the position
* @param h the height
* @param color the color of base
*/
function base(pt: P5.Vector, h: number, color?: P5.Color | string) {
    const nr1: number = int(rdm(1, 5)), nr2: number = int(rdm(1, 5));
    const inter1: number = 27.0 / nr1, inter2: number = 27.0 / nr2;
    box(pt, vec(pt.x + 30, pt.z + 30, h), color);

    ((rdm() < .5) ? rectangle_strip : rectangle)(vec(pt.x, pt.z + 2, 6), vec(pt.x, pt.z + 2, h - 2),
    vec(pt.x, pt.z + 28, h - 2), vec(pt.x, pt.z + 28, 6));
    for (let i = 0; i < nr1; i++)
        rectangle(vec(pt.x, pt.z + 2 + i * inter1, 0), vec(pt.x, pt.z + 2 + i * inter1, 4),
        vec(pt.x, pt.z + 1 + (i + 1) * inter1, 4), vec(pt.x, pt.z + 1 + (i + 1) * inter1, 0), color);

    ((rdm() < .5) ? rectangle_strip : rectangle)(vec(pt.x + 2, pt.z, 6), vec(pt.x + 2, pt.z, h - 2),
    vec(pt.x + 28, pt.z, h - 2), vec(pt.x + 28, pt.z, 6), "black");
    for (let i = 0; i < nr2; i++)
        rectangle(vec(pt.x + 2 + i * inter2, pt.z, 0), vec(pt.x + 2 + i * inter2, pt.z, 4),
        vec(pt.x + 1 + (i + 1) * inter2, pt.z, 4), vec(pt.x + 1 + (i + 1) * inter2, pt.z, 0), "black");
}

/**
* Make a window building at given position
* @param pt
*/
function windowBuilding(pt: P5.Vector): void {
    const h: number = int(rdm(50, 100));
    box(vec(pt.x + 20, pt.z + 10, h), vec(pt.x + 21, pt.z + 11, h + rdm(20, 30)), "white");
    box(vec(pt.x + 10, pt.z + 10, h), vec(pt.x + 11, pt.z + 11, h + rdm(20, 30)), "white");
    rectangle(vec(pt.x, pt.z, h), vec(pt.x + 30, pt.z, h), vec(pt.x + 30, pt.z + 30, h),
    vec(pt.x, pt.z + 30, h), "white");
    box(vec(pt.x, pt.z, 20), vec(pt.x + 30, pt.z + 30, h - 4), cp.colors.get(Element.WINDOW), "black");
    for (let fi = 30 - 3; fi > 0; fi -= 3)
        add(action(line, ...projection(pt.x, pt.z + fi, 20), ...projection(pt.x, pt.z + fi, h - 4)),
            action(line, ...projection(pt.x + fi, pt.z, 20), ...projection(pt.x + fi, pt.z, h - 4))
        );
    box(pt, vec(pt.x + 30, pt.z + 30, 19), cp.colors.get(Element.STRUCTURE_DARKER));
    if (rdm() < .5) doorLike(pt, p5.color(0, 150));
}

/**
* Make a box building at given position
* @param pt
*/
function squareBuilding(pt: P5.Vector): void {
    const nr: number = int(rdm(5, 20));
    const c: P5.Color = cp.colors.get(Element.STRUCTURE);
    onStilts(pt, 30, 30, 4, c);
    for (let i = nr - 1; i--;)
        box(vec(pt.x, pt.z, i * 4 + 4), vec(pt.x + 30, pt.z + 30, i * 4 + 6), c);
}

function cubeBuilding(pt: P5.Vector): void {
    const h: number = int(rdm(50, 100));
    const c1: P5.Color = cp.colors.get(Element.STRUCTURE), c2: P5.Color = cp.colors.get(Element.STRUCTURE);
    const core: () => void = () => {
        if (h > 50) box(vec(pt.x + 2, pt.z + 2, 50), vec(pt.x + 28, pt.z + 28, h), c1);
        if (h > 50) box(vec(pt.x + 4, pt.z + 4, 42), vec(pt.x + 26, pt.z + 26, 50), c2);
        if (h > 42) box(vec(pt.x + 2, pt.z + 2, 16), vec(pt.x + 28, pt.z + 28, 42), c1);
        if (h > 16) box(vec(pt.x + 4, pt.z + 4, 12), vec(pt.x + 26, pt.z + 26, 16), c2);
    };

    box(vec(pt.x + 14.5, pt.z + 14.5, h), vec(pt.x + 15.5, pt.z + 15.5, h + 40), "white"); // Antenna
    if (rdm() < .2) {
        onStilts(pt, 8, 15, 12, cp.colors.get(Element.STROKE));
        core();
    } else {
        core();
        base(pt, 12, c1);
    }
}

function rectangleBuilding(pt: P5.Vector): void {
    const h: number = int(rdm(50, 100));
    const c1: P5.Color = cp.colors.get(Element.STRUCTURE), c2: P5.Color = cp.colors.get(Element.STRUCTURE);
    box(vec(pt.x + 1, pt.z + 1, h - 10), vec(pt.x + 29, pt.z + 29, h), c1);
    box(vec(pt.x + 4, pt.z + 4, 10), vec(pt.x + 22, pt.z + 22, h - 10),
    rdm() < .35 ? c1 : cp.colors.get(Element.STRUCTURE_DARKER));
    box(vec(pt.x + 2, pt.z + 22, 10), vec(pt.x + 4, pt.z + 28, h - 10), c2);
    box(vec(pt.x + 22, pt.z + 2, 10), vec(pt.x + 28, pt.z + 4, h - 10), c2);
    box(vec(pt.x + 2, pt.z + 2, 10), vec(pt.x + 8, pt.z + 8, h - 10), c2);
    base(pt, 10, c1);
}

function cylinderBuilding(pt: P5.Vector): void {
    const h: number = int(rdm(50, 100));
    let c: P5.Color = cp.colors.get(Element.STRUCTURE);
    cylinder(vec(pt.x, pt.z, 31), h - 16, 16, 13, c);
    cylinder(vec(pt.x, pt.z, 26), 4, 16, 13, c);
    cylinder(vec(pt.x, pt.z, 21), 4, 16, 13, c = (darker(c)));
    cylinder(vec(pt.x, pt.z, 16), 4, 16, 13, c);
    cylinder(vec(pt.x, pt.z, 12), 4, 16, 11, c = (darker(c)), true, 2);
    cylinder(vec(pt.x, pt.z, 0), 12, 16, 15, darker(c));
}

function cylinderOnBaseBuilding(pt: P5.Vector): void {
    const h: number = int(rdm(50, 100));
    let c: P5.Color = cp.colors.get(Element.STRUCTURE);
    cylinder(vec(pt.x, pt.z, h - 4), 4, 12, 13, c);
    cylinder(vec(pt.x, pt.z, h - 8), 12, 9, 13, c = (lighter(c)));
    cylinder(vec(pt.x, pt.z, 8), h - 14, 12, 13, lighter(c));
    base(pt, 8, darker(cp.colors.get(Element.STRUCTURE), 5));
}

function shapeStack(pt: P5.Vector): void {
    const h: number = int(rdm(50, 100));
    const c: P5.Color = cp.colors.get(Element.STRUCTURE);
    const w: P5.Color = cp.colors.get(Element.WINDOW);
    box(vec(pt.x + 5, pt.z + 5, 32), vec(pt.x + 25, pt.z + 25, h), w);
    box(vec(pt.x + 10, pt.z + 10, 26), vec(pt.x + 20, pt.z + 20, 32), c);
    box(vec(pt.x + 5, pt.z + 24, 26), vec(pt.x + 5, pt.z + 25, 32), c);
    box(vec(pt.x + 5, pt.z + 18, 26), vec(pt.x + 5, pt.z + 19, 32), c);
    box(vec(pt.x + 5, pt.z + 11, 26), vec(pt.x + 5, pt.z + 12, 32), c);
    box(vec(pt.x + 24, pt.z + 5, 26), vec(pt.x + 25, pt.z + 6, 32), c);
    box(vec(pt.x + 18, pt.z + 5, 26), vec(pt.x + 19, pt.z + 6, 32), c);
    box(vec(pt.x + 11, pt.z + 5, 26), vec(pt.x + 12, pt.z + 6, 32), c);
    box(vec(pt.x + 5, pt.z + 5, 26), vec(pt.x + 6, pt.z + 6, 32), c);
    cylinder(vec(pt.x, pt.z, 6), 20, 25, 15, darker(w));
    box(vec(pt.x + 10, pt.z + 10), vec(pt.x + 20, pt.z + 20, 6), c);
    box(vec(pt.x + 5, pt.z + 24), vec(pt.x + 5, pt.z + 25, 6), c);
    box(vec(pt.x + 5, pt.z + 18), vec(pt.x + 5, pt.z + 19, 6), c);
    box(vec(pt.x + 5, pt.z + 11), vec(pt.x + 5, pt.z + 12, 6), c);
    box(vec(pt.x + 24, pt.z + 5), vec(pt.x + 25, pt.z + 6, 6), c);
    box(vec(pt.x + 18, pt.z + 5), vec(pt.x + 19, pt.z + 6, 6), c);
    box(vec(pt.x + 11, pt.z + 5), vec(pt.x + 12, pt.z + 6, 6), c);
    box(vec(pt.x + 5, pt.z + 5), vec(pt.x + 6, pt.z + 6, 6), c);
}

function podBase(pt: P5.Vector, h: number, c: P5.Color): void {
    for (let i = 0; i < 10; i++)
        box(vec(pt.x + h - 5 - i, pt.z + h - 5 - i, i),
            vec(pt.x + h - i, pt.z + h - i, i + 1), c);

    for (let i = 0; i < 10; i++) {
        box(vec(pt.x + h - 5 - i, pt.z + i + 1, i),
            vec(pt.x + h - i - 1, pt.z + 5 + i, i + 1), c);
        box(vec(pt.x + i + 1, pt.z + h - 5 - i, i),
            vec(pt.x + 5 + i, pt.z + h - i - 1, i + 1), c);
    }
    for (let i = 0; i < 10; i++)
        box(vec(pt.x + i, pt.z + i, i),
            vec(pt.x + 5 + i, pt.z + 5 + i, i + 1), c);
}

function parabolicAntenna(pt: P5.Vector): void {
    const hgt: number = rdm(20, 35);
    const halfHgt: number = hgt / 2;
    const c: P5.Color = cp.colors.get(Element.STRUCTURE);
    podBase(pt, hgt, c);

    const h: number = rdm(5, 15);
    for (let i = 0; i < h; i++)
        box(vec(pt.x + halfHgt - i, pt.z + halfHgt - i, 10 + i),
            vec(pt.x + halfHgt + 5 + i, pt.z + halfHgt + 5 + i, 10 + i + 1), c);

    box(vec(pt.x + halfHgt - .5, pt.z + halfHgt - .5, 10 + h),
        vec(pt.x + halfHgt + .5, pt.z + halfHgt + .5, 10 + h + halfHgt), c);
}

function eiffel(pt: P5.Vector): void {
    const hgt: number = rdm(20, 35);
    const halfHgt: number = hgt / 2;
    const c: P5.Color = cp.colors.get(Element.STRUCTURE);
    podBase(pt, hgt, c);

    const h: number = rdm(25, 35);
    const p: number = rdm(1, 2);
    for (let i = 2.5 * h; i > 0; i -= p)
        box(vec(pt.x + halfHgt + i / h, pt.z + halfHgt + i / h, 10 + i),
            vec(pt.x + halfHgt + 5 - i / h, pt.z + halfHgt + 5 - i / h, 10 + i + p), c);
    box(vec(pt.x + halfHgt, pt.z + halfHgt, 10),
        vec(pt.x + halfHgt + 5, pt.z + halfHgt + 5, 10 + p), c);
}

function populate(): void {
    const elements: ((Vector) => void)[] = [forest, windowBuilding, squareBuilding, cubeBuilding, rectangleBuilding,
    cylinderBuilding, cylinderOnBaseBuilding, shapeStack, parabolicAntenna, eiffel];

    rdm(elements)(vec(40, 80));
    rdm(elements)(vec(40, 40));

    for (let z = 9; z > 0; z--)
    rdm(elements)(vec(0, z * 40));
    for (let x = 6; x--;)
    rdm(elements)(vec(x * 40, 0));

    if (cp.intersectPos > .65)
    rdm(elements)(vec(0, -65));
}

function city(): void {
    sky();
    ground();
    populate();

    cp.drawer.start();
    if (pause) p5.noLoop();
}

function draw(): void {
    cp.drawer.call();
}

function reset(): void {
    p5.clear();
    p5.loop();
    cp.drawer = new Drawer(nbLinesToDraw);
    resetColor();
    city();
}

function setupP5(p: p5Instance): void {
    p5 = p;
    setP5(p5);
    p5.strokeWeight(2);
    cp = new CityParameters(width, height, new Colors(useColor));
    setGeometryParameters(p5, cp);
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

    resizeP5(): void {
        reset();
    }

    generateUI(): GUIType {
        return this.setupDatGUI({
            properties: {
                "Effect": [
                    menu("Line per iter", nbLinesToDraw, .1, 100, 1, value => {nbLinesToDraw = value; cp.drawer.setStep(value);}),
                    menu("Intersection Position", cp.intersectPos, .05, .95, .01, value => { cp.intersectPos = value; reset(); }),
                    menu("Limit of Sky", cp.skyLimit, .5, .9, .05, value => { cp.skyLimit = value; reset(); }),
                    menu("Ground Position", cp.groundOff, 0, .2, .01, value => { cp.groundOff = value; reset(); }),
                ],
                "Visual & Color": [
                    button("useColor", value => { useColor = value; cp.colors.useColor(value); reset()} ),
                ],
                "Misc": [this.pause(), this.reset(reset)]
            }
        });
    }
}
</script>