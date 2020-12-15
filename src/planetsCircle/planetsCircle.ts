import * as dat from 'dat.gui';
import * as P5 from 'p5';

// From https://github.com/cmllngf/planet_1/blob/master/sketch.js by cmllngf

let width: number = window.innerWidth;
let height: number = window.innerHeight;

let p5: P5;
let bColor: string = "#000000";
let backgroundColor: P5.Color;
let colorFactor: number = 1;
let alpha: number = 90;

let nbPlanets: number = 8;
let useBelt: boolean = true;
let beltProba: number = 0.5;
let useMoon: boolean = true;
let moonProba: number = 0.5;
let maxSize: number = 100;
let minSize: number = 20;
let rotateSpeedFactor: number = 1;

let pause: boolean = false;

let seed: number = 0;
let fps: number = 60;
let t = 0;
let planets: Array<Planet> = new Array<Planet>();

class Planet {

    private readonly centerX: number;
    private readonly centerY: number;
    private readonly precision: number;
    private readonly radius: number;
    private readonly rotateSpeed: number;
    private readonly beltYAxis: number;

    private readonly colored: number;
    private readonly computePosition: Function;
    private readonly computePositions: Function;

    constructor (center: number[], radius: number, precision: number, rotateSpeed: number, beltYAxis: number) {
        [this.centerX, this.centerY] = center;
        this.radius = radius;
        this.precision = precision;
        this.rotateSpeed = rotateSpeed;
        this.beltYAxis = beltYAxis;
        this.colored = p5.random(360);
        this.computePosition = () => p5.random(p5.TWO_PI) + t * this.rotateSpeed * rotateSpeedFactor;
        this.computePositions = () => {
            let y: number = p5.random(-1, 1); // Line sponsored by https://github.com/TheNicolas190
            return [this.computePosition(), y, p5.sqrt(1 - y * y)];
        }
    }

    draw(): void {
        // Planet
        for (let i = 0; i < this.precision; i++) {
            let [a, y, r] = this.computePositions();
            let z: number = p5.sin(a);
            p5.stroke(p5.noise(y * colorFactor + this.colored) * 360, 255, 255);
            if (z > 0)
                p5.point(p5.cos(a) * this.radius * r + this.centerX, y * this.radius + z * r * 5 + this.centerY);
        }

        // Belt
        if(useBelt && p5.random() < beltProba) {
            for (let j = 0; j < p5.random(6); j++) {
                let beltColor: P5.Color = p5.color(p5.random(360), p5.random(20, 50), p5.random(30, 70));
                p5.stroke(beltColor);

                let nbBelts: number = p5.random(200, 500);
                let stepX: number = 60;
                let stepY: number = 5;

                for (let i = 0; i < nbBelts; i++) {
                    let rx: number = p5.random(-30 + stepX * j, -30 + stepX * j + stepX);
                    let ry: number = p5.random(-5 + stepY * j, -5 + stepY * j + stepY);
                    let a: number = this.computePosition();
                    let xpos: number = p5.cos(a) * (this.radius * 2 + rx) + this.centerX;
                    let ypos: number = p5.sin(a) * (this.radius + this.beltYAxis + ry) + this.centerY;
                    if (ypos > this.centerY || p5.dist(this.centerX, this.centerY, xpos , ypos) > this.radius + 5) {
                        p5.point(xpos, ypos);
                    }
                }
            }
        }

        // Moons
        if (!useMoon || p5.random() > moonProba)
            return;

        let halfSpeedRotate: number = (rotateSpeedFactor / 2);
        for (let i = 0; i < 1; i++) {
            let start: number = p5.random(p5.TWO_PI);
            let yoff: number = p5.random(-75, 75);
            let yAxis: number = p5.random(-10, 10);
            let size: number = p5.random(10, this.radius / 3);
            let speedFactor: number = p5.random(0.5, 1.5);
            p5.stroke(p5.color(p5.random(360), p5.random(70, 100), p5.random(40,70)));
            for (let j = 0; j < p5.random(60, 160); j++) {
                let [a, y, r] = this.computePositions();
                let z: number = p5.sin(a);
                let zpos: number = p5.sin(t * speedFactor * halfSpeedRotate + start);
                let xpos: number = p5.cos(a) * size * r + p5.cos(t * speedFactor * halfSpeedRotate + start) * 250 + this.centerX;
                let ypos: number = y * size + z * r * 5 + (this.centerY + yoff) + zpos * 25 * yAxis;
                if (z > 0 && (zpos > 0 || p5.dist(this.centerX, this.centerY, xpos , ypos) > this.radius))
                    p5.point(xpos, ypos);
            }
        }
    }
}

function draw(): void {
    p5.stroke(backgroundColor);
    p5.fill(backgroundColor);
    p5.rect(0, 0, width, height);

    p5.randomSeed(seed);
    p5.strokeWeight(1);
    // Little stars
    for (let i = 0; i < 500; i++) {
        let x: number, y;
        do {
            x = p5.random(width);
            y = p5.random(height);
        } while(p5.dist(width / 2, height / 2, x, y) < 55);
        p5.stroke(p5.random(360), p5.random(0, 20), p5.random(60, 100));
        p5.point(x, y);
    }

    p5.strokeWeight(2);
    for (let p of planets)
        p.draw();

    t += 1 / fps;
}


function reset(): void {
    p5.randomSeed(seed);
    p5.noiseSeed(seed);
    planets = new Array<Planet>();
    t = 0;
    let space: number = width / (nbPlanets);
    let halfSpace: number = space / 2;
    for (let i = 0; i < nbPlanets; i++)
        planets.push(new Planet([space * i + halfSpace, p5.random(height / 4, 3 * (height / 4))], p5.random(minSize, maxSize),
            p5.random(150, 750), p5.random(0.1, 2), p5.random(-45, 45)));

    draw();
}

function setupP5(p: P5): void {
    p5 = p;
    backgroundColor = p5.color(bColor);
    backgroundColor.setAlpha(alpha);
    p.createCanvas(width, height);
    p5.frameRate(fps);
    p5.colorMode(p5.HSB);
    reset();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        nbPlanets: nbPlanets,
        maxSize: maxSize,
        minSize: minSize,
        alpha: alpha,
        seed: seed,
        colorFactor: colorFactor,
        rotateSpeedFactor: rotateSpeedFactor,
        useBelt: useBelt,
        useMoon: useMoon,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        },
        reset: () => {
            reset();
        }};

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "nbPlanets",1, 20, 1)
        .onChange(value => {
            nbPlanets = value;
            reset();
        });
    guiEffect
        .add(params, "maxSize", 50, 100, 1)
        .onChange(value => {
            maxSize = value;
            reset();
        });
    guiEffect
        .add(params, "minSize",10, 50, 1)
        .onChange(value => {
            minSize = value;
            reset();
        });
    guiEffect
        .add(params, "useBelt")
        .onChange(value => {
            useBelt = value;
            reset();
        });
    guiEffect
        .add(params, "useMoon")
        .onChange(value => {
            useMoon = value;
            reset();
        });
    guiEffect
        .add(params, "rotateSpeedFactor", 0.1, 50, 0.1)
        .onChange(value => rotateSpeedFactor = value);
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.add(params, "alpha", 0, 255, 1)
        .onChange(value => {
            alpha = value;
            backgroundColor.setAlpha(alpha);
        });
    guiVisual
        .add(params, "colorFactor", 0, 50, 1)
        .onChange(value => colorFactor = value);
    guiVisual.open();

    const guiMisc = gui.addFolder("Misc");
    let ps = guiMisc
        .add(params, "pause")
        .name("Pause")
        .onChange(() => (! pause) ? ps.name("Play") : ps.name("Pause"));
    guiMisc
        .add(params, "seed")
        .onChange(value => {
            seed = value;
            reset();
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
