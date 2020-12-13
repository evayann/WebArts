import * as dat from 'dat.gui';
import * as P5 from 'p5';

// Recreate from gif : https://jacobjoaquin.tumblr.com/post/108139240121/red-yellow-spiral-tunnel-built-with-processing

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let centerX: number = width / 2;
let centerY: number = height / 2;

let p5: P5;
let sColor: string = "#8d8585";
let fColor: string = "#0a0e15";
let tColor: string = "#efefef";
let fromColor: P5.Color;
let toColor: P5.Color;
let strokeColor: P5.Color;
let strokeSize: number = 1.7;

let counter: number = 0;

let cycle: number = 60;
let startPos: number[];
let move: number = 10;

let distanceBetweenDepth: number = 50;

let speedFactor: number = 1
let cycleFactor: number = 1;
let globalDepth: number;
let elementPerDepth: number = 8;
let angleRotation: number;

let pause: boolean = false;

let coloredPositions: number[][] = [];

function computeColor(currDepth: number, el: number): P5.Color {
    const toDist = (d, e) => d * elementPerDepth + e;
    let distance: number = toDist(currDepth, el);
    let distanceColor: number = toDist(globalDepth, elementPerDepth - 1);

    for (let [d, e] of coloredPositions) {
        let dist: number = distance - toDist(d, e);
        if (dist >= 0)
            distanceColor = Math.min(distanceColor, dist);
    }

    return p5.lerpColor(toColor, fromColor, distanceColor / toDist(-startPos[0], startPos[0]));//toDist(globalDepth, elementPerDepth - 1));
}

function incrementCurrentPostion(): void {
    coloredPositions.forEach(([d, el], i) =>  {
        // Increment position
        (el == elementPerDepth - 1) ?
            coloredPositions[i] = [d + 1, 0] : coloredPositions[i] = [d, el + 1];

        // Remove overlaps elements
        if (d > globalDepth)
            coloredPositions.splice(i, 1);
    });
    // Add new element periodically before the first squares
    if (counter % (cycle / cycleFactor) == 0)
        coloredPositions.push(startPos);
    // Increment counter
    counter += 1;
}

function square(depth: number, depthIndex: number, offset: number, start: number): void {
    for (let j = start; j < elementPerDepth; j += 2) {
        p5.fill(computeColor(depthIndex, j))
        p5.rect(0, depth + 25 + offset, depth * 3, depth);
        p5.rotate(angleRotation * 2);
    }
}

function draw(): void {
    p5.clear();

    p5.frameRate(60 * speedFactor);
    p5.stroke(strokeColor);
    p5.strokeWeight(strokeSize);
    p5.background("black");

    p5.translate(centerX, centerY);
    for (let i: number = distanceBetweenDepth; i <= globalDepth * distanceBetweenDepth; i += distanceBetweenDepth) {
        let depthIndex: number = i / distanceBetweenDepth;
        square(i, depthIndex, 0, 0);
        p5.rotate(angleRotation);
        square(i, depthIndex, move, 1);
        p5.rotate(-angleRotation);
    }
    incrementCurrentPostion();
}

function resetPosition(): void {
    startPos = [-Math.floor(cycle / elementPerDepth), cycle % elementPerDepth];
}

function reset(): void {
    coloredPositions = [];
    angleRotation = 360 / elementPerDepth;
    globalDepth = Math.max(height / distanceBetweenDepth, width / distanceBetweenDepth);
    resetPosition();
}

function setupP5(p: P5): void {
    p5 = p;
    strokeColor = p5.color(sColor);
    fromColor = p5.color(fColor);
    toColor = p5.color(tColor);
    p.createCanvas(width, height);
    p.rectMode(p.CENTER);
    p.angleMode(p.DEGREES);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        cycle: cycleFactor,
        speed: speedFactor,
        space: distanceBetweenDepth,
        strokeSize: strokeSize,
        fromColor: fColor,
        toColor: tColor,
        strokeColor: sColor,
        nbElement: elementPerDepth,
        move: move,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "cycle",0.5, 2, 0.01)
        .onChange(value => {
            cycleFactor = value;
            resetPosition();
        })
        .name("CycleFactor");
    guiEffect
        .add(params, "speed",0.1, 1, 0.01)
        .onChange(value => speedFactor = value)
        .name("SpeedFactor");
    guiEffect
        .add(params, "nbElement",2, 32, 2)
        .onChange(value => {
            elementPerDepth = value;
            reset();
        });
    guiEffect
        .add(params, "space",20, 100, 1)
        .onChange(value => {
            distanceBetweenDepth = value;
            reset();
        });
    guiEffect
        .add(params, "move",0, 50, 1)
        .onChange(value => {
            move = value;
            reset();
        });
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.add(params, "strokeSize", 0.1, 5, 0.1)
        .onChange(value => {
            strokeSize = value;
            draw();
        });
    guiVisual.addColor(params, "toColor")
        .onChange(value => {
            toColor = p5.color(value);
            draw();
        });
    guiVisual.addColor(params, "fromColor")
        .onChange(value => {
            fromColor = p5.color(value);
            draw();
        });
    guiVisual.addColor(params, "strokeColor")
        .onChange(value => {
            strokeColor = p5.color(value);
            draw();
        });
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
    p5.resizeCanvas(width, height);
    draw();
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
