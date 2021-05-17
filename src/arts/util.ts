export function shuffle<T>(array: Array<T>): Array<T> {
    for (let i = array.length - 1; i--;) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function range(end: number, start=0, step=1) {
    function* generateRange() {
        let x = start - step;
        while(x < end - step) yield x += step;
    }
    return {[Symbol.iterator]: generateRange};
}