import * as dat from 'dat.gui';
import * as P5 from 'p5';

let width: number = window.innerWidth;
let height: number = window.innerHeight;
let halfWidth: number = width / 2;
let halfHeight: number = height / 2;

let p5: P5;

let shaderGraph: P5.Graphics;
let shader: P5.Shader;

let pause: boolean = false;
let speed: number = 1;
let bColor: string = "#ca365c";
let clamping: number = 1.5;
let ballColor: P5.Color;
let displayCircle: boolean = false;

let balls: Balls;

const parseColor: Function = (color) => [p5.red(color) / 255, p5.green(color) / 255, p5.blue(color) / 255];


class Ball {
    private pos: P5.Vector;
    private readonly vel: P5.Vector;
    private readonly radius: number;

    constructor(x: number, y: number, radius: number) {
        this.pos = p5.createVector(x, y);
        this.vel = p5.createVector(p5.random(-5, 5), p5.random(-5, 5));
        this.radius = radius;
    }

    update(): void {
        this.pos.add(P5.Vector.mult(this.vel, speed));
        if (this.pos.x > halfWidth || this.pos.x < -halfWidth) this.vel.x *= -1;
        if (this.pos.y > halfHeight || this.pos.y < -halfHeight) this.vel.y *= -1;
    }

    draw(): void {
        p5.noFill();
        p5.stroke("white");
        p5.circle(this.pos.x, this.pos.y, this.radius);
    }

    static getX(b: Ball): number {
        return b.pos.x;
    }

    static getY(b: Ball): number {
        return b.pos.y;
    }

    static getR(b: Ball): number {
        return b.radius;
    }
}

class Balls {
    balls: Array<Ball>;
    constructor(nbBalls: number) {
        this.balls = [];
        let size = Math.min(width, height);
        for (let i = nbBalls; i--;)
            this.balls.push(new Ball(p5.random(-halfWidth, halfWidth), p5.random(-halfHeight, halfHeight), p5.random(size / 8, size / 2)));
    }

    update(): void {
        this.balls.forEach(b => {
            b.update();
            if (displayCircle)
                b.draw();
        });
    }

    len(): number {
        return this.balls.length;
    }

    get(f: Function): Array<number> {
        let elements = [];
        this.balls.forEach(b => elements.push(f(b)));
        return elements;
    }

    getXs(): Array<number> {
        return this.get(Ball.getX);
    }

    getYs(): Array<number> {
        return this.get(Ball.getY);
    }

    getRs(): Array<number> {
        return this.get(Ball.getR);
    }
}

function drawBalls(): void {
    shaderGraph.shader(shader);
    shader.setUniform("color", parseColor(ballColor));
    shader.setUniform("clamping", clamping);
    shader.setUniform("width", width);
    shader.setUniform("height", height);
    shader.setUniform("ballsX", balls.getXs());
    shader.setUniform("ballsY", balls.getYs());
    shader.setUniform("ballsR", balls.getRs());
    shaderGraph.plane(width, height);
    p5.image(shaderGraph, 0, 0, width, height);
}

function draw(): void {
    drawBalls();
    balls.update();
}

function preload(p: P5) {
    p5 = p;
    shaderGraph = p5.createGraphics(width, height, p5.WEBGL);
    shaderGraph.noStroke();
    let vert =
        `#ifdef GL_ES
        precision highp float;
        precision highp int;
        #endif
        
        varying vec2 vPos;
        attribute vec3 aPosition;
        
        void main() {
            vec4 pos = vec4(aPosition, 1.0);
            pos.xy *= 2.0;
            vPos = (gl_Position = pos).xy;
        }`;
    let frag =
        `#ifdef GL_ES
        precision highp float;
        #endif
        
        #define MAX_BALLS 20
        
        varying vec2 vPos;
        uniform vec3 color;
        uniform float width;
        uniform float height;
        uniform float clamping;
        uniform float ballsX[MAX_BALLS];
        uniform float ballsY[MAX_BALLS];
        uniform float ballsR[MAX_BALLS];
        
        void main() {
            float sum = 0.0;
            for (int i = 0; i < MAX_BALLS; i++) {
                float xDiff = vPos.x * width - ballsX[i] * 2.0;
                float yDiff = -vPos.y * height - ballsY[i] * 2.0;
                sum += (0.25 * ballsR[i]) / sqrt(xDiff * xDiff + yDiff * yDiff);
            }
            gl_FragColor = vec4(color * clamp(sum, 0.0, clamping), 1.0);
        }`;
    shader = shaderGraph.createShader(vert, frag);
}

function setupP5(): void {
    p5.pixelDensity(1);
    p5.createCanvas(width, height, p5.WEBGL);
    p5.createCanvas(width, height);
    p5.rectMode(p5.CENTER);
    p5.imageMode(p5.CENTER);
    balls = new Balls(~~p5.random(10, 20));
    ballColor = p5.color(bColor);
    draw();
}

function setupDatGUI(): void {
    const gui = new dat.GUI();
    const params = {
        displayCircle: displayCircle,
        clamping: clamping,
        bColor: bColor,
        speed: speed,
        pause: () => {
            pause = ! pause;
            (pause) ? p5.noLoop() : p5.loop();
        }
    };

    const guiEffect = gui.addFolder("Effect & Speed");
    guiEffect
        .add(params, "speed",0.1, 10, 0.1)
        .onChange(value => speed = value);
    guiEffect
        .add(params, "clamping",1, 3, .01)
        .onChange(value => clamping = value)
        .name("Shiny");
    guiEffect
        .add(params, "displayCircle")
        .onChange(value => displayCircle = value);
    guiEffect.open();

    const guiVisual = gui.addFolder("Visual & Color");
    guiVisual.addColor(params, "bColor")
        .onChange(value => ballColor = p5.color(value));
    guiVisual.open();

    const guiMisc = gui.addFolder("Misc");
    let ps = guiMisc
        .add(params, "pause")
        .name("Pause")
        .onChange(() => (! pause) ? ps.name("Play") : ps.name("Pause"));
    guiMisc.open();
}

function resize(): void {
    width = window.innerWidth;
    height = window.innerHeight;
    halfWidth = width / 2;
    halfHeight = height / 2;
    p5.resizeCanvas(width, height);
    draw();
}

window.onresize = resize;

window.onload = () => {
    let sketch = (p: P5) => {
        p.preload = () => {
            preload(p);
        }

        p.setup = () => {
            setupP5();
        }

        p.draw = () => {
            draw();
        };
    }
    p5 = new P5(sketch);
    setupDatGUI();
    resize();
}
