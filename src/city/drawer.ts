import * as P5 from 'p5';

// region Attributes
let p5: P5;

/**
 * Useful little function
 */
export const setP5: Function = (_p5) => p5 = _p5; // Need to call first
export const rdm: Function = (min, max?): number => p5.random(min, max);

// region Colors
export enum Element {
    STROKE,
    SUN,
    SKY,
    GROUND,
    TREE,
    WINDOW,
    STRUCTURE,
    STRUCTURE_DARKER
}

export class Colors {
    private uColor: boolean;
    private colors: Map<Element, P5.Color[]>;

    constructor(useColor: boolean = true) {
        this.uColor = useColor;
        this.colors = new Map();
        this.colors.set(Element.STROKE, [p5.color("#000000")]);
        this.colors.set(Element.SUN, [p5.color("#ded40d")]);
        this.colors.set(Element.SKY, [p5.color("#327be9")]);
        this.colors.set(Element.GROUND, [p5.color("#282318")]);
        this.colors.set(Element.TREE, [p5.color("#3d720f"), p5.color("#3d720f"), p5.color("#74ba34")]);
        this.colors.set(Element.WINDOW, [p5.color("#84ace2"), p5.color("#57e6fa"), p5.color("#7fb7cb")]);
        this.colors.set(Element.STRUCTURE, [p5.color("#67605e"), p5.color("#6b7c7c"), p5.color("#99b7b6")]);
        this.colors.set(Element.STRUCTURE_DARKER, [p5.color("#473e3c"), p5.color("#1e2929"), p5.color("#2b2b21")]);
    }

    useColor(value: boolean): void {
        this.uColor = value;
    }

    get(element: Element): P5.Color {
        if (this.uColor != true)
            return (element == Element.STROKE) ? p5.color("black") : p5.color("white");
        else
            return rdm(this.colors.get(element));
    }
}

export function resetColor(): void {
    p5.noStroke();
    p5.noFill();
}

export const fill: Function = (v): void => {p5.fill(v);};
export const stroke: Function = (v): void => {p5.stroke(v);};
// endregion Colors

// region Draw Elements
export class Action {
    private readonly action: Function;
    private readonly data: Array<any>;

    constructor(action: Function, ...data: any[]) {
        this.action = action;
        this.data = data;
    }

    do() {
        this.action(...this.data);
    }
}

export function action(fct: Function, ...data: any[]): Action {
    return new Action(fct, ...data);
}

export class Drawer extends Array<Action> {
    private curr: number;
    private iterOn: IterableIterator<Action>;
    private step: number;

    constructor(step: number) {
        super();
        this.curr = 0;
        this.setStep(step);
    }

    setStep(step: number): void {
        this.step = step;
    }

    start(): void {
        this.iterOn = this.values();
    }

    call(): void {
        if (this.curr == this.length)
            return;

        let startAt: number = this.curr.valueOf();
        while (this.curr < startAt + this.step && this.curr <= this.length) {
            this.curr++;
            let a: IteratorResult<Action, any> = this.iterOn.next();
            if (! a.done)
                a.value.do();
            else
                p5.noLoop(); // End
        }
    }
}
// endregion Draw Elements