import {createStore} from "vuex"

export default createStore({
    state: {
        effects: [
            {
                category: "scene",
                arts: [
                    "planetsCircle", "city", "rain",
                    "noiseColor", "lineEffect"
                ]
            },
            {
                category: "geometry",
                arts: [
                    "dropGradient", "squareFromLittle", "cubeStack",
                    "squareShake", "circleSplit", "squaresLoop",
                    "circleSquare", "grid", "squareCircleGradient",
                    "gridLines", "simpleGrid", "circleAutomata",
                    "boxWaves"
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
                    "vortex", "spiralCube", "pendulum", "lineSphere", "particlesMove",
                    "particlesNoise", "particlesCompact", "flow", "flow1", "flow2"
                ]
            },
            {
                category: "illusion",
                arts: [
                    "shapeOfShape", "corridorLines", "spiralTunnel",
                    "lineCircle", "overlapWaves", "circleImage", "asciiCam"
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
