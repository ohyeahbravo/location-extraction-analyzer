<template>
    <v-simple-table
        class="tooltip"
        :style="placement"
        dark
		dense
    >
        <tbody>
            <tr v-for="(item, idx) in info" v-bind:key="idx">
                <td class="text-sm-right mr-0 pr-0" :style="getStyleWithColor(item.set)">{{ item.set }}</td>
                <td class="text-sm-left">{{ item.value }}</td>
            </tr>
        </tbody>
    </v-simple-table>
</template>

<script>
import chroma from "chroma-js";

export default {
    name: 'ChartTooltip',

    data() {
        return {
            info: [],
            placement: {
                display: 'none'
            }
        };
    },

    methods: {
		getStyleWithColor(set) {
			let color = chroma(this.$store.state.sets[set].color).css();
			return {color: color};
		},

        getCountryName(code) {
            if (!this.country_lookup)
                this.country_lookup = require('country-js');
            let info = this.country_lookup.search(code)[0];
            let result = '';
            if (!info) {
                // Kosovo (XK) not in the library
                if (code.toLowerCase() == 'xk') result = 'Kosovo';
                else result = '';
            } else {
                result = info.name;
            }
            return result;
        },
        setTooltip(info, x, y, size) {
            this.info = info;
            this.placement.left = String(x + size + 10) + 'px';
            this.placement.top = String(y) + 'px';
            this.placement.display = 'block';
        },
        hideTooltip() {
            this.placement.display = 'none';
        }
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Baloo&display=swap&subset=latin-ext');

.tooltip {
    position: absolute;
    font-family: 'Baloo', cursive;
}
</style>
