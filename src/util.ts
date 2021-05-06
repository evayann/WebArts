import {Vue} from "vue-class-component";
import {Watch} from "vue-property-decorator";

export class UtilVue extends Vue {
    @Watch("parseText")
    protected parseText(text: string): string {
        return text
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, function (str) {
                return str.toUpperCase();
            });
    }
}
