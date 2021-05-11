import * as GIF from "gif.js";
import * as download from "downloadjs";
import {Vue} from "vue-class-component";
import {GUI, GUIController} from "dat.gui";
import {width, height, p5Instance} from "@/components/P5.vue";

// region Dat.GUI
// region Types
type DatFunction = (...unknown) => void;

export class DatProperties {
    public readonly name: string;
    public readonly otherName: string;
    public readonly min: number;
    public readonly max: number;
    public readonly step: number;
    public readonly onChange: DatFunction;
    private click: boolean;
    public readonly list: Array<unknown>;
    private readonly color: boolean;

    constructor(name: string, otherName: string, min: number, max: number, step: number,
                onChange: DatFunction, list?: Array<unknown>, color?: boolean, click = false) {
        this.name = name;
        this.otherName = otherName;
        this.click = click;
        this.min = min;
        this.max = max;
        this.step = step;
        this.onChange = onChange;
        this.list = list;
        this.color = color !== undefined ? color : false;
    }

    addOn(folder: GUI): void {
        console.log("Add new parameters", this.name, "in folder", folder.name);
        if (this.otherName !== undefined) {
            //  Button named
            const button: GUIController = folder.add(datParams, this.name).onChange(() => {
                this.click = ! this.click;
                button.name(this.click ? this.otherName : this.name);
                this.onChange(this.click, button);
            })
        }
        else {
            let menu: GUIController;
            if (this.min !== undefined && this.max !== undefined && this.step !== undefined)
                menu = folder.add(datParams, this.name, this.min, this.max, this.step);
            else if (this.color)
                menu = folder.addColor(datParams, this.name);
            else if (this.list !== undefined)
                menu = folder.add(datParams, this.name, this.list)
            else
                menu = folder.add(datParams, this.name);
            if (menu !== undefined && this.onChange !== undefined)
                menu.onChange(v => this.onChange(v) );
        }
    }
}

export interface DatObject {
    properties: Record<string, Array<DatProperties>>
}
// endregion Types

export function menu(name: string, def: unknown, min: number, max: number, step: number, onChange?: DatFunction): DatProperties {
    addElement(name, def);
    return new DatProperties(name, undefined,  min, max, step, onChange);
}

export function color(name: string, def: unknown, onChange?: DatFunction): DatProperties {
    addElement(name, def);
    return new DatProperties(name, undefined, undefined, undefined, undefined,
        onChange,undefined,true);
}

export function text(name: string, def: unknown, onChange?: DatFunction): DatProperties {
    addElement(name, def);
    return new DatProperties(name, undefined, undefined, undefined, undefined,
        onChange,undefined,false);
}

export function button(name: string, onChange: DatFunction): DatProperties {
    addElement(name, () => undefined);
    return new DatProperties(name,undefined, undefined, undefined, undefined, onChange);
}

export function switchButton(name: string, otherName: string, onChange: DatFunction, click = false): DatProperties {
    addElement(name, () => undefined);
    return new DatProperties(name, otherName, undefined, undefined, undefined, onChange,
        undefined, undefined, click);
}

export function list(name: string, def: unknown, values: Array<unknown>, onChange: DatFunction): DatProperties {
    addElement(name, def);
    return new DatProperties(name, undefined, undefined, undefined, undefined, onChange, values);
}

let datParams: Record<string, unknown> = {};

function addElement(name: string, value: unknown): void {
    const el = {};
    el[name] = value;
    datParams = Object.assign(datParams, el);
}
// endregion Dat.GUI

let p5: p5Instance;
let counter: number;
export abstract class ArtVue extends Vue {
    // region Attributes
    // Dat Gui elements
    protected gui: GUI;
    private elements: Record<string, unknown>;
    private recordButton: GUIController;

    // P5 elements
    private debug: boolean;
    protected p5: p5Instance;

    // P5 records
    private canvas: CanvasRenderingContext2D;
    private gif: GIF;
    private startRec: number;
    private fps: number;
    // endregion Attributes

    mounted(): void {
        this.elements = {};
        this.gui = this.generateUI();
    }

    setupP5(p: p5Instance): void {
        this.p5 = p5 = p;
        this.debug = false;
        counter = 0;
        this.fps = -1;
        this.canvas = document.getElementById("defaultCanvas0") as unknown as CanvasRenderingContext2D;
    }

    drawP5(p: p5Instance): void {
        if (this.debug) console.log("Draw at", p.millis());
        this.computeIfFinish();
        if (this.gif)
            this.gif.addFrame(this.canvas, {
                delay: 1000 / fps,
                copy: true
            });
        counter++;
        time = counter / fps;
    }

    resetP5(): void {
        counter = 0;
        this.startRec = -1;
        if (this.recordButton)
            this.recordButton.name("Start Record");
    }

    abstract generateUI(): GUI;

    private generate(datObject: DatObject): void {
        Object.entries(datObject.properties).map(values => {
            const [folderName, properties] = values;
            console.log("Add new Folder", folderName);
            const folder = this.gui.addFolder(folderName);
            properties.map(value => value.addOn(folder));
            folder.open();
        });
    }

    setupDatGUI(datParams: DatObject): GUI {
        console.log("Setup dat gui");
        this.gui = new GUI();
        this.generate(datParams);
        this.setupSaving();
        return this.gui;
    }

    private setupSaving(): void {
        this.generate({
            properties: {
                "Save": [
                    button("Screenshot", () => this.p5.saveCanvas(this.$route.meta.title as string, "png")),
                    switchButton("Start Record", "Stop Record", (value, recordButton) => {
                        this.record(value);
                        this.recordButton = recordButton;
                    })
                ]
            }
        });
    }

    private record(state: boolean): void {
        if (state === true) {
            this.gif = new GIF({
                workers: 4,
                workerScript: process.env.BASE_URL + "gif.worker.js",
                quality: 10,
                width: width,
                height: height
            });
            this.startRec = counter;
            const name = this.$route.meta.title as string;
            this.gif.on("finished", function(blob: Blob) {
                download(blob, name);
            });
        }
        else {
            this.gif.render();
            this.gif = undefined;
            this.startRec = -1;
        }
    }

    private computeIfFinish(): void {
        if (this.startRec != -1 && loopTime != -1 && (counter - this.startRec) >= (loopTime * fps))
            this.recordButton.fire();
    }

    pause(): DatProperties {
        return switchButton("Pause", "Play", value => this.pauseP5(value));
    }

    private pauseP5(value: boolean): void {
        pause = value;
        value ? this.p5.noLoop() : this.p5.loop();
    }

    seed(onChange?: (seed: number) => void, initialSeed=1): DatProperties {
        return menu("seed", initialSeed, 1, 100000, 1,
                value => {
            seed = value;
            if (onChange !== undefined)
                onChange(value)
        })
    }

    randomizeSeed(onChange?: (seed: number) => void): void {
        seed = ~~(this.p5.random() * 100000);
        if (onChange !== undefined)
            onChange(seed);
    }

    reset(resetFunction: () => void): DatProperties {
        this.resetP5();
        return button("Reset", resetFunction);
    }

    unmounted(): void {
        console.log("Unmount Art");
        this.gui.destroy();
        this.p5.removeElements();
    }
}

export function setFramerate(value: number): void {
    fps = value;
    p5.frameRate(fps);
}

export function setLoopTime(seconds: number): void {
    loopTime = seconds;
}

export function resetTime(): void {
    counter = 0;
}

export let pause = false;
export let seed = 1;
export let time = 0;
export let fps = 30;
export let loopTime = -1;

export type GUIType = GUI;
