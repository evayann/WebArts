import {createStore} from "vuex"

export default createStore({
    state: {
        effects: [
            {
                category: "scene",
                arts: [
                    "planetsCircle", "city", "rain", "sunrise",
                    "noiseColor", "lineEffect", "multiScale", "kiss"
                ]
            },
            {
                category: "geometry",
                arts: [
                    "dropGradient", "squareFromLittle", "cubeStack", "geometryNoise",
                    "squareShake", "circleSplit", "squaresLoop", "hypocycloid",
                    "circleSquare", "grid", "roundedRectangle", "lineInCircle",
                    "gridLines", "squareCircleGradient", "chromaCross",
                    "circleAutomata", "boxWaves"
                ]
            },
            {
              category: "shader",
              arts: [
                  "metaballs", "shaderNoise", "spiral", "flags"
              ]
            },
            {
                category: "flow",
                arts: [
                    "vortex", "spiralCube", "pendulum", "lineSphere", "multiParticlesMove",
                    "particlesMove", "particlesNoise", "particlesCompact",
                    "flow", "flow1", "flow2"
                ]
            },
            {
                category: "illusion",
                arts: [
                    "shapeOfShape", "corridorLines", "spiralTunnel",
                    "lineCircle", "overlapWaves", "circleImage", "asciiCam"
                ]
            },
            {
                category: "truchet",
                arts: [
                    "simpleGrid", "noiseTruchet", "multiTruchet"
                ]
            }
        ]
    },
    getters: {
        categories: state => {
            return state.effects.reduce((acc, effect) => {
                return acc.concat(effect.category);
            }, []);
        },
        effects: state => {
            return state.effects;
        },
        effectsName: state => {
            return state.effects.reduce((acc, effect) => {
                return acc.concat(effect.arts);
            }, []);
        }
    },
    mutations: {},
    actions: {},
    modules: {}
})
