<template>
    <P5Vue @setup="this.setupP5" @windowResize="this.resizeP5"></P5Vue>
</template>

<script lang="ts">
import Art from "@/arts/multiScale/MultiScale.vue";
import {P5, p5Instance} from "@/components/P5.vue";
import {GUIType} from "@/arts/art";
import {shuffle} from "@/arts/util";
// Inspired from https://github.com/DRynne/Multiscale-Truchet

const motifs: Array<string> = "/,\\,-,|,+.,x.,+,fne,fsw,fnw,fse,tn,ts,te,tw".split(",");

function tile(p: p5Instance, x: number, y: number, w: number, h: number, color: P5.Color, depth: number): void {
    w /= 2;
    h /= 2;
    const smallrx: number = w / 3;
    const smallry: number = h / 3;
    const bigrx: number = 2 * smallrx;
    const bigry: number = 2 * smallry;
    const arcdx: number = 2 * 2 * bigrx;
    const arcdy: number = 2 * 2 * bigry;

    let c, c2;
    if (depth % 2 == 0) {
        c = color;
        c2 = "black";
    }
    else {
        c = "black";
        c2 = color;
    }

    p.fill(c);
    p.rect(x, y, w, h);
    p.fill(c2);

    let motif = shuffle(motifs)[0];
    switch (motif) {
        case "\\":
            p.arc(x + w, y - h, arcdx, arcdy, p.PI / 2, p.PI);
            p.arc(x - w, y + h, arcdx, arcdy, 3 * p.PI / 2, 2 * p.PI);
            break;
        case "/":
            p.arc(x - w, y - h, arcdx, arcdy, 0, p.PI / 2);
            p.arc(x + w, y + h, arcdx, arcdy, p.PI, 3 * p.PI / 2);
            break;
        case "-":
            p.rect(x, y, w, smallry);
            break;
        case "|":
            p.rect(x, y, smallrx, h);
            break;
        case "+.":
            break;
        case "x.":
            p.fill(c2);
            p.rect(x, y, w, h);
            break;
        case "+":
            p.rect(x, y, w, smallry);
            p.rect(x, y, smallrx, h);
            break;
        case "fne":
            p.arc(x + w, y - h, arcdx, arcdy, p.PI / 2, p.PI);
            break;
        case "fsw":
            p.arc(x - w, y + h, arcdx, arcdy, 3 * p.PI / 2, 2 * p.PI);
            break;
        case "fnw":
            p.arc(x - w, y - h, arcdx, arcdy, 0, p.PI / 2);
            break;
        case "fse":
            p.arc(x + w, y + h, arcdx, arcdy, p.PI, 3 * p.PI / 2);
            break;
        case "tn":
            p.fill(c2);
            p.rect(x, y - smallry, w, bigry);
            break;
        case "ts":
            p.fill(c2);
            p.rect(x, y + smallry, w, bigry);
            break;
        case "te":
            p.fill(c2);
            p.rect(x + smallrx, y, bigrx, h);
            break;
        case "tw":
            p.fill(c2);
            p.rect(x - smallrx, y, bigrx, h);
            break;
        default:
            break;
    }

    p.fill(c);
    p.ellipse(x - w, y - h, 2 * bigrx, 2 * bigry);
    p.ellipse(x + w, y - h, 2 * bigrx, 2 * bigry);
    p.ellipse(x - w, y + h, 2 * bigrx, 2 * bigry);
    p.ellipse(x + w, y + h, 2 * bigrx, 2 * bigry);

    p.fill(c2);
    p.ellipse(x, y - h, 2 * smallrx, 2 * smallry);
    p.ellipse(x + w, y, 2 * smallrx, 2 * smallry);
    p.ellipse(x, y + h, 2 * smallrx, 2 * smallry);
    p.ellipse(x - w, y, 2 * smallrx, 2 * smallry);
}

export default class MultiScale extends Art {
    setupP5(p: p5Instance): void {
        super.setupP5(p);
        p.angleMode(p.RADIANS);
        p.rectMode(p.RADIUS);
        p.noStroke();
        this.setDrawer(tile);
    }

    generateUI(): GUIType {
        return super.generateUI();
    }
}
</script>