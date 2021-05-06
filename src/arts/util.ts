import * as Recorder from "p5.recorder";
import {Vue} from "vue-class-component";
import {GUI, GUIController} from "dat.gui";
import {p5Instance} from "@/components/P5.vue";

// region Dat.GUI
// region Types
type DatFunction = (unknown) => void;

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
                onChange: DatFunction, list?: Array<unknown>, color?: boolean) {
        this.name = name;
        this.otherName = otherName;
        this.click = false;
        this.min = min;
        this.max = max;
        this.step = step;
        this.onChange = onChange;
        this.list = list;
        this.color = color !== undefined ? color : false;
    }

    addOn(folder: GUI, datParams: Record<string, unknown>): void {
        console.log("Add new parameters", this.name, "in folder", folder.name);
        if (this.otherName !== undefined) {
            //  Button named
            const button: GUIController = folder.add(datParams, this.name).onChange(() => {
                this.click = ! this.click;
                button.name(this.click ? this.otherName : this.name);
                this.onChange(this.click);
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
    params: Record<string, unknown>,
    properties: Record<string, Array<DatProperties>>
}
// endregion Types

export function menu(name: string, min: number, max: number, step: number, onChange?: DatFunction): DatProperties {
    return new DatProperties(name, undefined,  min, max, step, onChange);
}

export function color(name: string, onChange?: DatFunction): DatProperties {
    return new DatProperties(name, undefined, undefined, undefined, undefined,
        onChange,undefined,true);
}

export function button(name: string, onChange: DatFunction): DatProperties {
    return new DatProperties(name,undefined, undefined, undefined, undefined, onChange);
}

export function switchButton(name: string, otherName: string, onChange: DatFunction): DatProperties {
    return new DatProperties(name, otherName, undefined, undefined, undefined, onChange);
}

export function list(name: string, values: Array<unknown>, onChange: DatFunction): DatProperties {
    return new DatProperties(name, undefined, undefined, undefined, undefined, onChange, values);
}
// endregion Dat.GUI

export abstract class ArtVue extends Vue {
    protected gui: GUI;
    private elements: Record<string, unknown>;
    protected p5: p5Instance;
    private rec;
    private recOptions: Record<string, unknown>;

    mounted(): void {
        this.elements = {};
        this.gui = this.generateUI();
        this.rec = new Recorder();
        this.recOptions = {filename: `${this.$route.meta.title}`, fps: 30}
    }

    setupP5(p: p5Instance): void {
        this.p5 = p;
    }

    abstract generateUI(): GUI;

    private generate(datObject: DatObject): void {
        Object.entries(datObject.properties).map(values => {
            const [folderName, properties] = values;
            console.log("Add new Folder", folderName);
            const folder = this.gui.addFolder(folderName);
            properties.map(value => value.addOn(folder, datObject.params));
            folder.open();
        });
    }

    setupDatGUI(datParams: DatObject): GUI {
        datParams.params = {...datParams.params, ...this.elements};
        console.log("Setup dat gui parameters with parameters :", datParams.params);
        this.gui = new GUI();
        this.generate(datParams);
        this.setupSaving();
        return this.gui;
    }

    private setupSaving(): void {
        this.generate({
            params: {
                screen: () => undefined,
                startRecord: () => undefined
            },
            properties: {
                "Save": [
                    button("screen", () => this.p5.saveCanvas(this.$route.meta.title as string, "png")),
                    switchButton("startRecord", "stopRecord", value => {
                        value ? this.rec.start(this.recOptions) : this.rec.stop();
                    })
                ]
            }
        });
    }

    pause(): DatProperties {
        this.addElement("pause", () => undefined);
        return switchButton("pause", "play", value => {
            pause = value;
            value ? this.p5.noLoop() : this.p5.loop();
        });
    }

    seed(onChange?: (seed: number) => void, initialSeed=1): DatProperties {
        this.addElement("seed", initialSeed);
        return menu("seed", 1, 100000, 1,
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
        this.addElement("reset", () => undefined);
        return button("reset", resetFunction);
    }

    private addElement(name: string, value: unknown): void {
        const el = {};
        el[name] = value;
        this.elements = Object.assign(this.elements, el);
    }

    unmounted(): void {
        this.gui.destroy();
        this.p5.removeElements();
    }
}

export let pause = false;
export let seed = 1;

export type GUIType = GUI;
