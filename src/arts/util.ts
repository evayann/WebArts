import {height, p5Instance, width} from "@/components/P5.vue";

export interface BoxDrawable {
    renderInBox(cx: number, cy: number, size: number);
}

export abstract class BoxGrid {
    protected effects: Array<BoxDrawable>;
    protected nbElements: number;
    private offset: boolean;
    private halfElements: number;
    private blockSizeFactor: number;

    constructor(nbElements=3, blockSizeFactor=1, offset=false) {
        this.reset(nbElements, blockSizeFactor, offset);
    }

    reset(nbElements: number, blockSizeFactor=1, offset=false): void {
        this.effects = [];
        this.offset = offset;
        this.nbElements = nbElements;
        this.halfElements = ~~(nbElements / 2);
        this.blockSizeFactor = blockSizeFactor;
        this.addDrawables();
    }

    abstract addDrawables(): void;

    render(): void {
        const blockSize: number = (Math.min(width, height) - 40) / this.nbElements;
        const pos: number = this.nbElements % 2 == 0 ? blockSize / 2 : 0;
        for (let y = 0; y < this.nbElements; y++)
            for (let x = 0; x < this.nbElements; x++)
                this.effects[x * this.nbElements + y]
                    .renderInBox((x - this.halfElements) * blockSize + pos,
                        (y - this.halfElements) * blockSize + pos + (this.offset && x % 2 == 0 ? blockSize / 2 : 0),
                        (blockSize / 2) * this.blockSizeFactor);
    }
}

export function parseColor(colors: string, split=" "): Array<string> {
    return colors.split(split).map((value, index, array) => array[index] = "#" + value);
}

function meanOn(p5: p5Instance, xStart: number, yStart: number, xSize: number, ySize: number): number[] {
    let r = 0, g = 0, b = 0;
    let counter = 0;
    for (let x = xStart; x < xStart + xSize; x++) {
        for (let y = yStart; y < yStart + ySize && y < p5.height; y++) {
            const p = (y * p5.width + x) * 4;
            r += p5.pixels[p];
            g += p5.pixels[p + 1];
            b += p5.pixels[p + 2];
            counter++;
        }
    }
    return [r / counter, g / counter, b / counter];
}

export function randomAveragePixel(p5: p5Instance, maxNoise, xSize=1, ySize=1): void {
    p5.loadPixels();
    const mod = v => v < 0 ? 0 : v % 255;
    range(p5.width, xSize).forEach(x => range(p5.height, ySize).forEach(y => {
        const [r, g, b] = meanOn(p5, x, y, xSize, ySize);
        const rdm = p5.random(-maxNoise, maxNoise);
        p5.set(x, y, [mod(r + rdm), mod(g + rdm), mod(b + rdm) , 255]);
    }));
    p5.updatePixels();
}

export function shuffle<T>(array: Array<T>): Array<T> {
    for (let i = array.length - 1; i--;) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function range(end: number, step=1, start=0): Array<number> {
    function* generateRange() {
        let x = start - step;
        while(x < end - step) yield x += step;
    }
    return [...generateRange()];
}