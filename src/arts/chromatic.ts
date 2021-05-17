import {Particle} from "@/arts/particles";
import {P5} from "@/components/P5.vue";

export abstract class Chromatic extends Particle {
    // region Attributes
    private prev: P5.Vector;
    private next: P5.Vector;
    // endregion Attributes
    // region Methods
    protected constructor(lifeTime: number | string, lifeTimeFactor=1) {
        super(lifeTime, lifeTimeFactor);
        this.prev = this.computePos(0);
        this.pos = this.prev;
        this.next = this.pos;
    }

    update(deltaTime: number): void {
        this.prev = this.pos;
        this.pos = this.next;
        this.next = this.computePos(deltaTime);
        super.update(deltaTime);
    }

    abstract computePos(deltaTime: number): P5.Vector;
    // endregion Methods
}