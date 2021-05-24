import {height, p5Instance, width} from "@/components/P5.vue";

export interface BoxDrawable {
    renderInBox(cx: number, cy: number, size: number);
}

export abstract class BoxGrid {
    protected effects: Array<BoxDrawable>;
    protected nbElements: number;
    protected halfElements: number;
    protected blockSizeFactor: number;

    constructor(nbElements=3, blockSizeFactor=1) {
        this.reset(nbElements, blockSizeFactor);
    }

    reset(nbElements: number, blockSizeFactor=1): void {
        this.effects = [];
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
                        (y - this.halfElements) * blockSize + pos, (blockSize / 2) * this.blockSizeFactor);
    }
}

// export function randomAveragePixel(p5: p5Instance): void {
//     const rdmAvg = (i: number) => {
//       const r = p5.random(-30, 30);
//       return p5.color((p5.red(p5.pixels[i]) + r) % 255,
//           (p5.green(p5.pixels[i]) + r) % 255,
//           (p5.blue(p5.pixels[i]) + r) % 255);
//     };
//     p5.loadPixels();
//     range(p5.width * p5.height).map(i => p5.pixels[i] = rdmAvg(i));
//     p5.updatePixels();
// }

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