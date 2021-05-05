module.exports = {
    configureWebpack: {
        entry: "./src/main.ts"
    },

    productionSourceMap: false,
    publicPath: process.env.NODE_ENV === "production" ? "/WebArts/" : "/",

    pluginOptions: {
        i18n: {
            locale: 'en',
            fallbackLocale: 'en',
            enableLegacy: false,
            runtimeOnly: false,
            compositionOnly: false,
            fullInstall: true
        }
    }
}
