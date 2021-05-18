import {P5} from "@/components/P5.vue";
import {BoxDrawable} from "@/arts/util";

// region Particles
export abstract class Particle  implements BoxDrawable {
    // region Attributes
    static INFINITY = "INFINITY";

    protected acc: P5.Vector;
    protected vel: P5.Vector;
    protected pos: P5.Vector;
    protected lifeTime: number;

    private readonly lifeTimeFactor: number;
    // endregion Attributes

    // region Methods
    protected constructor(lifeTime: number | string, lifeTimeFactor=1) {
        if (typeof lifeTime === "string") {
            this.lifeTime = 1;
            this.lifeTimeFactor = 0;
        }
        else {
            this.lifeTime = lifeTime;
            this.lifeTimeFactor = lifeTimeFactor;
        }
    }

    update(deltaTime: number): void {
        this.lifeTime -= this.lifeTimeFactor * deltaTime;
    }

    render(): void {
        console.log("Render");
    }

    renderInBox(cx: number, cy: number, size: number): void {
        console.log("Render In Box");
    }

    isDead(): boolean {
        return this.lifeTime < 0;
    }

    // region Getters
    getAcc(): P5.Vector {
        return this.acc;
    }

    getPos(): P5.Vector {
        return this.pos;
    }

    getVel(): P5.Vector {
        return this.vel;
    }

    getLifeTime(): number {
        return this.lifeTime;
    }
    // endregion Getters
    // region Setters
    setAcc(acc: P5.Vector): void {
        this.acc = acc;
    }

    setPos(pos: P5.Vector): void {
        this.pos = pos;
    }

    setVel(vel: P5.Vector): void {
        this.vel = vel;
    }
    // endregion Setters
    // endregion Methods
}

export class Particles {
    // region Attributes
    private particles: Array<Particle>;
    private original: Array<Particle>;
    // endregion Attributes

    // region Methods
    constructor() {
        this.particles = [];
    }

    addParticle(...p: Particle[]): void {
        this.particles = this.particles.concat(p);
        this.original = [...this.particles];
    }

    reset(): void {
        this.particles = [...this.original];
    }

    update(deltaTime: number): void {
        this.particles.forEach(p => {
            if (p.isDead())
                this.particles.slice(this.particles.indexOf(p), 1);
            else
                p.update(deltaTime);
        });
    }

    render(): void {
        this.particles.forEach(p => p.render());
    }

    renderInBox(cx: number, cy: number, size: number): void {
        this.particles.forEach(p => p.renderInBox(cx, cy, size));
    }

    // region Getters
    getParticles(): Array<Particle> {
        return this.particles;
    }
    // endregion Getters
    // endregion Methods
}
// endregion Particles
