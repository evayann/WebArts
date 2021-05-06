<script lang="ts">
import * as P5 from "p5";
import {h, VNode} from "vue";
import {p5InstanceExtensions} from "p5";
import {Options, Vue} from "vue-class-component";

// region Events
const initialEvents = [
    "preload", "setup", "draw",
    "deviceMoved", "deviceTurned", "deviceShaken",

    "keyPressed", "keyReleased", "keyTyped",
    "mouseMoved", "mouseDragged", "mousePressed",
    "mouseReleased", "mouseClicked", "doubleClicked", "mouseWheel",

    "touchStarted", "touchMoved", "touchEnded",
    "windowResized"
];
// endregion Events

// region Utilities
export let width: number = window.innerWidth;
export let height: number = window.innerHeight;
export let halfWidth: number = width / 2;
export let halfHeight: number = height / 2;
export let quarterWidth: number = halfWidth / 2;
export let quarterHeight: number = halfHeight / 2;
// endregion Utilities

@Options({
    name: "P5Vue",
    props: {
        canvas3D: {
            type: Boolean,
            default: false
        }
    }
})
export class P5Vue extends Vue {
    private canvas3D!: boolean;
    private p5: P5;

    private setup(p5: p5InstanceExtensions): void {
        console.log(`Log setup canvas of size : ${width}x${height} of type ${this.canvas3D ? "3D" : "2D"}`);
        p5.createCanvas(width, height, this.canvas3D ? p5.WEBGL : p5.P2D);
        P5Vue.resize(p5);
    }

    private static resize(p5: p5InstanceExtensions): void {
        console.log("Auto resize");

        width = window.innerWidth;
        halfWidth = width / 2;
        quarterWidth = halfWidth / 2;

        height = window.innerHeight;
        halfHeight = height / 2;
        quarterHeight = halfHeight / 2;

        p5.resizeCanvas(width, height);
    }

    mounted(): void {
        console.log("Mount p5.vue");
        this.p5 = new P5(sketch => {
            this.$emit("sketch", sketch);

            // Default methods
            sketch["setup"] = this.setup;
            sketch["windowResized"] = P5Vue.resize;

            // Setup all events
            for (const p5EventName of initialEvents) {
                const vueEventName: string = p5EventName.toLowerCase();
                const savedCallback = sketch[p5EventName];
                sketch[p5EventName] = (...args) => {
                    if (savedCallback)
                        savedCallback(sketch, ...args);
                    this.$emit(vueEventName, sketch, ...args);
                };
            }
        }, this.$el);
    }

    unmounted(): void {
        console.log("Unmount p5.vue");
        this.p5.remove();
    }

    render(): VNode {
        return h("div");
    }
}

export {P5};
export type p5Instance = p5InstanceExtensions;
export default (vue) => {
    vue.component("P5Vue", P5Vue);
};
</script>