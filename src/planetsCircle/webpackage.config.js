const path = require("path");
let webpack = require('webpack');

let ignore = new webpack.IgnorePlugin(new RegExp("/(node_modules|ckeditor)/"))

module.exports = {
    mode: "development",
    entry: "./src/planetsCircle/planetsCircle.ts",
    output: {
        path: path.join(__dirname, "../../dist/planetsCircle"),
        filename: "planetsCircleBundle.js"
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /(node_modules)/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    plugins: [
        ignore
    ]
}