import {P5, p5Instance} from "@/components/P5.vue";
import {time} from "@/arts/art";

// Inspired by https://openprocessing.org/sketch/1166100

export abstract class Chromatic {
    // region Attributes
    private prev: P5.Vector;
    private curr: P5.Vector;
    private next: P5.Vector;
    private prevRot: number;
    private currRot: number;
    private nextRot: number;
    private colors = ["#f00", "#0f0", "#00f"];
    private positions: Array<P5.Vector>;
    private rotations: Array<number>;
    private readonly subSamples: number;
    // endregion Attributes
    // region Methods
    constructor(subSamples=3) {
        this.next = this.curr = this.prev = new P5.Vector();
        this.nextRot = this.currRot = this.prevRot = 0;
        this.positions = [this.prev, this.curr, this.next];
        this.rotations = [this.prevRot, this.currRot, this.nextRot];
        this.subSamples = subSamples;
    }

    update(time: number): void {
        this.prev = this.curr;
        this.curr = this.next;
        this.next = this.computePos(time);
        this.prevRot = this.currRot;
        this.currRot = this.nextRot;
        this.nextRot = this.computeRot(time);
        this.positions = [this.prev, this.curr, this.next];
        this.rotations = [this.prevRot, this.currRot, this.nextRot];
    }

    getPositionOn(p5: p5Instance, id: number, subSample: number) {
        return P5.Vector.lerp(this.positions[id], this.positions[(id + 1) % 3], subSample / this.subSamples);
    }

    getRotationOn(p5: p5Instance, id: number, subSample: number) {
        return p5.lerp(this.rotations[id], this.rotations[(id + 1) % 3], subSample / this.subSamples);
    }

    render(p5: p5Instance, cx: number, cy: number, size: number): void {
        p5.blendMode(p5.ADD);
        for (let i = 0; i < this.subSamples; i++) {
            for (let id = 0; id < 3; id++) {
                p5.push();
                p5.translate(cx, cy);
                p5.rotate(this.getRotationOn(p5, id, i));
                const color: P5.Color = p5.color(this.colors[id]);
                color.setAlpha(255 / this.subSamples);
                p5.fill(color);
                p5.stroke(color);
                this.draw(this.getPositionOn(p5, id, i) as unknown as P5.Vector, size);
                p5.pop();
            }
        }
        this.update(time);
        p5.blendMode(p5.BLEND);
    }


    /**
     * Compute newt position
     * @param time
     */
    protected abstract computePos(time: number): P5.Vector;

    /**
     * Compute next rotation in degrees
     * @param time
     */
    protected abstract computeRot(time: number): number;

    abstract draw(p: P5.Vector, size: number): void;
    // endregion Methods
}