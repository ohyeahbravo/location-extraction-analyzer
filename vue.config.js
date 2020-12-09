// vue.config.js

module.exports = {
    publicPath:
        process.env.NODE_ENV === 'production'
            ? '/location-extraction-analyzer'
            : '/',
    outputDir: 'docs',
    css: {
        loaderOptions: {
            sass: {
                data: `@import "~@/sass/main.scss";`
            }
        }
    },
    chainWebpack: config => {
        ['vue-modules', 'vue', 'normal-modules', 'normal'].forEach(match => {
            config.module
                .rule('sass')
                .oneOf(match)
                .use('sass-loader')
                .tap(opt =>
                    Object.assign(opt, { data: `@import '~@/sass/main.sass'` })
                );
        });
    }
};
