import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
    icons: {
        iconfont: 'fa'
    },
    theme: {
        light: true,
        themes: {
            light: {
                primary: '#26a7de',
                secondary: '#b03060',
                accent: colors.shades.black,
                background: '#f5f5f5',
            }
        }
    },
});
