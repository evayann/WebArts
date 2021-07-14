module.exports = {
    configureWebpack: {
        entry: "./src/main.ts"
    },

    pwa: {
        appleMobileWebAppCapable: "yes",
        manifestOptions: {
            short_name: "WA",
            name: "WebArts",
            start_url: ".",
            display: "standalone",
            theme_color: "#FFFFFF",
            icons: [
                {
                    src: "./favicon.png",
                    type: "image/png",
                    sizes: "96x96"
                }
            ]
        },
        iconPaths: {
            faviconSVG: null,
            favicon32: "./favicon.png",
            favicon16: null,
            appleTouchIcon: "./favicon.png",
            maskIcon: null,
            msTileImage: null
        }
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
